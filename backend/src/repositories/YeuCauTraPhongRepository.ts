import { db } from '../config/db';

export class YeuCauTraPhongRepository {
  async docDanhSachYeuCau(): Promise<any> {
    const res = await db.query(`
      SELECT y.*, h.MaHD, k.HoTen, p.TenPhong
      FROM YeuCauTraPhong y 
      JOIN HopDong h ON y.MaHD = h.MaHD 
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH 
      JOIN PhieuDatCoc c ON c.MaKH = k.MaKH
      JOIN Phong p ON p.MaPhong = c.MaPhong
      ORDER BY y.NgayDuKien ASC
    `);
    return res.rows;
  }

  async layThongTinPhongThue(maHD: number): Promise<any> {
    const res = await db.query(`
      SELECT g.*, p.TenPhong 
      FROM ChiTietGiuong cg 
      JOIN Giuong g ON cg.MaGiuong = g.MaGiuong 
      JOIN Phong p ON p.MaPhong = g.MaPhong
      WHERE cg.MaHD = $1
    `, [maHD]);
    return res.rows;
  }

  async layMaYCByMaHD(maHD: number): Promise<number | null> {
    const res = await db.query('SELECT MaYC FROM YeuCauTraPhong WHERE MaHD = $1 ORDER BY MaYC DESC LIMIT 1', [maHD]);
    return res.rows.length ? res.rows[0].mayc : null;
  }

  async docYeuCauTheoHD(maHD: number): Promise<any> {
    const res = await db.query('SELECT * FROM YeuCauTraPhong WHERE MaHD = $1 ORDER BY MaYC DESC LIMIT 1', [maHD]);
    return res.rows.length ? res.rows[0] : null;
  }
  async capNhatTrangThai(maYC: number, trangThai: number): Promise<void> {
    await db.query('UPDATE YeuCauTraPhong SET TrangThai = $1 WHERE MaYC = $2', [trangThai, maYC]);
  }

  async capNhatTrangThaiVaLyDo(maYC: number, trangThai: number, lyDo: string | null): Promise<void> {
    await db.query('UPDATE YeuCauTraPhong SET TrangThai = $1, LyDo = $2 WHERE MaYC = $3', [trangThai, lyDo, maYC]);
  }

  async create(data: { NgayDuKien: string, STKNhanCoc: string, TrangThai: number, LyDo: string, MaHD: number }): Promise<any> {
    const res = await db.query(
      `INSERT INTO YeuCauTraPhong (NgayDuKien, STKNhanCoc, TrangThai, LyDo, MaHD)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.NgayDuKien, data.STKNhanCoc, data.TrangThai, data.LyDo, data.MaHD]
    );
    return res.rows[0];
  }

  async taoYeuCauTraPhong(ngayDuKien: string, stk: string, trangThai: number, lyDo: string, maHD: number): Promise<any> {
    const res = await db.query(
      `INSERT INTO YeuCauTraPhong (NgayDuKien, STKNhanCoc, TrangThai, LyDo, MaHD) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ngayDuKien, stk, trangThai, lyDo, maHD]
    );
    return res.rows[0];
  }
}
