import { db } from '../config/db';

export class BaoCaoRepository {
  
  /** Lấy doanh thu phân rã theo granularity */
  async layDoanhThuPhanRa(filters: {
    tuNgay: string;
    denNgay: string;
    granularity: 'day' | 'week' | 'month' | 'year';
    chiNhanh?: string;
  }): Promise<any[]> {
    let whereClauses = ['thoigian >= $1::timestamp', 'thoigian <= $2::timestamp + interval \'23 hours 59 minutes 59 seconds\''];
    const params: any[] = [filters.tuNgay, filters.denNgay];
    let idx = 3;

    if (filters.chiNhanh) {
      whereClauses.push(`chinhanh = $${idx++}`);
      params.push(filters.chiNhanh);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    const queryStr = `
      SELECT 
        time_bucket as thoigian,
        SUM(CASE WHEN nguon = 'dat_coc' THEN sotien ELSE 0 END) as datcoc,
        SUM(CASE WHEN nguon = 'phi_dinh_ky' THEN sotien ELSE 0 END) as hoadondinhky,
        SUM(CASE WHEN nguon = 'dien_nuoc' THEN sotien ELSE 0 END) as hoadondiennuoc,
        SUM(sotien) as tong
      FROM (
        SELECT 
          nguon, 
          sotien,
          thoigian,
          chinhanh,
          CASE 
            WHEN '${filters.granularity}' = 'day' THEN TO_CHAR(thoigian, 'YYYY-MM-DD')
            WHEN '${filters.granularity}' = 'week' THEN TO_CHAR(DATE_TRUNC('week', thoigian), 'YYYY-"W"IW')
            WHEN '${filters.granularity}' = 'month' THEN TO_CHAR(thoigian, 'YYYY-MM')
            ELSE TO_CHAR(thoigian, 'YYYY')
          END as time_bucket
        FROM (
          -- Nguồn 1: Đặt cọc
          SELECT 'dat_coc' as nguon, pdc.SoTien as sotien, ctdc.ThoiGianXacNhan as thoigian, p.ChiNhanh as chinhanh
          FROM PhieuDatCoc pdc
          JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
          LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
          WHERE pdc.TrangThaiMoi = 'DaThanhToan' AND ctdc.ThoiGianXacNhan IS NOT NULL

          UNION ALL

          -- Nguồn 2: Phí định kỳ
          SELECT 'phi_dinh_ky' as nguon, dh.TongTien as sotien, dh.NgayTao as thoigian, r.ChiNhanh as chinhanh
          FROM DonHang dh
          LEFT JOIN HoaDonPhiDinhKy pdk ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
          LEFT JOIN (
            SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
            FROM ChiTietGiuong ctg 
            JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
            JOIN Phong p ON g.MaPhong = p.MaPhong
          ) r ON r.MaHD = pdk.MaHD
          WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'PhiDinhKy'

          UNION ALL

          -- Nguồn 3: Điện nước
          SELECT 'dien_nuoc' as nguon, dh.TongTien as sotien, dh.NgayTao as thoigian, p.ChiNhanh as chinhanh
          FROM DonHang dh
          LEFT JOIN HoaDonDienNuoc hddn ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
          LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
          WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'DienNuoc'
        ) sub
      ) group_sub
      WHERE ${whereClauseStr}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;

    const res = await db.query(queryStr, params);
    return res.rows.map(r => ({
      thoigian: r.thoigian,
      datCoc: Number(r.datcoc),
      hoaDonDinhKy: Number(r.hoadondinhky),
      hoaDonDienNuoc: Number(r.hoadondiennuoc),
      tong: Number(r.tong)
    }));
  }

  /** Lấy tổng doanh thu của 1 tháng/năm */
  async layDoanhThuThang(thang: number, nam: number, chiNhanh?: string): Promise<number> {
    let whereClauses = ['EXTRACT(MONTH FROM thoigian) = $1', 'EXTRACT(YEAR FROM thoigian) = $2'];
    const params: any[] = [thang, nam];
    let idx = 3;

    if (chiNhanh) {
      whereClauses.push(`chinhanh = $${idx++}`);
      params.push(chiNhanh);
    }

    const whereClauseStr = whereClauses.join(' AND ');

    const queryStr = `
      SELECT SUM(sotien) as tong
      FROM (
        SELECT pdc.SoTien as sotien, ctdc.ThoiGianXacNhan as thoigian, p.ChiNhanh as chinhanh
        FROM PhieuDatCoc pdc
        JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
        LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
        WHERE pdc.TrangThaiMoi = 'DaThanhToan' AND ctdc.ThoiGianXacNhan IS NOT NULL

        UNION ALL

        SELECT dh.TongTien as sotien, dh.NgayTao as thoigian, r.ChiNhanh as chinhanh
        FROM DonHang dh
        LEFT JOIN HoaDonPhiDinhKy pdk ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
        LEFT JOIN (
          SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
          FROM ChiTietGiuong ctg 
          JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
          JOIN Phong p ON g.MaPhong = p.MaPhong
        ) r ON r.MaHD = pdk.MaHD
        WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'PhiDinhKy'

        UNION ALL

        SELECT dh.TongTien as sotien, dh.NgayTao as thoigian, p.ChiNhanh as chinhanh
        FROM DonHang dh
        LEFT JOIN HoaDonDienNuoc hddn ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
        LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
        WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'DienNuoc'
      ) sub
      WHERE ${whereClauseStr}
    `;

    const res = await db.query(queryStr, params);
    return Number(res.rows[0].tong) || 0;
  }

  /** Lấy doanh thu dự kiến của 1 tháng/năm */
  async layDoanhThuDuKien(thang: number, nam: number, chiNhanh?: string): Promise<number> {
    const formattedThang = `${nam}-${String(thang).padStart(2, '0')}`;

    // 1. PhieuDatCoc chưa thanh toán trong tháng và chưa quá hạn
    let pdcQuery = `
      SELECT SUM(pdc.SoTien) as tong
      FROM PhieuDatCoc pdc
      JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
      WHERE pdc.TrangThaiMoi = 'ChoThanhToan' 
        AND ctdc.ThoiGianHetHan > NOW()
        AND EXTRACT(MONTH FROM pdc.NgayCoc) = $1
        AND EXTRACT(YEAR FROM pdc.NgayCoc) = $2
    `;
    const pdcParams: any[] = [thang, nam];
    if (chiNhanh) {
      pdcQuery += ` AND p.ChiNhanh = $3`;
      pdcParams.push(chiNhanh);
    }
    const pdcRes = await db.query(pdcQuery, pdcParams);
    const pdcTien = Number(pdcRes.rows[0].tong) || 0;

    // 2. HoaDonPhiDinhKy chưa thanh toán (TrangThai = 'ChuaThanhToan')
    let pdkQuery = `
      SELECT SUM(pdk.TongTien) as tong
      FROM HoaDonPhiDinhKy pdk
      LEFT JOIN (
        SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
        FROM ChiTietGiuong ctg 
        JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
        JOIN Phong p ON g.MaPhong = p.MaPhong
      ) r ON r.MaHD = pdk.MaHD
      WHERE pdk.TrangThai = 'ChuaThanhToan' AND pdk.Thang = $1
    `;
    const pdkParams: any[] = [formattedThang];
    if (chiNhanh) {
      pdkQuery += ` AND r.ChiNhanh = $2`;
      pdkParams.push(chiNhanh);
    }
    const pdkRes = await db.query(pdkQuery, pdkParams);
    const pdkTien = Number(pdkRes.rows[0].tong) || 0;

    // 3. HoaDonDienNuoc chưa thanh toán (TrangThai = 'ChuaThanhToan')
    let hddnQuery = `
      SELECT SUM(hddn.TongTien) as tong
      FROM HoaDonDienNuoc hddn
      LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
      WHERE hddn.TrangThai = 'ChuaThanhToan' AND hddn.Thang = $1
    `;
    const hddnParams: any[] = [formattedThang];
    if (chiNhanh) {
      hddnQuery += ` AND p.ChiNhanh = $2`;
      hddnParams.push(chiNhanh);
    }
    const hddnRes = await db.query(hddnQuery, hddnParams);
    const hddnTien = Number(hddnRes.rows[0].tong) || 0;

    return pdcTien + pdkTien + hddnTien;
  }

  /** Lấy tổng công nợ quá hạn từ bảng HopDong (TrangThai = 5 hoặc bds.ThucNhanChi < 0) */
  async layTongCongNo(chiNhanh?: string): Promise<number> {
    let query = `
      SELECT SUM(ABS(bds.ThucNhanChi)) as tong
      FROM BangDoiSoat bds
      JOIN PhieuKiemTraPhong pkt ON bds.MaPKT = pkt.MaPKT
      JOIN YeuCauTraPhong y ON pkt.MaYC = y.MaYC
      JOIN HopDong h ON y.MaHD = h.MaHD
      LEFT JOIN (
        SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
        FROM ChiTietGiuong ctg 
        JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
        JOIN Phong p ON g.MaPhong = p.MaPhong
      ) r ON r.MaHD = h.MaHD
      WHERE bds.ThucNhanChi < 0
    `;
    const params: any[] = [];
    if (chiNhanh) {
      query += ` AND r.ChiNhanh = $1`;
      params.push(chiNhanh);
    }
    const res = await db.query(query, params);
    return Number(res.rows[0].tong) || 0;
  }

  /** Lấy doanh thu phân rã theo chi nhánh */
  async layDoanhThuTheoChiNhanh(thang: number, nam: number): Promise<any[]> {
    const queryStr = `
      SELECT 
        COALESCE(chinhanh, 'Chưa xác định') as chinhanh,
        SUM(sotien) as tongdoanhthu
      FROM (
        SELECT pdc.SoTien as sotien, ctdc.ThoiGianXacNhan as thoigian, p.ChiNhanh as chinhanh
        FROM PhieuDatCoc pdc
        JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
        LEFT JOIN Phong p ON pdc.MaPhong = p.MaPhong
        WHERE pdc.TrangThaiMoi = 'DaThanhToan' AND ctdc.ThoiGianXacNhan IS NOT NULL

        UNION ALL

        SELECT dh.TongTien as sotien, dh.NgayTao as thoigian, r.ChiNhanh as chinhanh
        FROM DonHang dh
        LEFT JOIN HoaDonPhiDinhKy pdk ON dh.MaHoaDon = pdk.MaPDK AND dh.LoaiHoaDon = 'PhiDinhKy'
        LEFT JOIN (
          SELECT DISTINCT ON (ctg.MaHD) ctg.MaHD, p.ChiNhanh 
          FROM ChiTietGiuong ctg 
          JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong 
          JOIN Phong p ON g.MaPhong = p.MaPhong
        ) r ON r.MaHD = pdk.MaHD
        WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'PhiDinhKy'

        UNION ALL

        SELECT dh.TongTien as sotien, dh.NgayTao as thoigian, p.ChiNhanh as chinhanh
        FROM DonHang dh
        LEFT JOIN HoaDonDienNuoc hddn ON dh.MaHoaDon = hddn.MaHDDN AND dh.LoaiHoaDon = 'DienNuoc'
        LEFT JOIN Phong p ON hddn.MaPhong = p.MaPhong
        WHERE dh.TrangThai = 'DaThanhToan' AND dh.LoaiHoaDon = 'DienNuoc'
      ) sub
      WHERE EXTRACT(MONTH FROM thoigian) = $1 AND EXTRACT(YEAR FROM thoigian) = $2
      GROUP BY chinhanh
      ORDER BY tongdoanhthu DESC
    `;
    const res = await db.query(queryStr, [thang, nam]);
    return res.rows.map(row => ({
      chiNhanh: row.chinhanh,
      tongDoanhThu: Number(row.tongdoanhthu) || 0
    }));
  }
}
