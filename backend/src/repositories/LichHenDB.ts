import { db } from '../config/db';
import { LichHenDTO } from '../models/LichHenDTO';

export class LichHenDB {
    static async them(lh: LichHenDTO) {
        console.log("LichHenDB: them called", lh);
        const query = `
            INSERT INTO PhieuDangKyHen (SoNguoi, NgayHen, GioHen, GhiChu, TrangThai, MaKH)
            VALUES ($1, $2, $3, $4, 0, $5) RETURNING *
        `;
        const params = [
            lh.SoNguoi || 1,
            lh.NgayHen,
            lh.GioHen,
            lh.GhiChu || '',
            lh.MaKH || 1
        ];
        const result = await db.query(query, params);
        const newAppointment = result.rows ? result.rows[0] : null;

        if (newAppointment && Array.isArray(lh.DanhSachMaPhong) && lh.DanhSachMaPhong.length > 0) {
            for (const maPhong of lh.DanhSachMaPhong) {
                if (maPhong) {
                    await db.query(
                        `INSERT INTO CT_LichHen (MaPhieu, MaPhong) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [newAppointment.maphieu, maPhong]
                    );
                }
            }
        }
        return newAppointment;
    }

    static async LayDS() {
        console.log("LichHenDB: LayDS called");
        await db.query(`ALTER TABLE PhieuDangKyHen ADD COLUMN IF NOT EXISTS PhanHoi TEXT`).catch(() => {});
        const query = `
            SELECT 
                lh.MaPhieu, lh.SoNguoi, lh.NgayHen, lh.GioHen, lh.GhiChu, lh.TrangThai, lh.MaKH, lh.PhanHoi,
                COALESCE(
                    string_agg(DISTINCT p.TenPhong, ', ') FILTER (WHERE p.TenPhong IS NOT NULL),
                    'Chưa chọn phòng'
                ) AS dsphongxem,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object('MaPhong', ctlh.MaPhong, 'TenPhong', p.TenPhong)
                    ) FILTER (WHERE ctlh.MaPhong IS NOT NULL),
                    '[]'
                ) AS chi_tiet_phong
            FROM PhieuDangKyHen lh
            LEFT JOIN CT_LichHen ctlh ON lh.MaPhieu = ctlh.MaPhieu
            LEFT JOIN Phong p ON ctlh.MaPhong = p.MaPhong
            GROUP BY lh.MaPhieu, lh.SoNguoi, lh.NgayHen, lh.GioHen, lh.GhiChu, lh.TrangThai, lh.MaKH, lh.PhanHoi
            ORDER BY lh.MaPhieu DESC
        `;
        const result = await db.query(query);
        return result.rows || [];
    }

    static async CapNhatTT(id: number, tt: number, phanHoi?: string) {
        console.log("LichHenDB: CapNhatTT called with id", id, "status", tt, "phanHoi", phanHoi);
        await db.query(`ALTER TABLE PhieuDangKyHen ADD COLUMN IF NOT EXISTS PhanHoi TEXT`).catch(() => {});
        const query = `
            UPDATE PhieuDangKyHen 
            SET TrangThai = $1, PhanHoi = $3 
            WHERE MaPhieu = $2 RETURNING *
        `;
        const result = await db.query(query, [tt, id, phanHoi || '']);
        
        if (result.rows && result.rows.length > 0) {
            const updated = result.rows[0];
            updated.phanhoi = phanHoi || '';
            const emailQuery = `SELECT Email, HoTen FROM KhachHang WHERE MaKH = $1`;
            const emailResult = await db.query(emailQuery, [updated.makh]);
            if (emailResult.rows && emailResult.rows.length > 0) {
                updated.email = emailResult.rows[0].email;
                updated.hoten = emailResult.rows[0].hoten;
            }
            return updated;
        }
        return null;
    }
}


