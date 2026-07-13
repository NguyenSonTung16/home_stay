import { db } from '../config/db';

export class GiuongRepository {
  async getGiuongTrongTheoPhong(maPhong: number): Promise<any[]> {
    const res = await db.query('SELECT * FROM Giuong WHERE MaPhong = $1 AND TrangThai = 0', [maPhong]);
    return res.rows;
  }

  async capNhatTrangThaiNhieuGiuong(maGiuongList: number[], trangThai: number): Promise<boolean> {
    if (!maGiuongList || maGiuongList.length === 0) return false;
    const ids = maGiuongList.join(',');
    const res = await db.query(`UPDATE Giuong SET TrangThai = $1 WHERE MaGiuong IN (${ids})`, [trangThai]);
    return (res as any).rowCount > 0;
  }

  async capNhatTrangThai(maGiuong: number, trangThai: number): Promise<boolean> {
      const res = await db.query('UPDATE Giuong SET TrangThai = $1 WHERE MaGiuong = $2', [trangThai, maGiuong]);
      return (res as any).rowCount > 0;
  }
}
