import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { GiuongRepository } from '../repositories/GiuongRepository';
import { PhongRepository } from '../repositories/PhongRepository';

export class DatCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();
  private giuongRepo = new GiuongRepository();
  private phongRepo = new PhongRepository(); // Not implemented yet but assume we might need it, actually we'll use db directly if needed
  
  async xuLyDatCoc(data: { maKH: number, maPhong: number, soGiuong: number, soThangThue: number }): Promise<any> {
    const { maKH, maPhong, soGiuong, soThangThue } = data;
    
    // 1. Check if enough beds are available
    const giuongTrong = await this.giuongRepo.getGiuongTrongTheoPhong(maPhong);
    if (giuongTrong.length < soGiuong) {
      throw new Error('Không đủ giường trống trong phòng này.');
    }

    // 2. Calculate deposit (Tiền thuê 2 tháng x Số giường)
    // Note: To get room price, we need to join Phong with LoaiPhong.
    // For simplicity, let's inject a db query here or assume a fixed price if LoaiPhongRepo isn't there.
    const { db } = require('../config/db');
    const phongRes = await db.query(
      `SELECT p.TenPhong, lp.GiaTien 
       FROM Phong p JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai 
       WHERE p.MaPhong = $1`, [maPhong]
    );
    
    if (phongRes.rows.length === 0) {
      throw new Error('Phòng không tồn tại.');
    }
    
    const giaTien = parseFloat(phongRes.rows[0].giatien);
    // Deposit formula: (Tiền thuê 2 tháng) * (Số giường thuê)
    // Assuming GiaTien is per month per bed. If it's per room, logic might vary, but spec says:
    // Tiền cọc = (Tiền thuê 2 tháng) * (Số giường thuê). So GiaTien is likely per bed/room unit.
    const tienCoc = (giaTien * 2) * soGiuong;

    // 3. Update Bed status to "Đang giữ chỗ" (Trạng thái = 1)
    const maGiuongList = giuongTrong.slice(0, soGiuong).map(g => g.magiuong);
    await this.giuongRepo.capNhatTrangThaiNhieuGiuong(maGiuongList, 1);

    // 4. Create PhieuDatCoc (Trạng thái = 1: Chờ thanh toán)
    const phieu = await this.phieuDatCocRepo.create({
      SoTien: tienCoc,
      TrangThai: 1, // 1: Chờ thanh toán
      MaKH: maKH,
      MaPhong: maPhong
    });

    return {
      success: true,
      message: 'Tạo phiếu đặt cọc thành công, chờ thanh toán.',
      data: phieu
    };
  }
}
