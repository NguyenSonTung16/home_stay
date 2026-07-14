import { db } from '../config/db';

export class PhieuDatCocRepository {
  async create(phieu: { SoTien: number, TrangThai: number, MaGiaoDich?: string, PTThanhToan?: string, MaKH: number, MaPhong: number, SoGiuong: number, GioiTinh?: string, SoNguoiO?: number, NgayDuKienVao?: string }): Promise<any> {
    const res = await db.query(
      `INSERT INTO PhieuDatCoc (SoTien, TrangThai, MaGiaoDich, PTThanhToan, MaKH, MaPhong, SoGiuong, GioiTinh, SoNguoiO, NgayDuKienVao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [phieu.SoTien, phieu.TrangThai, phieu.MaGiaoDich, phieu.PTThanhToan, phieu.MaKH, phieu.MaPhong, phieu.SoGiuong, phieu.GioiTinh, phieu.SoNguoiO, phieu.NgayDuKienVao]
    );
    return res.rows[0];
  }

  async getById(maCoc: number): Promise<any> {
    const res = await db.query('SELECT * FROM PhieuDatCoc WHERE MaCoc = $1', [maCoc]);
    return res.rows[0];
  }

  async delete(maCoc: number): Promise<boolean> {
    const res = await db.query('DELETE FROM PhieuDatCoc WHERE MaCoc = $1', [maCoc]);
    return (res as any).rowCount > 0;
  }

  async updateStatusAndTransaction(maCoc: number, trangThai: number, ptThanhToan: string, maGiaoDich?: string, minhChung?: string): Promise<boolean> {
    const res = await db.query(
      'UPDATE PhieuDatCoc SET TrangThai = $1, PTThanhToan = $2, MaGiaoDich = $3, MinhChung = $4 WHERE MaCoc = $5',
      [trangThai, ptThanhToan, maGiaoDich, minhChung, maCoc]
    );
    return (res as any).rowCount > 0;
  }

  async getPending(): Promise<any[]> {
    const res = await db.query(`
      SELECT p.*, k.HoTen, ph.TenPhong 
      FROM PhieuDatCoc p
      JOIN KhachHang k ON p.MaKH = k.MaKH
      JOIN Phong ph ON p.MaPhong = ph.MaPhong
      WHERE p.TrangThai = 0 -- 0: Chờ Sale duyệt (yêu cầu mới từ khách hàng)
    `);
    return res.rows;
  }

  async updateStatus(maCoc: number, trangThai: number): Promise<boolean> {
      const res = await db.query('UPDATE PhieuDatCoc SET TrangThai = $1 WHERE MaCoc = $2', [trangThai, maCoc]);
      return (res as any).rowCount > 0;
  }

  async getAllByKH(maKH: number): Promise<any[]> {
    const res = await db.query(`
      SELECT pdc.*, ph.TenPhong, lp.GiaTien
      FROM PhieuDatCoc pdc
      JOIN Phong ph ON pdc.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      WHERE pdc.MaKH = $1
      ORDER BY pdc.MaCoc DESC
    `, [maKH]);
    return res.rows;
  }
}
