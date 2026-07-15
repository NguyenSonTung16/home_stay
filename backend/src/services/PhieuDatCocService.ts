import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { GiuongRepository } from '../repositories/GiuongRepository';
import { KhachHangRepository } from '../repositories/KhachHangRepository';
import { PaypalService } from './PaypalService';
import { EmailService } from './EmailService';
import { db } from '../config/db';
import cron from 'node-cron';

export class PhieuDatCocService {
  private repo = new PhieuDatCocRepository();
  private giuongRepo = new GiuongRepository();
  private khRepo = new KhachHangRepository();
  private paypalService = new PaypalService();

  // ─────────────────────────────────────────────────────────────────────────
  // 1. TẠO PHIẾU ĐẶT CỌC (POST /dat-coc)
  // ─────────────────────────────────────────────────────────────────────────
  async taoDatCoc(maKH: number, maGiuong: number | null, soGiuongThue: number, maPhong?: number | null): Promise<any> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      let targetGiuongId = maGiuong;

      // Nếu không truyền trực tiếp maGiuong mà truyền maPhong, tự động tìm giường trống
      if (!targetGiuongId && maPhong) {
        const availableBeds = await client.query(
          `SELECT MaGiuong FROM Giuong WHERE MaPhong = $1 AND TrangThaiStr = 'Trong' ORDER BY MaGiuong LIMIT 1 FOR UPDATE`,
          [maPhong]
        );
        if (availableBeds.rows.length === 0) {
          throw { status: 409, message: 'Phòng đã hết giường trống' };
        }
        targetGiuongId = availableBeds.rows[0].magiuong;
      }

      if (!targetGiuongId) {
        throw { status: 400, message: 'Vui lòng cung cấp maGiuong hoặc maPhong hợp lệ' };
      }

      // SELECT ... FOR UPDATE để lock giường, tránh race condition
      const giuong = await this.giuongRepo.layTheoIdForUpdate(client, targetGiuongId);
      if (!giuong) throw { status: 404, message: `Không tìm thấy giường #${targetGiuongId}` };

      if (giuong.trangthaistr !== 'Trong') {
        throw { status: 409, message: `Giường #${targetGiuongId} đang ${giuong.trangthaistr}, không thể đặt cọc` };
      }

      // Lấy giá tiền từ LoaiPhong
      const phongRes = await client.query(
        `SELECT p.MaPhong, p.TenPhong, lp.GiaTien
         FROM Phong p JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
         WHERE p.MaPhong = $1`,
        [giuong.maphong]
      );
      if (phongRes.rows.length === 0) throw { status: 404, message: 'Không tìm thấy phòng tương ứng' };

      const tienThuePerThang = parseFloat(phongRes.rows[0].giatien);
      // TienCoc = TienThue2Thang * SoGiuongThue (spec)
      const tienCoc = tienThuePerThang * 2 * soGiuongThue;
      const thoiGianHetHan = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Tạo phiếu
      const phieu = await this.repo.taoPhieu(client, {
        maKH,
        maGiuong: targetGiuongId,
        maPhong: giuong.maphong,
        soGiuongThue,
        tienThuePerThang,
        tienCoc,
        thoiGianHetHan,
      });

      // Cập nhật Giuong → DangGiuCho
      await this.giuongRepo.capNhatTrangThaiStr(client, targetGiuongId, 'DangGiuCho');

      await client.query('COMMIT');

