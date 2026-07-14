import { db } from '../config/db';

export class HopDongRepository {
  async layDanhSachTheoTrangThai(trangThai: number): Promise<any> {
    const res = await db.query(`
      SELECT DISTINCT ON (h.MaHD) h.*, k.HoTen, pkt.MaPKT, y.NgayDuKien as ngayyeucau,
        CASE 
          WHEN y.TrangThai = 4 THEN 5 
          WHEN bds.MaBDS IS NULL THEN 1 
          ELSE 2 
        END as trangthai
      FROM HopDong h 
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      JOIN YeuCauTraPhong y ON y.MaHD = h.MaHD
      JOIN PhieuKiemTraPhong pkt ON pkt.MaYC = y.MaYC
      LEFT JOIN BangDoiSoat bds ON bds.MaPKT = pkt.MaPKT
      ORDER BY h.MaHD, pkt.MaPKT DESC
    `);
    return res.rows;
  }
  
  async layThongTin(maHD: number): Promise<any> {
    const res = await db.query('SELECT * FROM HopDong WHERE MaHD = $1', [maHD]);
    return res.rows.length ? res.rows[0] : null;
  }

  async layTienCocCuaHopDong(maHD: number): Promise<any> {
    const res = await db.query(`
      SELECT pd.SoTien FROM PhieuDatCoc pd
      JOIN KhachHang kh ON kh.MaKH = pd.MaKH
      JOIN HopDong hd ON hd.MaKHDaiDien = kh.MaKH
      WHERE hd.MaHD = $1 LIMIT 1
    `, [maHD]);
    return res.rows.length ? Number(res.rows[0].sotien) : 0;
  }

  async capNhatTrangThai(maHD: number, trangThai: number): Promise<any> {
    return true; 
  }

  async layHopDongActiveTheoMaTK(maTK: number): Promise<any> {
    const res = await db.query(`
      SELECT h.* 
      FROM HopDong h
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      WHERE k.MaTK = $1 AND h.NgayHetHan >= CURRENT_DATE
      ORDER BY h.MaHD DESC LIMIT 1
    `, [maTK]);
    return res.rows.length ? res.rows[0] : null;
  }

  async layHopDongGanNhatTheoMaTK(maTK: number): Promise<any> {
    const res = await db.query(`
      SELECT h.* 
      FROM HopDong h
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      WHERE k.MaTK = $1
      ORDER BY h.MaHD DESC LIMIT 1
    `, [maTK]);
    return res.rows.length ? res.rows[0] : null;
  }
}
