import { db } from '../config/db';

export class PhieuDatCocRepository {
  async create(phieu: { SoTien: number, TrangThai: number, MaGiaoDich?: string, PTThanhToan?: string, MaKH: number, MaPhong: number }): Promise<any> {
    const res = await db.query(
      `INSERT INTO PhieuDatCoc (SoTien, TrangThai, MaGiaoDich, PTThanhToan, MaKH, MaPhong) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [phieu.SoTien, phieu.TrangThai, phieu.MaGiaoDich, phieu.PTThanhToan, phieu.MaKH, phieu.MaPhong]
    );
    return res.rows[0];
  }

  async getById(maCoc: number): Promise<any> {
    const res = await db.query('SELECT * FROM PhieuDatCoc WHERE MaCoc = $1', [maCoc]);
    return res.rows[0];
  }

  async updateStatusAndTransaction(maCoc: number, trangThai: number, ptThanhToan: string, maGiaoDich?: string): Promise<boolean> {
    const res = await db.query(
      'UPDATE PhieuDatCoc SET TrangThai = $1, PTThanhToan = $2, MaGiaoDich = $3 WHERE MaCoc = $4',
      [trangThai, ptThanhToan, maGiaoDich, maCoc]
    );
    return (res as any).rowCount > 0;
  }

  async getPending(): Promise<any[]> {
    const res = await db.query(`
      SELECT p.*, k.HoTen, ph.TenPhong 
      FROM PhieuDatCoc p
      JOIN KhachHang k ON p.MaKH = k.MaKH
      JOIN Phong ph ON p.MaPhong = ph.MaPhong
      WHERE p.TrangThai = 2 -- 2: Chờ duyệt hồ sơ (đã up bill)
    `);
    return res.rows;
  }

  async updateStatus(maCoc: number, trangThai: number): Promise<boolean> {
      const res = await db.query('UPDATE PhieuDatCoc SET TrangThai = $1 WHERE MaCoc = $2', [trangThai, maCoc]);
      return (res as any).rowCount > 0;
  }

  async getChuaThanhToanByKH(maKH: number): Promise<any[]> {
    const res = await db.query(`
      SELECT pdc.*, ph.TenPhong, lp.GiaTien
      FROM PhieuDatCoc pdc
      JOIN Phong ph ON pdc.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      WHERE pdc.MaKH = $1 AND pdc.TrangThai = 1
      ORDER BY pdc.MaCoc DESC
    `, [maKH]);
    return res.rows;
  }
}
