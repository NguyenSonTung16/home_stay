import { db } from '../config/db';

export class PhongRepository {
  async capNhatTrangThai(maPhong: number, trangThai: number): Promise<boolean> {
    const res = await db.query('UPDATE Phong SET TrangThai = $1 WHERE MaPhong = $2', [trangThai, maPhong]);
    return (res as any).rowCount > 0;
  }

  async getPhongCoGiuongTrong(): Promise<any[]> {
    const res = await db.query(`
      SELECT p.MaPhong, p.TenPhong, p.ChiNhanh, p.TieuChiGioiTinh,
             lp.TenLoai, lp.GiaTien, lp.SucChua,
             lp.SucChua - COUNT(CASE WHEN g.TrangThai = 1 THEN 1 END) AS sogiuongtrong,
             COUNT(g.MaGiuong) AS tonggiuong
      FROM Phong p
      JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
      LEFT JOIN Giuong g ON g.MaPhong = p.MaPhong
      GROUP BY p.MaPhong, p.TenPhong, p.ChiNhanh, p.TieuChiGioiTinh,
               lp.TenLoai, lp.GiaTien, lp.SucChua
      HAVING (lp.SucChua - COUNT(CASE WHEN g.TrangThai = 1 THEN 1 END)) > 0
      ORDER BY p.MaPhong
    `);
    return res.rows;
  }
}
