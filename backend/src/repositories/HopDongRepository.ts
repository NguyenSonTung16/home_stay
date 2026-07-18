import { db } from '../config/db';

export class HopDongRepository {
  async layDanhSachTheoTrangThai(trangThai: number): Promise<any> {
    const res = await db.query(`
      SELECT DISTINCT ON (h.MaHD) h.*, k.HoTen, pkt.MaPKT, y.NgayDuKien as ngayyeucau,
        CASE 
          WHEN y.TrangThai = 4 THEN 5 
          WHEN bds.MaBDS IS NULL THEN 1 
          ELSE 2 
        END as trangthai
      FROM HopDong h 
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      JOIN YeuCauTraPhong y ON y.MaHD = h.MaHD
      JOIN PhieuKiemTraPhong pkt ON pkt.MaYC = y.MaYC
      LEFT JOIN BangDoiSoat bds ON bds.MaPKT = pkt.MaPKT
      ORDER BY h.MaHD, pkt.MaPKT DESC
    `);
    return res.rows;
  }
  
  async layThongTin(maHD: number): Promise<any> {
    const res = await db.query('SELECT * FROM HopDong WHERE MaHD = $1', [maHD]);
    return res.rows.length ? res.rows[0] : null;
  }

  async layTienCocCuaHopDong(maHD: number): Promise<any> {
    const res = await db.query(`
      SELECT pd.SoTien FROM PhieuDatCoc pd
      JOIN KhachHang kh ON kh.MaKH = pd.MaKH
      JOIN HopDong hd ON hd.MaKHDaiDien = kh.MaKH
      WHERE hd.MaHD = $1 LIMIT 1
    `, [maHD]);
    return res.rows.length ? Number(res.rows[0].sotien) : 0;
  }

  async capNhatTrangThai(maHD: number, trangThai: number): Promise<any> {
    return true; 
  }

  async getActiveByKH(maKH: number): Promise<any[]> {
    const res = await db.query(`
      SELECT DISTINCT h.MaHD, h.NgayKy, h.NgayHetHan, p.TenPhong,
             CASE WHEN y.MaYC IS NOT NULL THEN true ELSE false END AS hasyeucau
      FROM HopDong h
      JOIN ChiTietGiuong cg ON cg.MaHD = h.MaHD
      JOIN Giuong g ON g.MaGiuong = cg.MaGiuong
      JOIN Phong p ON p.MaPhong = g.MaPhong
      LEFT JOIN YeuCauTraPhong y ON y.MaHD = h.MaHD
      WHERE h.MaKHDaiDien = $1
      ORDER BY h.MaHD DESC
    `, [maKH]);
    return res.rows;
  }
  async layHopDongActiveTheoMaTK(maTK: number): Promise<any> {
    const res = await db.query(`
      SELECT 
        h.*,
        g.MaPhong,
        ph.TenPhong,
        lp.GiaTien AS GiaThue,
        ctdc.SoGiuongThue AS SoGiuong,
        pdc.SoTien AS TienCoc,
        h.NgayKy AS NgayBatDau,
        h.NgayHetHan AS NgayKetThuc
      FROM HopDong h
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      JOIN ChiTietGiuong ctg ON h.MaHD = ctg.MaHD
      JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong
      JOIN Phong ph ON g.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      LEFT JOIN PhieuDatCoc pdc ON pdc.MaKH = k.MaKH AND pdc.MaPhong = ph.MaPhong
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      WHERE k.MaTK = $1 AND h.NgayHetHan >= CURRENT_DATE
      ORDER BY h.MaHD DESC LIMIT 1
    `, [maTK]);
    return res.rows.length ? res.rows[0] : null;
  }

  async layHopDongGanNhatTheoMaTK(maTK: number): Promise<any> {
    const res = await db.query(`
      SELECT 
        h.*,
        g.MaPhong,
        ph.TenPhong,
        lp.GiaTien AS GiaThue,
        ctdc.SoGiuongThue AS SoGiuong,
        pdc.SoTien AS TienCoc,
        h.NgayKy AS NgayBatDau,
        h.NgayHetHan AS NgayKetThuc
      FROM HopDong h
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      JOIN ChiTietGiuong ctg ON h.MaHD = ctg.MaHD
      JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong
      JOIN Phong ph ON g.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      LEFT JOIN PhieuDatCoc pdc ON pdc.MaKH = k.MaKH AND pdc.MaPhong = ph.MaPhong
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      WHERE k.MaTK = $1
      ORDER BY h.MaHD DESC LIMIT 1
    `, [maTK]);
    return res.rows.length ? res.rows[0] : null;
  }

  async layDanhSachHopDongTheoMaTK(maTK: number): Promise<any[]> {
    const res = await db.query(`
      SELECT DISTINCT ON (h.MaHD)
        h.*,
        g.MaPhong,
        ph.TenPhong,
        lp.GiaTien AS GiaThue,
        ctdc.SoGiuongThue AS SoGiuong,
        pdc.SoTien AS TienCoc,
        h.NgayKy AS NgayBatDau,
        h.NgayHetHan AS NgayKetThuc
      FROM HopDong h
      JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
      JOIN ChiTietGiuong ctg ON h.MaHD = ctg.MaHD
      JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong
      JOIN Phong ph ON g.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      LEFT JOIN PhieuDatCoc pdc ON pdc.MaKH = k.MaKH AND pdc.MaPhong = ph.MaPhong
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      WHERE k.MaTK = $1
      ORDER BY h.MaHD DESC
    `, [maTK]);
    return res.rows;
  }

  async taoHopDongTuDong(client: any, phieu: any): Promise<number> {
    // 1. Tạo Hợp Đồng (NgayKy = NOW, NgayHetHan = NOW + 6 months, NhanVien = 1)
    const resHD = await client.query(`
      INSERT INTO HopDong (NgayKy, NgayHetHan, MaKHDaiDien, MaNV) 
      VALUES (CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', $1, 1) 
      RETURNING MaHD
    `, [phieu.makh]);
    const maHD = resHD.rows[0].mahd;

    // 2. Thêm Thành Viên Thuê
    await client.query(`
      INSERT INTO ThanhVienThue (MaHD, MaKH) VALUES ($1, $2)
    `, [maHD, phieu.makh]);

    // 3. Thêm Chi Tiết Giường
    // magiuong được lấy từ kết quả JOIN PhieuDatCoc + ChiTietXuLyDatCoc
    await client.query(`
      INSERT INTO ChiTietGiuong (MaHD, MaGiuong) VALUES ($1, $2)
    `, [maHD, phieu.magiuong]);

    return maHD;
  }
}
