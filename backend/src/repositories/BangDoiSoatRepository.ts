import { db } from '../config/db';
import { IBangDoiSoat } from '../services/HoanCocService';

export class BangDoiSoatRepository {
  async themPhanGhiMoi(bds: IBangDoiSoat) {
    const res = await db.query(`
      INSERT INTO BangDoiSoat (TienCoc, KhauTru, ThucNhanChi, MaPKT, MaNV)
      VALUES ($1, $2, $3, $4, $5) RETURNING MaBDS
    `, [bds.tienCoc, bds.khauTru, bds.thucNhanChi, bds.maPKT, bds.maNV]);
    // Trả về true nếu insert thành công
    return (res as any).rowCount > 0;
  }
}
