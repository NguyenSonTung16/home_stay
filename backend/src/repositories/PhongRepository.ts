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
             (lp.SucChua 
              - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
              - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
             )::int AS sogiuongtrong,
             (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong) AS tonggiuong
      FROM Phong p
      JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
      WHERE (lp.SucChua 
              - (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = 1)
              - COALESCE((SELECT SUM(SoGiuong) FROM PhieuDatCoc pdc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThai IN (0, 1, 2, 3)), 0)
             ) > 0
      ORDER BY p.MaPhong
    `);
    return res.rows;
  }
}
