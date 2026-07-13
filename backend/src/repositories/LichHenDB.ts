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
        const query = `
            SELECT 
                lh.MaPhieu, lh.SoNguoi, lh.NgayHen, lh.GioHen, lh.GhiChu, lh.TrangThai, lh.MaKH,
                kh.HoTen, kh.SDT, kh.Email,
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
            LEFT JOIN KhachHang kh ON lh.MaKH = kh.MaKH
            LEFT JOIN CT_LichHen ctlh ON lh.MaPhieu = ctlh.MaPhieu
            LEFT JOIN Phong p ON ctlh.MaPhong = p.MaPhong
            GROUP BY lh.MaPhieu, lh.SoNguoi, lh.NgayHen, lh.GioHen, lh.GhiChu, lh.TrangThai, lh.MaKH, kh.HoTen, kh.SDT, kh.Email
            ORDER BY lh.MaPhieu ASC
        `;
        const result = await db.query(query);
        return result.rows || [];
    }

    static async CapNhatTT(id: number, tt: number) {
        console.log("LichHenDB: CapNhatTT called with id", id, "status", tt);
        const query = `
            UPDATE PhieuDangKyHen 
            SET TrangThai = $1 
            WHERE MaPhieu = $2 RETURNING *
        `;
        const result = await db.query(query, [tt, id]);
        return result.rows ? result.rows[0] : null;
    }
}


