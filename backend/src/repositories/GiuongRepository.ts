import { db } from '../config/db';

export class GiuongRepository {
  /** Lấy danh sách giường trống trong phòng */
  async getGiuongTrongTheoPhong(maPhong: number): Promise<any[]> {
    const res = await db.query(
      `SELECT * FROM Giuong WHERE MaPhong = $1 AND TrangThaiStr = 'Trong'`,
      [maPhong]
    );
    return res.rows;
  }

  /** Lock giường FOR UPDATE trong transaction để tránh race condition */
  async layTheoIdForUpdate(client: any, maGiuong: number): Promise<any | null> {
    const res = await client.query(
      `SELECT * FROM Giuong WHERE MaGiuong = $1 FOR UPDATE`,
      [maGiuong]
    );
    return res.rows[0] || null;
  }

  /** Cập nhật TrangThaiStr trong transaction */
  async capNhatTrangThaiStr(client: any, maGiuong: number, trangThaiStr: 'Trong' | 'DangGiuCho' | 'DaCoc'): Promise<boolean> {
    // Sync cả INT cũ để không phá vỡ code khác
    const intVal = trangThaiStr === 'Trong' ? 0 : trangThaiStr === 'DangGiuCho' ? 1 : 2;
    const res = await client.query(
      `UPDATE Giuong SET TrangThaiStr = $1, TrangThai = $2 WHERE MaGiuong = $3`,
      [trangThaiStr, intVal, maGiuong]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /** Cập nhật nhiều giường (dùng code cũ, không phá) */
  async capNhatTrangThaiNhieuGiuong(maGiuongList: number[], trangThai: number): Promise<boolean> {
    if (!maGiuongList || maGiuongList.length === 0) return false;
    const ids = maGiuongList.join(',');
    const strVal = trangThai === 0 ? 'Trong' : trangThai === 1 ? 'DangGiuCho' : 'DaCoc';
    const res = await db.query(
      `UPDATE Giuong SET TrangThai = $1, TrangThaiStr = $2 WHERE MaGiuong IN (${ids})`,
      [trangThai, strVal]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /** Cập nhật đơn lẻ (dùng code cũ) */
  async capNhatTrangThai(maGiuong: number, trangThai: number): Promise<boolean> {
    const strVal = trangThai === 0 ? 'Trong' : trangThai === 1 ? 'DangGiuCho' : 'DaCoc';
    const res = await db.query(
      `UPDATE Giuong SET TrangThai = $1, TrangThaiStr = $2 WHERE MaGiuong = $3`,
      [trangThai, strVal, maGiuong]
    );
    return (res.rowCount ?? 0) > 0;
  }
}