      return {
        maPDC: phieu.macoc,
        tienCoc,
        tienThuePerThang,
        soGiuongThue,
        thoiGianHetHan,
        tenPhong: phongRes.rows[0].tenphong,
        huongDanThanhToan: 'Vui lòng hoàn tất thanh toán trong 24 giờ để xác nhận đặt cọc.',
      };
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. TẠO THANH TOÁN ONLINE (POST /dat-coc/:maPDC/thanh-toan-online)
  // ─────────────────────────────────────────────────────────────────────────
  async taoThanhToanOnline(maPDC: number): Promise<any> {
    const phieu = await this.repo.layTheoId(maPDC);
    if (!phieu) throw { status: 404, message: `Không tìm thấy phiếu đặt cọc #${maPDC}` };

    if (phieu.trangthaimoi !== 'ChoThanhToan') {
      throw { status: 400, message: `Phiếu #${maPDC} không ở trạng thái ChoThanhToan (hiện: ${phieu.trangthaimoi})` };
    }

    if (new Date(phieu.thoigianhethan) < new Date()) {
      throw { status: 410, message: 'Phiếu đặt cọc đã hết hạn' };
    }

    // Tỷ giá 25000 VND/USD (giống DonHangService)
    const amountUSD = Number(phieu.tiencoc) / 25000;
    const referenceId = `DATCOC_${maPDC}_${Date.now()}`;

    const paypalOrder = await this.paypalService.createOrder(amountUSD, referenceId);
    const approveLinkObj = paypalOrder.links?.find((l: any) => l.rel === 'approve');
    if (!approveLinkObj) throw { status: 500, message: 'Không tìm thấy link thanh toán PayPal' };

    const approveUrl = approveLinkObj.href;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(approveUrl)}`;

    // Cập nhật PhuongThucThanhToan = ChuyenKhoan, ghi PayPal Order ID tạm
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE PhieuDatCoc SET PhuongThucThanhToan = 'ChuyenKhoan', MaGiaoDich = $1 WHERE MaCoc = $2`,
        [paypalOrder.id, maPDC]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return {
      maPDC,
      paypalOrderId: paypalOrder.id,
      approveUrl,
      qrImageUrl,
      tienCoc: Number(phieu.tiencoc),
      thoiGianHetHan: phieu.thoigianhethan,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. WEBHOOK XÁC NHẬN THANH TOÁN ONLINE (POST /webhook/dat-coc)
  // ─────────────────────────────────────────────────────────────────────────
  async xuLyWebhookDatCoc(maGiaoDich: string): Promise<{ processed: boolean }> {
    // Idempotency: đã xử lý chưa?
    const existing = await this.repo.layTheoMaGiaoDich(maGiaoDich);
    if (existing) {
      console.log(`[PhieuDatCocService] Webhook maGiaoDich=${maGiaoDich} đã xử lý trước đó.`);
      return { processed: false };
    }

    // Tìm phiếu theo maGiaoDich (PayPal Order ID)
    const phieuRes = await db.query(
      `SELECT * FROM PhieuDatCoc WHERE MaGiaoDich = $1 AND TrangThaiMoi = 'ChoThanhToan'`,
      [maGiaoDich]
    );
    if (phieuRes.rows.length === 0) {
      console.warn(`[PhieuDatCocService] Không tìm thấy phiếu ChoThanhToan với maGiaoDich=${maGiaoDich}`);
      return { processed: false };
    }
    const phieu = phieuRes.rows[0];

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Lock phiếu
      const lockedPhieu = await this.repo.layTheoIdForUpdate(client, phieu.macoc);
      if (!lockedPhieu || lockedPhieu.trangthaimoi !== 'ChoThanhToan') {
        await client.query('ROLLBACK');
        return { processed: false };
      }

      // Cập nhật PhieuDatCoc → DaThanhToan
      await this.repo.capNhatTrangThai(client, phieu.macoc, 'DaThanhToan', { maGiaoDich });

      // Cập nhật Giuong → DaCoc (ONLY here)
      await this.giuongRepo.capNhatTrangThaiStr(client, phieu.magiuong, 'DaCoc');

      await client.query('COMMIT');

      // Gửi email sau commit (async, không block)
      this.guiEmailXacNhanDatCoc(phieu).catch(err =>
        console.error('[PhieuDatCocService] Lỗi gửi email xác nhận cọc:', err)
      );

      return { processed: true };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[PhieuDatCocService] Webhook transaction rollback:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. GỬI CHỨNG TỪ TIỀN MẶT (POST /dat-coc/:maPDC/thanh-toan-tien-mat)
  // ─────────────────────────────────────────────────────────────────────────
  async guiChungTuTienMat(maPDC: number, maHoaDonTienMat: string, urlChungTu: string): Promise<any> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const phieu = await this.repo.layTheoIdForUpdate(client, maPDC);
      if (!phieu) throw { status: 404, message: `Không tìm thấy phiếu #${maPDC}` };

      if (!['ChoThanhToan', 'ChoXacNhanTienMat'].includes(phieu.trangthaimoi)) {
        throw { status: 400, message: `Phiếu không thể gửi chứng từ ở trạng thái ${phieu.trangthaimoi}` };
      }
      if (new Date(phieu.thoigianhethan) < new Date()) {
        throw { status: 410, message: 'Phiếu đặt cọc đã hết hạn' };
      }

      await this.repo.capNhatTrangThai(client, maPDC, 'ChoXacNhanTienMat', {
        maHoaDonTienMat,
        urlChungTu,
        maGiaoDich: `TIENMAT_${maPDC}_${Date.now()}`,
      });

      // Cập nhật PhuongThucThanhToan
      await client.query(
        `UPDATE PhieuDatCoc SET PhuongThucThanhToan = 'TienMat' WHERE MaCoc = $1`,
        [maPDC]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Đã gửi chứng từ, chờ Quản lý xác nhận.' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. XÁC NHẬN TIỀN MẶT (POST /dat-coc/:maPDC/xac-nhan-tien-mat)
  //    Chỉ dành cho VaiTro = 'QuanLy'
  // ─────────────────────────────────────────────────────────────────────────
  async xacNhanTienMat(maPDC: number, maNhanVien: number, duyet: boolean): Promise<any> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const phieu = await this.repo.layTheoIdForUpdate(client, maPDC);
      if (!phieu) throw { status: 404, message: `Không tìm thấy phiếu #${maPDC}` };

      if (phieu.trangthaimoi !== 'ChoXacNhanTienMat') {
        throw { status: 400, message: `Phiếu #${maPDC} không ở trạng thái ChoXacNhanTienMat` };
      }

      if (duyet) {
        // Duyệt: → DaThanhToan + Giuong → DaCoc
        await this.repo.capNhatTrangThai(client, maPDC, 'DaThanhToan', { nguoiXacNhan: maNhanVien });
        await this.giuongRepo.capNhatTrangThaiStr(client, phieu.magiuong, 'DaCoc');
        await client.query('COMMIT');

        // Gửi email
        const phieuFull = await this.repo.layTheoId(maPDC);
        this.guiEmailXacNhanDatCoc(phieuFull).catch(console.error);

        return { success: true, message: 'Đã xác nhận thanh toán tiền mặt. Giường chuyển DaCoc.' };
      } else {
        // Từ chối: quay về ChoThanhToan, giường vẫn DangGiuCho
        await this.repo.capNhatTrangThai(client, maPDC, 'ChoThanhToan', {});
        await client.query('COMMIT');
        return { success: true, message: 'Đã từ chối. Khách hàng cần gửi lại chứng từ.' };
      }
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CRON JOB — HỦY PHIẾU QUÁ HẠN (chạy mỗi 5 phút)
  // ─────────────────────────────────────────────────────────────────────────
  async huyPhieuQuaHan(): Promise<void> {
    const phieuList = await this.repo.layPhieuQuaHan();
    console.log(`[PhieuDatCocService] Cron: Tìm thấy ${phieuList.length} phiếu quá hạn.`);

    for (const phieu of phieuList) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const locked = await this.repo.layTheoIdForUpdate(client, phieu.macoc);

        // Double-check sau lock
        if (!locked || !['ChoThanhToan', 'ChoXacNhanTienMat'].includes(locked.trangthaimoi)) {
          await client.query('ROLLBACK');
          continue;
        }

        await this.repo.capNhatTrangThai(client, phieu.macoc, 'DaHuy', {});
        if (phieu.magiuong) {
          await this.giuongRepo.capNhatTrangThaiStr(client, phieu.magiuong, 'Trong');
        } else if (phieu.maphong) {
          // Fallback: nhả giường theo phòng (phiếu cũ không có magiuong)
          await client.query(
            `UPDATE Giuong SET TrangThai = 0, TrangThaiStr = 'Trong'
             WHERE MaPhong = $1 AND TrangThaiStr = 'DangGiuCho'`,
            [phieu.maphong]
          );
        }

        await client.query('COMMIT');
        console.log(`[PhieuDatCocService] Đã hủy phiếu #${phieu.macoc}, nhả giường #${phieu.magiuong}`);

        // Gửi email hủy async
        this.guiEmailHuyDatCoc(phieu).catch(console.error);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[PhieuDatCocService] Lỗi hủy phiếu #${phieu.macoc}:`, err);
      } finally {
        client.release();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. POLLING TRẠNG THÁI (GET /dat-coc/:maPDC/status)
  // ─────────────────────────────────────────────────────────────────────────
  async layTrangThai(maPDC: number): Promise<any> {
    let phieu = await this.repo.layTheoId(maPDC);
    if (!phieu) throw { status: 404, message: `Không tìm thấy phiếu #${maPDC}` };

    // Auto-capture nếu ở trạng thái ChoThanhToan và có mã giao dịch PayPal
    if (phieu.trangthaimoi === 'ChoThanhToan' && phieu.magiaodich && phieu.phuongthucthanhtoan === 'ChuyenKhoan') {
      try {
        const orderData = await this.paypalService.getOrder(phieu.magiaodich);
        if (orderData.status === 'APPROVED') {
          console.log(`[PhieuDatCocService] Phát hiện Order ${phieu.magiaodich} APPROVED. Tiến hành capture...`);
          const captureData = await this.paypalService.captureOrder(phieu.magiaodich);
          if (captureData.status === 'COMPLETED') {
            await this.xuLyWebhookDatCoc(phieu.magiaodich);
            phieu = await this.repo.layTheoId(maPDC); // reload phieu
          }
        } else if (orderData.status === 'COMPLETED') {
          // Trường hợp PayPal đã hoàn thành nhưng DB chưa cập nhật
          console.log(`[PhieuDatCocService] Phát hiện Order ${phieu.magiaodich} COMPLETED. Đồng bộ DB...`);
          await this.xuLyWebhookDatCoc(phieu.magiaodich);
          phieu = await this.repo.layTheoId(maPDC); // reload phieu
        }
      } catch (err: any) {
        console.error(`[PhieuDatCocService] Lỗi tự động capture/kiểm tra đơn PayPal ${phieu.magiaodich}:`, err.message);
      }
    }

    return {
      maPDC: phieu.macoc,
      trangThai: phieu.trangthaimoi,
      tienCoc: Number(phieu.tiencoc),
      thoiGianHetHan: phieu.thoigianhethan,
      tenPhong: phieu.tenphong,
      phuongThuc: phieu.phuongthucthanhtoan,
      urlChungTu: phieu.urlchungtu,
      thoiGianXacNhan: phieu.thoigianxacnhan,
      maGiaoDich: phieu.magiaodich,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMAIL HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  private async guiEmailXacNhanDatCoc(phieu: any): Promise<void> {
    const email = phieu.email;
    const ten = phieu.hoten || 'Quý khách';
    if (!email) return;

    await EmailService.sendMail({
      to: email,
      subject: `[FIT 4.0 HomeStay] Xác nhận đặt cọc thành công — Phiếu #${phieu.macoc}`,
      text: `Chào ${ten}, đặt cọc phiếu #${phieu.macoc} đã được xác nhận thành công. Số tiền: ${Number(phieu.tiencoc).toLocaleString()}đ.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#10B981;margin-top:0">✅ Đặt Cọc Thành Công</h2>
          <p>Chào <strong>${ten}</strong>,</p>
          <p>Hệ thống xác nhận bạn đã <strong>đặt cọc thành công</strong>:</p>
          <table style="width:100%;border-collapse:collapse;margin:15px 0">
            <tr><td style="padding:8px 0;color:#6b7280">Mã phiếu:</td><td style="font-weight:bold">#${phieu.macoc}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Phòng:</td><td style="font-weight:bold">${phieu.tenphong || ''}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Số tiền cọc:</td><td style="font-weight:bold;color:#10B981;font-size:16px">${Number(phieu.tiencoc).toLocaleString()}đ</td></tr>
          </table>
          <p>Cảm ơn bạn đã sử dụng dịch vụ FIT 4.0 HomeStay!</p>
        </div>
      `,
    });
  }

  private async guiEmailHuyDatCoc(phieu: any): Promise<void> {
    const email = phieu.email;
    const ten = phieu.hoten || 'Quý khách';
    if (!email) return;

    await EmailService.sendMail({
      to: email,
      subject: `[FIT 4.0 HomeStay] Phiếu đặt cọc #${phieu.macoc} đã bị hủy do hết hạn`,
      text: `Chào ${ten}, phiếu đặt cọc #${phieu.macoc} đã bị hủy tự động do quá 24 giờ chưa hoàn tất thanh toán.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#EF4444;margin-top:0">⏰ Phiếu Đặt Cọc Đã Hết Hạn</h2>
          <p>Chào <strong>${ten}</strong>,</p>
          <p>Phiếu đặt cọc <strong>#${phieu.macoc}</strong> đã bị hủy tự động do quá 24 giờ chưa hoàn tất thanh toán.</p>
          <p>Giường đã được nhả ra. Bạn có thể đặt lại bất cứ lúc nào.</p>
        </div>
      `,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATIC: KHỞI ĐỘNG CRON JOB
  // ─────────────────────────────────────────────────────────────────────────
  public static startCronJob(): void {
    console.log('[PhieuDatCocService] Khởi động Cron Job hủy phiếu cọc quá hạn mỗi 5 phút...');
    cron.schedule('*/5 * * * *', async () => {
      console.log('[Cron PhieuDatCoc] Bắt đầu quét phiếu cọc quá hạn...');
      try {
        const service = new PhieuDatCocService();
        await service.huyPhieuQuaHan();
      } catch (err) {
        console.error('[Cron PhieuDatCoc] Lỗi:', err);
      }
    });
  }
}
