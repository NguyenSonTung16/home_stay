import { db } from '../config/db';

export class DoiSoatRepository {
  /** Lấy danh sách chi nhánh distinct từ Phong */
  async layDanhSachChiNhanh(): Promise<string[]> {
    const res = await db.query(
      `SELECT DISTINCT ChiNhanh FROM Phong WHERE ChiNhanh IS NOT NULL AND ChiNhanh <> '' ORDER BY ChiNhanh`
    );
    return res.rows.map(row => row.chinhanh);
  }

  /** ─── ĐỐI SOÁT ĐẶT CỌC ─────────────────────────────────────────────────── */

  async layDanhSachDatCoc(filters: {
    thang?: number;
    nam?: number;
    chiNhanh?: string;
    trangThai?: string;
    page?: number;
    limit?: number;
  }): Promise<{ list: any[], total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang !== undefined) {
      whereClauses.push(`EXTRACT(MONTH FROM pdc.ThoiGianTao) = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.nam !== undefined) {
      whereClauses.push(`EXTRACT(YEAR FROM pdc.ThoiGianTao) = $${idx++}`);
      params.push(filters.nam);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`p.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }
    if (filters.trangThai) {
      whereClauses.push(`pdc.TrangThaiMoi = $${idx++}`);
      params.push(filters.trangThai);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    // Đếm tổng số
    const countRes = await db.query(
      `SELECT COUNT(*) as total 
       FROM PhieuDatCoc pdc
       LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
       WHERE ${whereClauseStr}`,
      params
    );
    const total = parseInt(countRes.rows[0].total) || 0;

    // Lấy danh sách
    let queryStr = `
      SELECT pdc.MaCoc as macoc, pdc.SoTien as sotien, pdc.NgayCoc as ngaycoc,
             pdc.TrangThaiMoi as trangthai, pdc.PhuongThucThanhToan as ptthanhtoan,
             pdc.ThoiGianTao as thoigiantao, pdc.ThoiGianXacNhan as thoigianxacnhan,
             pdc.MaGiaoDich as magiaodich,
             p.TenPhong as tenphong, p.ChiNhanh as chinhanh,
             kh.HoTen as hoten, kh.Avatar as avatar
      FROM PhieuDatCoc pdc
      LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
      LEFT JOIN KhachHang kh ON pdc.MaKH = kh.MaKH
      WHERE ${whereClauseStr}
      ORDER BY pdc.MaCoc DESC
    `;

    if (filters.limit !== undefined && filters.page !== undefined) {
      const offset = (filters.page - 1) * filters.limit;
      queryStr += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(filters.limit, offset);
    }

    const listRes = await db.query(queryStr, params);
    return { list: listRes.rows, total };
  }

  async laySummaryDatCoc(filters: {
    thang?: number;
    nam?: number;
    chiNhanh?: string;
  }): Promise<{ tongDoanhThu: number, choThanhToanTien: number, choThanhToanSl: number, processed: number, total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang !== undefined) {
      whereClauses.push(`EXTRACT(MONTH FROM pdc.ThoiGianTao) = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.nam !== undefined) {
      whereClauses.push(`EXTRACT(YEAR FROM pdc.ThoiGianTao) = $${idx++}`);
      params.push(filters.nam);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`p.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    const res = await db.query(
      `SELECT 
         SUM(CASE WHEN pdc.TrangThaiMoi = 'DaThanhToan' THEN pdc.SoTien ELSE 0 END) as tongdoanhthu,
         SUM(CASE WHEN pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat') THEN pdc.SoTien ELSE 0 END) as chothanhtoantien,
         COUNT(CASE WHEN pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat') THEN 1 END) as chothanhtoansl,
         COUNT(CASE WHEN pdc.TrangThaiMoi IN ('DaThanhToan', 'DaHuy') THEN 1 END) as processed,
         COUNT(*) as total
       FROM PhieuDatCoc pdc
       LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
       WHERE ${whereClauseStr}`,
      params
    );

    const r = res.rows[0];
    return {
      tongDoanhThu: Number(r.tongdoanhthu) || 0,
      choThanhToanTien: Number(r.chothanhtoantien) || 0,
      choThanhToanSl: Number(r.chothanhtoansl) || 0,
      processed: parseInt(r.processed) || 0,
      total: parseInt(r.total) || 0
    };
  }

  /** ─── ĐỐI SOÁT HÓA ĐƠN ĐỊNH KỲ ─────────────────────────────────────────── */

  async layDanhSachHoaDonDinhKy(filters: {
    thang?: string; // Định dạng YYYY-MM
    chiNhanh?: string;
    trangThai?: string;
    page?: number;
    limit?: number;
  }): Promise<{ list: any[], total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang) {
      whereClauses.push(`pdk.Thang = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`r.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }
    if (filters.trangThai) {
      whereClauses.push(`COALESCE(dh.TrangThai, 'ChuaThanhToan') = $${idx++}`);
      params.push(filters.trangThai);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    // Đếm tổng số
    const countRes = await db.query(
      `SELECT COUNT(DISTINCT pdk.MaPDK) as total 
       FROM HoaDonPhiDinhKy pdk
       LEFT JOIN DonHang dh ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
       LEFT JOIN HopDong hd ON pdk.MaHD = hd.MaHD
       LEFT JOIN (
         SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
         FROM ChiTietGiuong ctg 
         JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
         JOIN Phong p ON g.MaPhong = p.MaPhong
       ) r ON r.MaHD = pdk.MaHD
       WHERE ${whereClauseStr}`,
      params
    );
    const total = parseInt(countRes.rows[0].total) || 0;

    // Lấy danh sách
    let queryStr = `
      SELECT DISTINCT ON (pdk.MaPDK)
             pdk.MaPDK as mapdk, pdk.TongTien as tongtien, pdk.Thang as thang,
             COALESCE(dh.TrangThai, 'ChuaThanhToan') as trangthai,
             pdk.TienPhong as tienphong, pdk.TienDichVu as tiendichvu,
             dh.MaDH as madh, dh.PhuongThuc as phuongthuc, dh.NgayTao as ngaytao,
             hd.MaHD as mahd, kh.HoTen as hoten, kh.Avatar as avatar,
             r.TenPhong as tenphong, r.ChiNhanh as chinhanh
      FROM HoaDonPhiDinhKy pdk
      LEFT JOIN DonHang dh ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
      LEFT JOIN HopDong hd ON pdk.MaHD = hd.MaHD
      LEFT JOIN KhachHang kh ON hd.MaKHDaiDien = kh.MaKH
      LEFT JOIN (
        SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.TenPhong, p.ChiNhanh 
        FROM ChiTietGiuong ctg 
        JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
        JOIN Phong p ON g.MaPhong = p.MaPhong
      ) r ON r.MaHD = pdk.MaHD
      WHERE ${whereClauseStr}
      ORDER BY pdk.MaPDK DESC
    `;

    if (filters.limit !== undefined && filters.page !== undefined) {
      const offset = (filters.page - 1) * filters.limit;
      queryStr += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(filters.limit, offset);
    }

    const listRes = await db.query(queryStr, params);
    return { list: listRes.rows, total };
  }

  async laySummaryHoaDonDinhKy(filters: {
    thang?: string;
    chiNhanh?: string;
  }): Promise<{ tongDoanhThu: number, choThanhToanTien: number, choThanhToanSl: number, processed: number, total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang) {
      whereClauses.push(`pdk.Thang = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`r.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    const res = await db.query(
      `SELECT 
         SUM(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') = 'DaThanhToan' THEN pdk.TongTien ELSE 0 END) as tongdoanhthu,
         SUM(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('ChuaThanhToan', 'ChoXacNhanTienMat', 'DangCho') THEN pdk.TongTien ELSE 0 END) as chothanhtoantien,
         COUNT(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('ChuaThanhToan', 'ChoXacNhanTienMat', 'DangCho') THEN 1 END) as chothanhtoansl,
         COUNT(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('DaThanhToan', 'DaHuy') THEN 1 END) as processed,
         COUNT(*) as total
       FROM HoaDonPhiDinhKy pdk
       LEFT JOIN DonHang dh ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
       LEFT JOIN (
         SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
         FROM ChiTietGiuong ctg 
         JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
         JOIN Phong p ON g.MaPhong = p.MaPhong
       ) r ON r.MaHD = pdk.MaHD
       WHERE ${whereClauseStr}`,
      params
    );

    const r = res.rows[0];
    return {
      tongDoanhThu: Number(r.tongdoanhthu) || 0,
      choThanhToanTien: Number(r.chothanhtoantien) || 0,
      choThanhToanSl: Number(r.chothanhtoansl) || 0,
      processed: parseInt(r.processed) || 0,
      total: parseInt(r.total) || 0
    };
  }

  /** ─── ĐỐI SOÁT HÓA ĐƠN ĐIỆN NƯỚC ────────────────────────────────────────── */

  async layDanhSachHoaDonDienNuoc(filters: {
    thang?: string; // Định dạng YYYY-MM
    chiNhanh?: string;
    trangThai?: string;
    page?: number;
    limit?: number;
  }): Promise<{ list: any[], total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang) {
      whereClauses.push(`hddn.Thang = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`p.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }
    if (filters.trangThai) {
      whereClauses.push(`COALESCE(dh.TrangThai, 'ChuaThanhToan') = $${idx++}`);
      params.push(filters.trangThai);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    // Đếm tổng số
    const countRes = await db.query(
      `SELECT COUNT(DISTINCT hddn.MaHDDN) as total 
       FROM HoaDonDienNuoc hddn
       LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
       LEFT JOIN DonHang dh ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
       WHERE ${whereClauseStr}`,
      params
    );
    const total = parseInt(countRes.rows[0].total) || 0;

    // Lấy danh sách
    let queryStr = `
      SELECT DISTINCT ON (hddn.MaHDDN)
             hddn.MaHDDN as mahddn, hddn.TongTien as tongtien, hddn.Thang as thang,
             COALESCE(dh.TrangThai, 'ChuaThanhToan') as trangthai,
             hddn.CSDienCu as csdiencu, hddn.CSDienMoi as csdienmoi,
             hddn.CSNuocCu as csnuoccu, hddn.CSNuocMoi as csnuocmoi,
             hddn.TienDien as tiendien, hddn.TienNuoc as tiennuoc,
             dh.MaDH as madh, dh.PhuongThuc as phuongthuc, dh.NgayTao as ngaytao,
             p.TenPhong as tenphong, p.ChiNhanh as chinhanh,
             rkh.HoTen as hoten, rkh.Avatar as avatar
      FROM HoaDonDienNuoc hddn
      LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
      LEFT JOIN DonHang dh ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
      LEFT JOIN (
        SELECT DISTINCT ON (g.MaPhong) g.MaPhong, kh.HoTen, kh.Avatar
        FROM Giuong g
        JOIN ChiTietGiuong ctg ON g.MaGiuong = ctg.MaGiuong
        JOIN HopDong hd ON ctg.MaHD = hd.MaHD
        JOIN KhachHang kh ON hd.MaKHDaiDien = kh.MaKH
      ) rkh ON rkh.MaPhong = hddn.MaPhong
      WHERE ${whereClauseStr}
      ORDER BY hddn.MaHDDN DESC
    `;

    if (filters.limit !== undefined && filters.page !== undefined) {
      const offset = (filters.page - 1) * filters.limit;
      queryStr += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(filters.limit, offset);
    }

    const listRes = await db.query(queryStr, params);
    return { list: listRes.rows, total };
  }

  async laySummaryHoaDonDienNuoc(filters: {
    thang?: string;
    chiNhanh?: string;
  }): Promise<{ tongDoanhThu: number, choThanhToanTien: number, choThanhToanSl: number, processed: number, total: number }> {
    let whereClauses = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (filters.thang) {
      whereClauses.push(`hddn.Thang = $${idx++}`);
      params.push(filters.thang);
    }
    if (filters.chiNhanh) {
      whereClauses.push(`p.ChiNhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    const res = await db.query(
      `SELECT 
         SUM(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') = 'DaThanhToan' THEN hddn.TongTien ELSE 0 END) as tongdoanhthu,
         SUM(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('ChuaThanhToan', 'ChoXacNhanTienMat', 'DangCho') THEN hddn.TongTien ELSE 0 END) as chothanhtoantien,
         COUNT(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('ChuaThanhToan', 'ChoXacNhanTienMat', 'DangCho') THEN 1 END) as chothanhtoansl,
         COUNT(CASE WHEN COALESCE(dh.TrangThai, 'ChuaThanhToan') IN ('DaThanhToan', 'DaHuy') THEN 1 END) as processed,
         COUNT(*) as total
       FROM HoaDonDienNuoc hddn
       LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
       LEFT JOIN DonHang dh ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
       WHERE ${whereClauseStr}`,
      params
    );

    const r = res.rows[0];
    return {
      tongDoanhThu: Number(r.tongdoanhthu) || 0,
      choThanhToanTien: Number(r.chothanhtoantien) || 0,
      choThanhToanSl: Number(r.chothanhtoansl) || 0,
      processed: parseInt(r.processed) || 0,
      total: parseInt(r.total) || 0
    };
  }

  /** Lấy chi tiết hóa đơn định kỳ theo ID */
  async layChiTietHoaDonDinhKy(id: number): Promise<any | null> {
    const res = await db.query(
      `SELECT pdk.MaPDK as mapdk, pdk.TongTien as tongtien, pdk.Thang as thang,
              pdk.TienPhong as tienphong, pdk.TienDichVu as tiendichvu,
              COALESCE(dh.TrangThai, 'ChuaThanhToan') as trangthai,
              dh.MaDH as madh, dh.PhuongThuc as phuongthuc, dh.NgayTao as ngaytao,
              hd.MaHD as mahd, hd.NgayKy as ngayky, hd.NgayHetHan as ngayhethan,
              kh.HoTen as hoten, kh.SDT as sdt, kh.Email as email, kh.CCCD as cccd,
              r.TenPhong as tenphong, r.ChiNhanh as chinhanh
       FROM HoaDonPhiDinhKy pdk
       LEFT JOIN HopDong hd ON pdk.MaHD = hd.MaHD
       LEFT JOIN KhachHang kh ON hd.MaKHDaiDien = kh.MaKH
       LEFT JOIN DonHang dh ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
       LEFT JOIN (
         SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.TenPhong, p.ChiNhanh 
         FROM ChiTietGiuong ctg 
         JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
         JOIN Phong p ON g.MaPhong = p.MaPhong
       ) r ON r.MaHD = pdk.MaHD
       WHERE pdk.MaPDK = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  /** Lấy chi tiết hóa đơn điện nước theo ID */
  async layChiTietHoaDonDienNuoc(id: number): Promise<any | null> {
    const res = await db.query(
      `SELECT hddn.MaHDDN as mahddn, hddn.TongTien as tongtien, hddn.Thang as thang,
              hddn.CSDienCu as csdiencu, hddn.CSDienMoi as csdienmoi,
              hddn.CSNuocCu as csnuoccu, hddn.CSNuocMoi as csnuocmoi,
              hddn.TienDien as tiendien, hddn.TienNuoc as tiennuoc,
              COALESCE(dh.TrangThai, 'ChuaThanhToan') as trangthai,
              dh.MaDH as madh, dh.PhuongThuc as phuongthuc, dh.NgayTao as ngaytao,
              p.TenPhong as tenphong, p.ChiNhanh as chinhanh,
              rkh.HoTen as hoten, rkh.SDT as sdt, rkh.Email as email, rkh.CCCD as cccd
       FROM HoaDonDienNuoc hddn
       LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
       LEFT JOIN DonHang dh ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
       LEFT JOIN (
         SELECT DISTINCT ON (g.MaPhong) g.MaPhong, kh.HoTen, kh.SDT, kh.Email, kh.CCCD
         FROM Giuong g
         JOIN ChiTietGiuong ctg ON g.MaGiuong = ctg.MaGiuong
         JOIN HopDong hd ON ctg.MaHD = hd.MaHD
         JOIN KhachHang kh ON hd.MaKHDaiDien = kh.MaKH
       ) rkh ON rkh.MaPhong = hddn.MaPhong
       WHERE hddn.MaHDDN = $1`,
      [id]
    );
    return res.rows[0] || null;
  }
}
