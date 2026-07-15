import { db } from '../config/db';
import { PhongDTO } from '../models';

export class PhongDB {
    static async layDS(): Promise<PhongDTO[]> {
        console.log("PhongDB: layDS called (không tham số)");
        const query = `
            SELECT p.MaPhong, p.TenPhong, p.ChiNhanh, p.TrangThai, p.HinhAnh,
                   lp.TenLoai, lp.GiaTien, lp.SucChua,
                   (lp.SucChua 
                    - COUNT(CASE WHEN g.TrangThai = 1 THEN 1 END)
                    - COALESCE((SELECT SUM(ctdc.SoGiuongThue) FROM PhieuDatCoc pdc JOIN ChiTietXuLyDatCoc ctdc ON pdc.MaCoc = ctdc.MaCoc WHERE pdc.MaPhong = p.MaPhong AND pdc.TrangThaiMoi IN ('ChoDuyet', 'ChoThanhToan', 'ChoXacNhanTienMat', 'DaThanhToan')), 0)
                   )::int AS sogiuongtrong
            FROM Phong p
            JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
            LEFT JOIN Giuong g ON g.MaPhong = p.MaPhong
            WHERE p.TrangThai = 1
            GROUP BY p.MaPhong, p.TenPhong, p.ChiNhanh, p.TrangThai, p.HinhAnh, lp.TenLoai, lp.GiaTien, lp.SucChua
        `;
        const result = await db.query(query);
        const rows = result.rows || [];
        return rows.map((r: any) => ({
            MaPhong: r.maphong || r.MaPhong,
            TenPhong: r.tenphong || r.TenPhong,
            ChiNhanh: r.chinhanh || r.ChiNhanh,
            TrangThai: r.trangthai || r.TrangThai,
            TenLoai: r.tenloai || r.TenLoai,
            GiaTien: Number(r.giatien || r.GiaTien || 0),
            SucChua: Number(r.succhua || r.SucChua || 0),
            SoGiuongTrong: Number(r.sogiuongtrong || 0),
            DienTich: Number(r.dientich || r.DienTich || 25),
            TienIch: r.tienich || r.TienIch || ["wifi", "mayLanh", "tuCaNhan"],
            HinhAnh: r.hinhanh || r.HinhAnh
        }));
    }
}
