import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { GiuongRepository } from '../repositories/GiuongRepository';
import { PhongRepository } from '../repositories/PhongRepository';

export class DatCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();
  private giuongRepo = new GiuongRepository();
  private phongRepo = new PhongRepository(); // Not implemented yet but assume we might need it, actually we'll use db directly if needed
  
  async xuLyDatCoc(data: { maKH: number, maPhong: number, soGiuong: number, soThangThue: number, gioiTinh?: string, soNguoiO?: number, ngayDuKienVao?: string }): Promise<any> {
    const { maKH, maPhong, soGiuong, soThangThue, gioiTinh, soNguoiO, ngayDuKienVao } = data;
    
    // 1. Check if enough beds are available
    const giuongTrong = await this.giuongRepo.getGiuongTrongTheoPhong(maPhong);
    if (giuongTrong.length < soGiuong) {
      throw new Error('Không đủ giường trống trong phòng này.');
    }

    // 2. Calculate deposit & validate gender
    const { db } = require('../config/db');
    const phongRes = await db.query(
      `SELECT p.TenPhong, lp.GiaTien, p.TieuChiGioiTinh, lp.SucChua 
       FROM Phong p JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai 
       WHERE p.MaPhong = $1`, [maPhong]
    );
    
    if (phongRes.rows.length === 0) {
      throw new Error('Phòng không tồn tại.');
    }
    
    const phong = phongRes.rows[0];

    // Kiểm tra giới tính
    if (phong.tieuchigioitinh && phong.tieuchigioitinh !== 'Tất cả' && phong.tieuchigioitinh !== 'Không yêu cầu') {
      if (gioiTinh && gioiTinh.toLowerCase() !== phong.tieuchigioitinh.toLowerCase()) {
        throw new Error(`Phòng này chỉ dành cho ${phong.tieuchigioitinh}. Thông tin giới tính của bạn không phù hợp.`);
      }
    }
    
    const giaTien = parseFloat(phong.giatien);
    // Deposit formula: (Tiền thuê 2 tháng) * (Số giường thuê)
    const tienCoc = (giaTien * 2) * soGiuong;

    // 3. Update Bed status to "Đang giữ chỗ" (Trạng thái = 1)
    const maGiuongList = giuongTrong.slice(0, soGiuong).map(g => g.magiuong);
    await this.giuongRepo.capNhatTrangThaiNhieuGiuong(maGiuongList, 1);

    // 4. Create PhieuDatCoc (Trạng thái = 0: Chờ Sale duyệt)
    const phieu = await this.phieuDatCocRepo.create({
      SoTien: tienCoc,
      TrangThai: 0, // 0: Chờ Sale duyệt
      MaKH: maKH,
      MaPhong: maPhong,
      SoGiuong: soGiuong,
      GioiTinh: gioiTinh,
      SoNguoiO: soNguoiO,
      NgayDuKienVao: ngayDuKienVao
    });

    return {
      success: true,
      message: 'Gửi yêu cầu đặt cọc thành công, vui lòng chờ Nhân viên Sale xét duyệt.',
      data: phieu
    };
  }
}
