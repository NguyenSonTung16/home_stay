import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { db } from '../config/db';
import { EmailService } from './EmailService';

export class HoSoDatCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();

  async layDanhSachChoDuyet(): Promise<any> {
    const data = await this.phieuDatCocRepo.getPending();
    return {
      success: true,
      data
    };
  }

  async pheDuyetHoSo(maCoc: number, isDuyet: boolean): Promise<any> {
    // Join KhachHang and Phong to get email, customer name, and room name
    const res = await db.query(`
      SELECT p.*, k.Email as email, k.HoTen as hoten, ph.TenPhong as tenphong,
             ctdc.MaGiuong as magiuong
      FROM PhieuDatCoc p
      JOIN KhachHang k ON p.MaKH = k.MaKH
      LEFT JOIN Phong ph ON p.MaPhong = ph.MaPhong
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = p.MaCoc
      WHERE p.MaCoc = $1
    `, [maCoc]);
    const phieu = res.rows[0];

    if (!phieu) {
      throw new Error('Phiếu đặt cọc không tồn tại.');
    }

    if (isDuyet) {
      // Approve: Change status to 1 (Cần thanh toán) and TrangThaiMoi to ChoThanhToan
      await this.phieuDatCocRepo.updateStatusAndTransaction(maCoc, 1, 'TienMat', undefined);
      await db.query(`UPDATE PhieuDatCoc SET TrangThaiMoi = 'ChoThanhToan' WHERE MaCoc = $1`, [maCoc]);

      // Send approval email
      if (phieu.email) {
        EmailService.sendMail({
          to: phieu.email,
          subject: `[FIT 4.0 HomeStay] Hồ sơ đặt cọc giữ chỗ của bạn đã được phê duyệt — Mã cọc #${maCoc}`,
          text: `Chào ${phieu.hoten || 'Quý khách'},\n\nHồ sơ đăng ký đặt cọc phòng ${phieu.tenphong || ''} của bạn đã được phê duyệt thành công.\nSố tiền cần thanh toán cọc: ${Number(phieu.sotien || 0).toLocaleString()}đ.\nBạn vui lòng thực hiện thanh toán trong vòng 24 giờ kể từ thời điểm này. Sau 24 giờ, phiếu cọc sẽ tự động hủy.\n\nTrân trọng,\nHệ thống FIT 4.0 HomeStay.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #00236F; margin-top: 0;">🎉 Hồ Sơ Đặt Cọc Đã Được Phê Duyệt</h2>
              <p>Chào <strong>${phieu.hoten || 'Quý khách'}</strong>,</p>
              <p>Hệ thống thông báo yêu cầu đăng ký giữ chỗ phòng của bạn đã được nhân viên duyệt thành công:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Mã phiếu cọc:</td>
                  <td style="font-weight: bold;">#${maCoc}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Phòng:</td>
                  <td style="font-weight: bold;">${phieu.tenphong || '—'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Số tiền cọc:</td>
                  <td style="font-weight: bold; color: #00236F; font-size: 16px;">${Number(phieu.sotien || 0).toLocaleString()}đ</td>
                </tr>
              </table>
              <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px; margin: 15px 0; border-radius: 4px;">
                <p style="margin: 0; color: #B45309; font-size: 13px; font-weight: bold;">⚠️ Hạn thanh toán:</p>
                <p style="margin: 4px 0 0 0; color: #B45309; font-size: 13px;">Bạn vui lòng truy cập trang cá nhân -> <strong>Đặt cọc</strong> trên website của Homestay để thực hiện thanh toán online (PayPal / Chuyển khoản) hoặc thanh toán trực tiếp bằng tiền mặt trong vòng <strong>24 giờ</strong>.</p>
              </div>
              <p>Cảm ơn bạn đã tin tưởng lựa chọn dịch vụ của FIT 4.0 HomeStay!</p>
            </div>
          `
        }).catch(err => console.error('Error sending approval email:', err));
      }

      return { success: true, message: 'Đã duyệt hồ sơ đặt cọc. Khách hàng có thể tiến hành thanh toán.' };
    } else {
      // Reject: Change status to 4 (Từ chối/Hủy) and TrangThaiMoi to DaHuy
      await this.phieuDatCocRepo.updateStatus(maCoc, 4);
      await db.query(`UPDATE PhieuDatCoc SET TrangThaiMoi = 'DaHuy' WHERE MaCoc = $1`, [maCoc]);
      
      // Release bed lock if needed
      if (phieu.magiuong) {
        await db.query(`UPDATE Giuong SET TrangThaiStr = 'Trong', TrangThai = 0 WHERE MaGiuong = $1`, [phieu.magiuong]);
      }

      // Send rejection email
      if (phieu.email) {
        EmailService.sendMail({
          to: phieu.email,
          subject: `[FIT 4.0 HomeStay] Kết quả duyệt hồ sơ đặt cọc giữ chỗ — Mã cọc #${maCoc}`,
          text: `Chào ${phieu.hoten || 'Quý khách'},\n\nRất tiếc, yêu cầu đăng ký đặt cọc phòng ${phieu.tenphong || ''} của bạn đã bị từ chối.\n\nTrân trọng,\nHệ thống FIT 4.0 HomeStay.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #EF4444; margin-top: 0;">❌ Hồ Sơ Đặt Cọc Bị Từ Chối</h2>
              <p>Chào <strong>${phieu.hoten || 'Quý khách'}</strong>,</p>
              <p>Hệ thống rất tiếc phải thông báo yêu cầu đăng ký đặt cọc phòng <strong>${phieu.tenphong || ''}</strong> (mã cọc #${maCoc}) của bạn đã không được duyệt.</p>
              <p>Vui lòng liên hệ bộ phận hỗ trợ khách hàng hoặc tìm kiếm phòng khác trên trang chủ.</p>
              <p>Trân trọng,<br/>Đội ngũ FIT 4.0 HomeStay.</p>
            </div>
          `
        }).catch(err => console.error('Error sending rejection email:', err));
      }

      return { success: true, message: 'Đã từ chối hồ sơ đặt cọc.' };
    }
  }
}
