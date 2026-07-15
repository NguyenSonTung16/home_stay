import { DonHangRepository } from '../repositories/DonHangRepository';
import { HoaDonDienNuocRepository } from '../repositories/HoaDonDienNuocRepository';
import { HoaDonPhiDinhKyRepository } from '../repositories/HoaDonPhiDinhKyRepository';
import { DonHangDTO, DonHangTrangThai } from '../models/DonHangDTO';
import { PaypalService } from './PaypalService';
import { EmailService } from './EmailService';
import { db } from '../config/db';
import cron from 'node-cron';

export class DonHangService {
  private repository = new DonHangRepository();
  private dienNuocRepo = new HoaDonDienNuocRepository();
  private phiDinhKyRepo = new HoaDonPhiDinhKyRepository();
  private paypalService = new PaypalService();

  /**
   * Tạo đơn hàng nháp và trả về mã QR thanh toán (approve link)
   */
  public async taoMaQR(
    loaiHoaDon: 'DienNuoc' | 'PhiDinhKy' | 'DatCoc',
    phuongThuc: string,
    maHoaDon: number,
    idempotencyKey?: string
  ): Promise<any> {
    // 1. Kiểm tra Idempotency Key chống double-submit
    if (idempotencyKey) {
      const activeOrder = await this.repository.layTheoIdempotencyKey(idempotencyKey);
      if (activeOrder) {
        // Nếu đã tồn tại đơn hàng với idempotencyKey này và chưa hết hạn, tái sử dụng nó
        if (new Date(activeOrder.thoigianhethan) > new Date() && activeOrder.trangthai === DonHangTrangThai.DangCho) {
          const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${activeOrder.madh}`;
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(approveUrl)}`;
          return {
            maDH: activeOrder.madh,
            qrImageUrl,
            tongTien: Number(activeOrder.tongtien),
            thoiGianHetHan: activeOrder.thoigianhethan
          };
        }
      }
    }

    // 2. Lấy thông tin hóa đơn và số tiền cần thanh toán
    let tongTien = 0;
    if (loaiHoaDon === 'DienNuoc') {
      const hddn = await this.dienNuocRepo.layTheoId(maHoaDon);
      if (!hddn) throw new Error(`Không tìm thấy hóa đơn điện nước #${maHoaDon}`);
      if (hddn.trangthai === 'DaThanhToan') throw new Error('Hóa đơn điện nước đã được thanh toán trước đó');
      tongTien = Number(hddn.tongtien);
    } else if (loaiHoaDon === 'PhiDinhKy') {
      const pdk = await this.phiDinhKyRepo.layTheoId(maHoaDon);
      if (!pdk) throw new Error(`Không tìm thấy hóa đơn định kỳ #${maHoaDon}`);
      if (pdk.trangthai === 'DaThanhToan') throw new Error('Hóa đơn định kỳ đã được thanh toán trước đó');
      tongTien = Number(pdk.tongtien);
    } else if (loaiHoaDon === 'DatCoc') {
      const pdc = await db.query('SELECT * FROM PhieuDatCoc WHERE MaCoc = $1', [maHoaDon]);
      if (pdc.rows.length === 0) throw new Error(`Không tìm thấy phiếu đặt cọc #${maHoaDon}`);
      if (pdc.rows[0].trangthai === 3) throw new Error('Phiếu đặt cọc đã được thanh toán trước đó');
      tongTien = Number(pdc.rows[0].sotien);
    } else {
      throw new Error('Loại hóa đơn không hợp lệ');
    }

    // 3. Quy đổi tiền sang USD (tỷ giá 25000) để gọi PayPal
    const amountUSD = tongTien / 25000;
    const referenceId = `${loaiHoaDon}_${maHoaDon}_${Date.now()}`;

    // 4. Tạo Order trên PayPal sandbox
    const paypalOrder = await this.paypalService.createOrder(amountUSD, referenceId);
    const maDH = paypalOrder.id; // Lấy Order ID làm mã đơn hàng

    // Lấy link approve từ PayPal
    const approveLinkObj = paypalOrder.links.find((l: any) => l.rel === 'approve');
    if (!approveLinkObj) throw new Error('Không tìm thấy link thanh toán từ PayPal');
    const approveUrl = approveLinkObj.href;

    // Tạo QR code image URL
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(approveUrl)}`;

    // Thiết lập thời gian hết hạn (15 phút kể từ lúc tạo)
    const thoiGianHetHan = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Lưu đơn hàng vào cơ sở dữ liệu
    const donHang = await this.repository.taoDonHang(
      maDH,
      loaiHoaDon,
      phuongThuc,
      tongTien,
      maHoaDon,
      thoiGianHetHan,
      idempotencyKey
    );

    return {
      maDH: donHang.madh,
      qrImageUrl,
      tongTien: Number(donHang.tongtien),
      thoiGianHetHan: donHang.thoigianhethan
    };
  }

  /**
   * Chuyển trạng thái đơn hàng (sử dụng Transaction để đảm bảo tính nhất quán dữ liệu)
   */
  public async chuyenTTDonHang(maDH: string, trangThai: DonHangTrangThai): Promise<boolean> {
    // 1. Kiểm tra đơn hàng hiện tại
    const donHang = await this.repository.layTheoId(maDH);
    if (!donHang) {
      throw new Error(`Không tìm thấy đơn hàng ${maDH}`);
    }

    // Nếu webhook báo thành công nhưng đơn đã thanh toán trước đó -> Bỏ qua tránh trùng lặp
    if (trangThai === DonHangTrangThai.DaThanhToan && donHang.trangthai === DonHangTrangThai.DaThanhToan) {
      console.log(`[DonHangService] Đơn hàng ${maDH} đã được xử lý thanh toán thành công trước đó.`);
      return true;
    }

    // 2. Mở DB Transaction thông qua client kết nối chung
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Cập nhật trạng thái đơn hàng
      const updatedDH = await this.repository.capNhatTTWithClient(client, maDH, trangThai);
      if (!updatedDH) throw new Error(`Lỗi cập nhật trạng thái đơn hàng ${maDH}`);

      // Nếu trạng thái mới là DaThanhToan -> Cập nhật tương ứng hóa đơn gốc thành DaThanhToan
      if (trangThai === DonHangTrangThai.DaThanhToan) {
        if (donHang.loaihoadon === 'DienNuoc') {
          const queryUpdateBill = `UPDATE HoaDonDienNuoc SET TrangThai = 'DaThanhToan' WHERE MaHDDN = $1`;
          await client.query(queryUpdateBill, [donHang.mahoadon]);
        } else if (donHang.loaihoadon === 'PhiDinhKy') {
          const queryUpdateBill = `UPDATE HoaDonPhiDinhKy SET TrangThai = 'DaThanhToan' WHERE MaPDK = $1`;
          await client.query(queryUpdateBill, [donHang.mahoadon]);
        } else if (donHang.loaihoadon === 'DatCoc') {
          const queryUpdateBill = `UPDATE PhieuDatCoc SET TrangThai = 2, PTThanhToan = 'PayPal', MaGiaoDich = $2 WHERE MaCoc = $1`;
          await client.query(queryUpdateBill, [donHang.mahoadon, maDH]);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[DonHangService] Transaction rollback do lỗi:`, error);
      throw error;
    } finally {
      client.release();
    }

    // 3. Sau khi commit thành công -> Gửi email bất đồng bộ cho khách hàng nếu là DaThanhToan
    if (trangThai === DonHangTrangThai.DaThanhToan) {
      this.guiEmailXacNhan(donHang).catch(err => console.error('Lỗi gửi email xác nhận:', err));
    }

    return true;
  }

  /**
   * Lấy chi tiết đơn hàng (Dùng cho polling status)
   */
  public async layChiTiet(maDH: string): Promise<DonHangDTO | null> {
    let donHang = await this.repository.layTheoId(maDH);
    if (!donHang) return null;

    // Auto-capture nếu ở trạng thái DangCho và phương thức là Chuyển khoản (PayPal)
    if (donHang.trangthai === DonHangTrangThai.DangCho && donHang.phuongthuc === 'ChuyenKhoan') {
      try {
        const orderData = await this.paypalService.getOrder(maDH);
        if (orderData.status === 'APPROVED') {
          console.log(`[DonHangService] Phát hiện Order ${maDH} APPROVED. Tiến hành capture...`);
          const captureData = await this.paypalService.captureOrder(maDH);
          if (captureData.status === 'COMPLETED') {
            await this.chuyenTTDonHang(maDH, DonHangTrangThai.DaThanhToan);
            donHang = await this.repository.layTheoId(maDH); // reload
          }
        } else if (orderData.status === 'COMPLETED') {
          console.log(`[DonHangService] Phát hiện Order ${maDH} COMPLETED. Đồng bộ DB...`);
          await this.chuyenTTDonHang(maDH, DonHangTrangThai.DaThanhToan);
          donHang = await this.repository.layTheoId(maDH); // reload
        }
      } catch (err: any) {
        console.error(`[DonHangService] Lỗi tự động capture/kiểm tra đơn PayPal ${maDH}:`, err.message);
      }
    }

    return donHang;
  }

  /**
   * Gửi email thông báo thanh toán thành công cho khách hàng
   */
  private async guiEmailXacNhan(donHang: DonHangDTO): Promise<void> {
    try {
      let emailKhach = '';
      let tenKhach = '';
      let tenKhoanChi = '';

      if (donHang.loaihoadon === 'DienNuoc') {
        tenKhoanChi = `Hóa đơn Điện Nước điện tháng (Mã #${donHang.mahoadon})`;
        const query = `
          SELECT k.Email, k.HoTen
          FROM Phong p
          JOIN Giuong g ON g.MaPhong = p.MaPhong
          JOIN ChiTietGiuong ctg ON ctg.MaGiuong = g.MaGiuong
          JOIN HopDong h ON h.MaHD = ctg.MaHD
          JOIN KhachHang k ON k.MaKH = h.MaKHDaiDien
          JOIN HoaDonDienNuoc hddn ON hddn.MaPhong = p.MaPhong
          WHERE hddn.MaHDDN = $1
          LIMIT 1
        `;
        const res = await db.query(query, [donHang.mahoadon]);
        if (res.rows.length > 0) {
          emailKhach = res.rows[0].email;
          tenKhach = res.rows[0].hoten;
        }
      } else {
        tenKhoanChi = `Hóa đơn Phí Định Kỳ tháng (Mã #${donHang.mahoadon})`;
        const query = `
          SELECT k.Email, k.HoTen
          FROM HopDong h
          JOIN KhachHang k ON k.MaKH = h.MaKHDaiDien
          JOIN HoaDonPhiDinhKy pdk ON pdk.MaHD = h.MaHD
          WHERE pdk.MaPDK = $1
          LIMIT 1
        `;
        const res = await db.query(query, [donHang.mahoadon]);
        if (res.rows.length > 0) {
          emailKhach = res.rows[0].email;
          tenKhach = res.rows[0].hoten;
        }
      }

      if (!emailKhach) {
        console.warn(`[DonHangService] Không tìm thấy thông tin email của khách thuê cho đơn hàng ${donHang.madh}`);
        return;
      }

      await EmailService.sendMail({
        to: emailKhach,
        subject: `[FIT 4.0 HomeStay] Xác nhận thanh toán thành công đơn hàng #${donHang.madh}`,
        text: `Chào ${tenKhach},\n\nHệ thống xác nhận đã nhận thanh toán số tiền ${Number(donHang.tongtien).toLocaleString()}đ cho khoản chi: ${tenKhoanChi}.\n\nTrân trọng,\nHệ thống Quản lý FIT 4.0 HomeStay.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #10B981; margin-top: 0;">Thanh Toán Thành Công</h2>
            <p>Chào <strong>${tenKhach}</strong>,</p>
            <p>Hệ thống xác nhận bạn đã thanh toán thành công đơn hàng qua <strong>${donHang.phuongthuc}</strong>:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Mã giao dịch:</td>
                <td style="padding: 8px 0; font-weight: bold;">${donHang.madh}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Nội dung:</td>
                <td style="padding: 8px 0; font-weight: bold;">${tenKhoanChi}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Số tiền:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #10B981; font-size: 16px;">${Number(donHang.tongtien).toLocaleString()}đ</td>
              </tr>
            </table>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          </div>
        `
      });
    } catch (error) {
      console.error('[DonHangService] Lỗi gửi mail xác nhận thanh toán:', error);
    }
  }

  /**
   * Khởi động Cron Job tự động đối soát thanh toán quá hạn (reconciliation) mỗi 5 phút
   */
  public static startCronJob(): void {
    console.log('[DonHangService] Khởi động Cron Job đối soát định kỳ mỗi 5 phút...');
    cron.schedule('*/5 * * * *', async () => {
      console.log('[Cron Job] Bắt đầu quét đơn hàng ở trạng thái "DangCho" quá 20 phút...');
      try {
        const service = new DonHangService();
        const pendingOrders = await service.repository.layDanhSachDangChoQuáHan(20);

        for (const order of pendingOrders) {
          console.log(`[Cron Job] Đối soát đơn hàng #${order.madh} (Tạo lúc: ${order.ngaytao})`);
          try {
            // Gọi PayPal API để kiểm tra trạng thái thực tế
            const paypalOrder = await service.paypalService.getOrder(order.madh);
            
            if (paypalOrder.status === 'COMPLETED' || paypalOrder.status === 'APPROVED') {
              console.log(`[Cron Job] Đơn hàng #${order.madh} thực tế đã được thanh toán (status: ${paypalOrder.status}). Cập nhật DaThanhToan...`);
              await service.chuyenTTDonHang(order.madh, DonHangTrangThai.DaThanhToan);
            } else {
              // Nếu không phải APPROVED/COMPLETED và đã quá hạn tạo -> Đánh dấu HetHan
              console.log(`[Cron Job] Đơn hàng #${order.madh} chưa được thanh toán thành công (status: ${paypalOrder.status}) và đã quá 20 phút. Set HetHan...`);
              await service.chuyenTTDonHang(order.madh, DonHangTrangThai.HetHan);
            }
          } catch (err: any) {
            // Trường hợp không lấy được thông tin từ PayPal (có thể do order ID giả lập hoặc lỗi kết nối)
            console.error(`[Cron Job] Lỗi khi gọi PayPal API cho đơn hàng ${order.madh}: ${err.message}`);
            // Đóng đơn hàng vì quá hạn thời gian
            await service.chuyenTTDonHang(order.madh, DonHangTrangThai.HetHan);
          }
        }
      } catch (error) {
        console.error('[Cron Job] Lỗi đối soát đơn hàng định kỳ:', error);
      }
    });
  }
}
