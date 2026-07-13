import { db } from '../config/db';

export class KhachHangRepository {
  async getById(maKH: number): Promise<any> {
    const res = await db.query('SELECT * FROM KhachHang WHERE MaKH = $1', [maKH]);
    return res.rows[0];
  }

  async create(kh: { HoTen: string, CCCD: string, SDT: string, DiaChi: string, MaTK: number }): Promise<any> {
      const res = await db.query(
          `INSERT INTO KhachHang (HoTen, CCCD, SDT, DiaChi, MaTK)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [kh.HoTen, kh.CCCD, kh.SDT, kh.DiaChi, kh.MaTK]
      );
      return res.rows[0];
  }
}
