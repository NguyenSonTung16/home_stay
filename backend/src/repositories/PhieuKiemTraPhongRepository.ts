import { db } from '../config/db';

export class PhieuKiemTraPhongRepository {
  async docPhieuKiemTraTheoMaHD(maHD: number): Promise<any> {
    const res = await db.query(`
      SELECT p.* FROM PhieuKiemTraPhong p
      JOIN YeuCauTraPhong y ON p.MaYC = y.MaYC
      WHERE y.MaHD = $1 ORDER BY p.MaPKT DESC LIMIT 1
    `, [maHD]);
    return res.rows.length ? res.rows[0] : null;
  }

  async luuThongTinPKT(pkt: any): Promise<any> {
    const res = await db.query(`
      INSERT INTO PhieuKiemTraPhong (TinhTrang, ChiTietHuHong, PhiHuHong, PhiVeSinh, ThuHoiKhoa, KyBienBan, MaYC, MaNV)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING MaPKT
    `, [pkt.tinhTrang, pkt.chiTietHuHong, pkt.phiHuHong, pkt.phiVeSinh, pkt.thuHoiKhoa, pkt.kyBienBan, pkt.maYC, pkt.maNV]);
    return res.rows[0];
  }
}
