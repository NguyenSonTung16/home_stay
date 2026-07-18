import { HopDongService } from './HopDongService';
import { PhieuKiemTraPhongService } from './PhieuKiemTraPhongService';
import { BangDoiSoatRepository } from '../repositories/BangDoiSoatRepository';
import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import { PaypalService } from './PaypalService';
import { EmailService } from './EmailService';
import { db } from '../config/db';

export interface IBangDoiSoat {
  tienCoc: number;
  khauTru: number;
  thucNhanChi: number;
  maPKT: number;
  maNV: number;
}

export class HoanCocService {
  // Inject đúng các Service thay vì gọi trực tiếp DB (Tuân thủ Sequence Diagram)
  private hopDongService = new HopDongService();
  private phieuKiemTraService = new PhieuKiemTraPhongService();
  private bangDoiSoatRepo = new BangDoiSoatRepository();
  private yeuCauRepo = new YeuCauTraPhongRepository();
  private paypalService = new PaypalService();

  /**
   * Bước 1: Lấy danh sách hợp đồng chờ đối soát hoàn cọc
   */
  async docDanhSachChoDoiSoat() {
    // BDsBUS -> HdBUS: docDanhSachHopDong()
    return await this.hopDongService.docDanhSachHopDong(); 
  }

  /**
   * Bước 2 & 3: Tính toán chi phí đối soát
   */
  async tinhToanChiPhiDoiSoat(maHD: number) {
    // BDsBUS -> HdBUS: docThongTinHopDong(maHD)
    const hopDong = await this.hopDongService.docThongTinHopDong(maHD);
    if (!hopDong) throw new Error('Không tìm thấy hợp đồng');

    // BDsBUS -> PktBUS: docPhieuKiemTra(maHD)
    const phieuKiemTra = await this.phieuKiemTraService.docPhieuKiemTra(maHD);
    if (!phieuKiemTra) throw new Error('Chưa có phiếu kiểm tra phòng cho hợp đồng này');

    const yeuCau = await this.yeuCauRepo.docYeuCauTheoHD(maHD);
    if (!yeuCau) throw new Error('Không tìm thấy yêu cầu trả phòng');

    // Tiền cọc lấy chuẩn xác từ HopDongService
    const tienCoc = Number(hopDong.tienCoc || 0); 

    let phiPhatBaoTre = 0;
    let lyDoHienThi = yeuCau.lydo || '';
    if (lyDoHienThi.startsWith('[PENALTY_25]')) {
      phiPhatBaoTre = tienCoc * 0.25;
      lyDoHienThi = lyDoHienThi.replace('[PENALTY_25]', '').trim();
    }

    // Logic tính Tỷ lệ hoàn cọc
    const ngayKy = new Date(hopDong.ngayky);
    const ngayDuKien = new Date(yeuCau.ngaydukien);
    const ngayHetHan = new Date(hopDong.ngayhethan);
    
    ngayDuKien.setHours(0,0,0,0);
    ngayHetHan.setHours(0,0,0,0);

    let tyLeHoanCoc = 100;
    if (ngayDuKien < ngayHetHan) {
      // Trả trước hạn
      const diffTime = Math.abs(ngayDuKien.getTime() - ngayKy.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = diffDays / 30; // Ước tính số tháng
      if (months < 6) {
        tyLeHoanCoc = 50;
      } else {
        tyLeHoanCoc = 70;
      }
    }

    const tienHoanDinhMuc = tienCoc * (tyLeHoanCoc / 100);

    // Khấu trừ = Phí hư hỏng + Phí vệ sinh + Phí phạt báo trễ
    const tongKhauTru = Number(phieuKiemTra.phihuhong || 0) + Number(phieuKiemTra.phivesinh || 0) + phiPhatBaoTre;
    const thucNhanChi = tienHoanDinhMuc - tongKhauTru;

    return {
      maHD,
      maPKT: phieuKiemTra.mapkt,
      tienCoc,
      tyLeHoanCoc,
      tienHoanDinhMuc,
      tongKhauTru,
      thucNhanChi,
      phiPhatBaoTre,
      lyDoHienThi,
      chiTietPhieu: phieuKiemTra,
      stk: yeuCau.stknhancoc
    };
  }

  /**
   * Bước 4: Lưu bảng đối soát và phê duyệt
   */
  async luuBangDoiSoat(maHD: number) {
    try {
      // Tự động tính toán để có số liệu mới nhất
      const chiPhi = await this.tinhToanChiPhiDoiSoat(maHD);
      const bdsData = {
        tienCoc: chiPhi.tienCoc,
        khauTru: chiPhi.tongKhauTru,
        thucNhanChi: chiPhi.thucNhanChi,
        maPKT: chiPhi.maPKT,
        maNV: 1 // Hardcode nhân viên hiện tại
      };

      // GỌI PAYPAL PAYOUT NẾU THỰC NHẬN CHI >= 0
      let paypalResponse = null;
      let newHopDongState = 4; // Mặc định là 4 (Đã thanh lý)
      let newYeuCauState = 5;  // Cập nhật thành 5 (Đã hoàn tất) để frontend nhận diện isCompleted

      if (chiPhi.thucNhanChi >= 0) {
        if (chiPhi.thucNhanChi > 0 && chiPhi.stk) {
          const amountUSD = chiPhi.thucNhanChi / 25000; // Tỷ giá 25000 VND = 1 USD
          const email = chiPhi.stk; // Lấy email từ trường stk
          const batchId = `HD${maHD}_${Date.now()}`;
          
          paypalResponse = await this.paypalService.sendPayout(
            email, 
            amountUSD, 
            `Hoan tien coc phong tro cho hop dong ${maHD}`, 
            batchId
          );
        }
      } else {
        // thucNhanChi < 0 -> Khách nợ tiền
        newHopDongState = 5; // Chờ thanh lý / Khách nợ
        newYeuCauState = 4;  // Khách nợ tiền -> Chờ khách thanh toán
      }

      // Cập nhật trạng thái hợp đồng
      await this.hopDongService.capNhatTrangThai(maHD, newHopDongState);

      // Cập nhật trạng thái yêu cầu trả phòng
      const maYC = await this.yeuCauRepo.layMaYCByMaHD(maHD);
      if (maYC) {
        await this.yeuCauRepo.capNhatTrangThai(maYC, newYeuCauState);
      }

      // [FIX BUG]: Giải phóng tài nguyên để trả lại giường trống cho phòng
      // 1. Cập nhật phiếu đặt cọc thành 'DaHoanThanh' để xóa khỏi công thức tính sogiuongtrong
      await db.query(`
        UPDATE PhieuDatCoc 
        SET TrangThaiMoi = 'DaHoanThanh'
        WHERE MaCoc = (
          SELECT pd.MaCoc FROM PhieuDatCoc pd
          JOIN KhachHang kh ON kh.MaKH = pd.MaKH
          JOIN HopDong hd ON hd.MaKHDaiDien = kh.MaKH
          WHERE hd.MaHD = $1
          LIMIT 1
        )
      `, [maHD]);

      // 2. Reset trạng thái giường thực tế về 'Trong'
      await db.query(`
        UPDATE Giuong 
        SET TrangThaiStr = 'Trong', TrangThai = 0 
        WHERE MaGiuong IN (
          SELECT MaGiuong FROM ChiTietGiuong WHERE MaHD = $1
        )
      `, [maHD]);

      // Lưu bảng đối soát
      const result = await this.bangDoiSoatRepo.themPhanGhiMoi(bdsData);

      // Gửi Email thông báo đối soát cho khách hàng
      try {
        const customerRes = await db.query(`
          SELECT k.Email, k.HoTen
          FROM HopDong h
          JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
          WHERE h.MaHD = $1
        `, [maHD]);
        const customer = customerRes.rows[0];

        const roomRes = await db.query(`
          SELECT p.TenPhong
          FROM ChiTietGiuong cg
          JOIN Giuong g ON cg.MaGiuong = g.MaGiuong
          JOIN Phong p ON g.MaPhong = p.MaPhong
          WHERE cg.MaHD = $1
          LIMIT 1
        `, [maHD]);
        const room = roomRes.rows[0];

        if (customer && customer.email) {
          if (chiPhi.thucNhanChi >= 0) {
            // Mẫu email 1: Hoàn tiền cọc
            await EmailService.sendMail({
              to: customer.email,
              subject: `[FIT 4.0 HomeStay] Thông báo kết quả đối soát & Hoàn trả tiền cọc — Hợp đồng #${maHD}`,
              text: `Chào ${customer.hoten || 'Quý khách'},\nHệ thống thông báo thủ tục đối soát tài chính và trả phòng cho phòng ${room?.tenphong || ''} (Hợp đồng #${maHD}) đã được hoàn tất.\nSố tiền thực nhận hoàn trả: ${Number(chiPhi.thucNhanChi).toLocaleString()}đ.\n\nTrân trọng,\nHệ thống FIT 4.0 HomeStay.`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <h2 style="color: #10B981; margin-top: 0;">💵 Thông Báo Hoàn Trả Tiền Cọc Thành Công</h2>
                  <p>Chào <strong>${customer.hoten || 'Quý khách'}</strong>,</p>
                  <p>Hệ thống FIT 4.0 HomeStay thông báo thủ tục đối soát tài chính và trả phòng cho phòng <strong>${room?.tenphong || '—'}</strong> (Hợp đồng #${maHD}) đã được hoàn tất.</p>
                  
                  <h3 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 20px;">Chi tiết đối soát:</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0;">
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tiền cọc gốc:</td><td style="text-align: right; font-weight: bold;">${(chiPhi.tienCoc || 0).toLocaleString()}đ</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tỷ lệ hoàn trả:</td><td style="text-align: right; font-weight: bold;">${chiPhi.tyLeHoanCoc || 100}%</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tiền cọc định mức:</td><td style="text-align: right; font-weight: bold;">${(chiPhi.tienHoanDinhMuc || 0).toLocaleString()}đ</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tổng chi phí khấu trừ:</td><td style="text-align: right; font-weight: bold; color: #EF4444;">-${(chiPhi.tongKhauTru || 0).toLocaleString()}đ</td></tr>
                    <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; font-weight: bold;">Số tiền thực tế hoàn trả:</td><td style="text-align: right; font-weight: bold; color: #10B981; font-size: 15px;">${Number(chiPhi.thucNhanChi).toLocaleString()}đ</td></tr>
                  </table>

                  <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 12px; margin: 15px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #065F46; font-size: 13px; font-weight: bold;">💸 Phương thức nhận tiền:</p>
                    <p style="margin: 4px 0 0 0; color: #065F46; font-size: 13px;">${chiPhi.thucNhanChi > 0 ? `Số tiền đã được thực hiện chuyển khoản qua cổng thanh toán PayPal đến tài khoản <strong>${chiPhi.stk || customer.email}</strong>.` : 'Số dư đối soát vừa đủ, không cần chuyển trả thêm.'}</p>
                  </div>
                  <p>Cảm ơn bạn đã đồng hành cùng FIT 4.0 HomeStay trong suốt thời gian qua!</p>
                </div>
              `
            });
          } else {
            // Mẫu email 2: Thu thêm (Khách nợ)
            await EmailService.sendMail({
              to: customer.email,
              subject: `[FIT 4.0 HomeStay] Thông báo kết quả đối soát & Thanh toán phát sinh — Hợp đồng #${maHD}`,
              text: `Chào ${customer.hoten || 'Quý khách'},\nHệ thống thông báo thủ tục đối soát tài chính và trả phòng cho phòng ${room?.tenphong || ''} (Hợp đồng #${maHD}) đã được phê duyệt. Bạn có khoản công nợ cần thanh toán thêm: ${Math.abs(chiPhi.thucNhanChi).toLocaleString()}đ.\n\nTrân trọng,\nHệ thống FIT 4.0 HomeStay.`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <h2 style="color: #EF4444; margin-top: 0;">⚠️ Thông Báo Phát Sinh Công Nợ Trả Phòng</h2>
                  <p>Chào <strong>${customer.hoten || 'Quý khách'}</strong>,</p>
                  <p>Hệ thống FIT 4.0 HomeStay thông báo thủ tục đối soát tài chính và trả phòng cho phòng <strong>${room?.tenphong || '—'}</strong> (Hợp đồng #${maHD}) đã được phê duyệt.</p>
                  <p>Do tiền cọc phòng không đủ để bù đắp các chi phí đền bù hư hỏng hoặc phí phát sinh, bạn có một khoản công nợ cần thanh toán thêm:</p>

                  <h3 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 20px;">Chi tiết đối soát:</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0;">
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tiền cọc gốc:</td><td style="text-align: right; font-weight: bold;">${(chiPhi.tienCoc || 0).toLocaleString()}đ</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tỷ lệ hoàn trả:</td><td style="text-align: right; font-weight: bold;">${chiPhi.tyLeHoanCoc || 100}%</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tiền cọc định mức:</td><td style="text-align: right; font-weight: bold;">${(chiPhi.tienHoanDinhMuc || 0).toLocaleString()}đ</td></tr>
                    <tr><td style="padding: 6px 0; color: #6b7280;">Tổng chi phí khấu trừ:</td><td style="text-align: right; font-weight: bold; color: #EF4444;">-${(chiPhi.tongKhauTru || 0).toLocaleString()}đ</td></tr>
                    <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0; font-weight: bold; color: #EF4444;">Số tiền cần đóng thêm:</td><td style="text-align: right; font-weight: bold; color: #EF4444; font-size: 15px;">${Math.abs(chiPhi.thucNhanChi).toLocaleString()}đ</td></tr>
                  </table>

                  <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin: 15px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #991B1B; font-size: 13px; font-weight: bold;">💳 Hướng dẫn thanh toán:</p>
                    <p style="margin: 4px 0 0 0; color: #991B1B; font-size: 13px;">Bạn vui lòng đăng nhập vào trang web cá nhân -> mục <strong>Hợp đồng</strong> để tiến hành thanh toán nợ trực tuyến thông qua cổng thanh toán PayPal hoặc chuyển khoản trực tiếp.</p>
                  </div>
                  <p>Vui lòng hoàn tất thanh toán để chúng tôi có thể chính thức thanh lý hợp đồng thuê phòng của bạn. Xin cảm ơn!</p>
                </div>
              `
            });
          }
        }
      } catch (mailErr) {
        console.error('Lỗi khi gửi email đối soát:', mailErr);
      }
      
      return {
        success: true,
        data: result,
        paypalResponse
      };
    } catch (error) {
      throw new Error(`Lỗi khi lưu bảng đối soát: ${(error as Error).message}`);
    }
  }
}
