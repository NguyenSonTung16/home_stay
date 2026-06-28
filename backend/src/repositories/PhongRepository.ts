import { db } from '../config/db';

export class PhongRepository {
  async capNhatTrangThai(maPhong: number, trangThai: number): Promise<boolean> {
    const res = await db.query('UPDATE Phong SET TrangThai = $1 WHERE MaPhong = $2', [trangThai, maPhong]);
    return (res as any).rowCount > 0;
  }
}
