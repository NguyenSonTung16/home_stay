import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';
import { GiuongRepository } from '../repositories/GiuongRepository';
import { PhongRepository } from '../repositories/PhongRepository';

export class DatCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();
  private giuongRepo = new GiuongRepository();
  private phongRepo = new PhongRepository(); // Not implemented yet but assume we might need it, actually we'll use db directly if needed
  
  async xuLyDatCoc(data: { maKH: number, maPhong: number, soGiuong: number, soThangThue: number, gioiTinh?: string, soNguoiO?: number, ngayDuKienVao?: string }): Promise<any> {
    const { maKH, maPhong, soGiuong, soThangThue, gioiTinh, soNguoiO, ngayDuKienVao } = data;
    
    const { db } = require('../config/db');
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Check if enough capacity is available
      const capacityRes = await client.query(`
        SELECT lp.SucChua,
               (lp.SucChua 
                - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
                - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
               )::int AS sogiuongtrong,
               p.TenPhong, lp.GiaTien, p.TieuChiGioiTinh
        FROM Phong p 
        JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai 
        WHERE p.MaPhong = $1
        FOR UPDATE
      `, [maPhong]);
      
      if (capacityRes.rows.length === 0) {
        throw new Error('Phòng không tồn tại.');
      }
      
      const phong = capacityRes.rows[0];
      
      if (phong.sogiuongtrong < soGiuong) {
        throw new Error('Không đủ chỗ trống trong phòng này.');
      }
      
      // 2. Validate gender
      if (phong.tieuchigioitinh && phong.tieuchigioitinh !== 'Tất cả' && phong.tieuchigioitinh !== 'Không yêu cầu') {
        if (gioiTinh) {
          const allowedGenders = phong.tieuchigioitinh.toLowerCase().split('/').map((g: string) => g.trim());
          if (!allowedGenders.includes(gioiTinh.toLowerCase())) {
            throw new Error(`Phòng này chỉ dành cho ${phong.tieuchigioitinh}. Thông tin giới tính của bạn không phù hợp.`);
          }
        }
      }
      
      const giaTien = parseFloat(phong.giatien);
      // Deposit formula: (Tiền thuê 2 tháng) * (Số giường thuê)
      const tienCoc = (giaTien * 2) * soGiuong;
      
      // 3. Create PhieuDatCoc (Trạng thái = 0: Chờ Sale duyệt - theo Use Case, cần nhân viên Sale phê duyệt trước khi thanh toán)
      const phieuRes = await client.query(
        `INSERT INTO PhieuDatCoc (SoTien, TrangThai, MaKH, MaPhong, SoGiuong, GioiTinh, SoNguoiO, NgayDuKienVao) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [tienCoc, 0, maKH, maPhong, soGiuong, gioiTinh, soNguoiO, ngayDuKienVao]
      );
      
      await client.query('COMMIT');
      
      return {
        success: true,
        message: 'Yêu cầu đặt cọc đã được gửi thành công! Vui lòng chờ nhân viên Sale xử lý hồ sơ của bạn.',
        data: phieuRes.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
