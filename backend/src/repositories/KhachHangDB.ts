import { db } from '../config/db';
import { KhachHangDTO } from '../models/KhachHangDTO';

export class KhachHangDB {
    static async DocThongTin(MaKH: string | number): Promise<KhachHangDTO | null> {
        console.log("KhachHangDB: DocThongTin called with", MaKH);
        const query = `SELECT * FROM KhachHang WHERE MaKH = $1`;
        const result = await db.query(query, [MaKH]);
        return result.rows && result.rows.length > 0 ? (result.rows[0] as KhachHangDTO) : null;
    }
}

