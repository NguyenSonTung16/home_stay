import { db } from '../config/db';

// DTO — field names match PostgreSQL lowercase column names
export interface PhieuDatCocDTO {
  macoc: number;
  makh: number;
  magiuong: number | null;
  maphong: number;
  sogiuongthue: number;
  tienthueperthang: number;
  tiencoc: number;
  phuongthucthanhtoan: string | null;
  trangthaimoi: string;
  magiaodich: string | null;
  urlchungtu: string | null;
  mahoadontienmat: string | null;
  nguoixacnhan: number | null;
  thoigiantao: Date;
  thoigianhethan: Date;
  thoigianxacnhan: Date | null;
}

export class PhieuDatCocRepository {
  // ─── LEGACY METHODS (Giữ nguyên để tương thích ngược) ──────────────────────
  
  async create(phieu: { SoTien: number, TrangThai: number, MaGiaoDich?: string, PTThanhToan?: string, MaKH: number, MaPhong: number }): Promise<any> {
    const res = await db.query(
      `INSERT INTO PhieuDatCoc (SoTien, TrangThai, MaGiaoDich, PTThanhToan, MaKH, MaPhong) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [phieu.SoTien, phieu.TrangThai, phieu.MaGiaoDich, phieu.PTThanhToan, phieu.MaKH, phieu.MaPhong]
    );
    return res.rows[0];
  }

  async getById(maCoc: number): Promise<any> {
    const res = await db.query('SELECT * FROM PhieuDatCoc WHERE MaCoc = $1', [maCoc]);
    return res.rows[0];
  }

  async updateStatusAndTransaction(maCoc: number, trangThai: number, ptThanhToan: string, maGiaoDich?: string): Promise<boolean> {
    const res = await db.query(
      'UPDATE PhieuDatCoc SET TrangThai = $1, PTThanhToan = $2, MaGiaoDich = $3 WHERE MaCoc = $4',
      [trangThai, ptThanhToan, maGiaoDich, maCoc]
    );
    return (res as any).rowCount > 0;
  }

  async getPending(): Promise<any[]> {
    const res = await db.query(`
      SELECT p.*, k.HoTen as hoten, ph.TenPhong as tenphong 
      FROM PhieuDatCoc p
      JOIN KhachHang k ON p.MaKH = k.MaKH
      JOIN Phong ph ON p.MaPhong = ph.MaPhong
      WHERE p.TrangThai = 2 OR p.TrangThaiMoi = 'ChoDuyet' OR p.TrangThaiMoi = 'ChoXacNhanTienMat'
      ORDER BY p.MaCoc DESC
    `);
    return res.rows;
  }

  async updateStatus(maCoc: number, trangThai: number): Promise<boolean> {
    const res = await db.query('UPDATE PhieuDatCoc SET TrangThai = $1 WHERE MaCoc = $2', [trangThai, maCoc]);
    return (res as any).rowCount > 0;
  }

  async getChuaThanhToanByKH(maKH: number): Promise<any[]> {
    const res = await db.query(`
      SELECT pdc.*, ph.TenPhong, lp.GiaTien
      FROM PhieuDatCoc pdc
      JOIN Phong ph ON pdc.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      WHERE pdc.MaKH = $1 AND pdc.TrangThai = 1
      ORDER BY pdc.MaCoc DESC
    `, [maKH]);
    return res.rows;
  }

  // ─── NEW METHODS (Cấu hình cọc v2) ──────────────────────────────────────────

  /** Tạo phiếu trong transaction client */
  async taoPhieu(client: any, data: {
    maKH: number;
    maGiuong: number;
    maPhong: number;
    soGiuongThue: number;
    tienThuePerThang: number;
    tienCoc: number;
    thoiGianHetHan: Date;
  }): Promise<PhieuDatCocDTO> {
    const res = await client.query(
      `INSERT INTO PhieuDatCoc 
         (MaKH, MaGiuong, MaPhong, SoGiuongThue, TienThuePerThang, TienCoc,
          TrangThai, TrangThaiMoi, ThoiGianTao, ThoiGianHetHan, SoTien)
       VALUES ($1, $2, $3, $4, $5, $6, 2, 'ChoDuyet', NOW(), $7, $6)
       RETURNING *`,
      [
        data.maKH,
        data.maGiuong,
        data.maPhong,
        data.soGiuongThue,
        data.tienThuePerThang,
        data.tienCoc,
        data.thoiGianHetHan,
      ]
    );
    return res.rows[0];
  }

  /** Lấy phiếu theo ID (có join thêm email khách hàng) */
  async layTheoId(maPDC: number): Promise<any | null> {
    const res = await db.query(
      `SELECT pdc.*, k.HoTen as hoten, k.Email as email,
              g.TenGiuong as tengiuong, p.TenPhong as tenphong,
              p.MaPhong as maphong_join
       FROM PhieuDatCoc pdc
       LEFT JOIN KhachHang k ON k.MaKH = pdc.MaKH
       LEFT JOIN Giuong g ON g.MaGiuong = pdc.MaGiuong
       LEFT JOIN Phong p ON p.MaPhong = pdc.MaPhong
       WHERE pdc.MaCoc = $1`,
      [maPDC]
    );
    return res.rows[0] || null;
  }

  /** FOR UPDATE — dùng trong transaction để check idempotency & lock */
  async layTheoIdForUpdate(client: any, maPDC: number): Promise<any | null> {
    const res = await client.query(
      `SELECT * FROM PhieuDatCoc WHERE MaCoc = $1 FOR UPDATE`,
      [maPDC]
    );
    return res.rows[0] || null;
  }

  /** Kiểm tra idempotency — phiếu đã được confirm bởi maGiaoDich này chưa */
  async layTheoMaGiaoDich(maGiaoDich: string): Promise<any | null> {
    const res = await db.query(
      `SELECT * FROM PhieuDatCoc WHERE MaGiaoDich = $1 AND TrangThaiMoi = 'DaThanhToan'`,
      [maGiaoDich]
    );
    return res.rows[0] || null;
  }

  /** Cập nhật trạng thái trong transaction */
  async capNhatTrangThai(client: any, maPDC: number, trangThai: string, extras?: {
    maGiaoDich?: string;
    nguoiXacNhan?: number;
    urlChungTu?: string;
    maHoaDonTienMat?: string;
  }): Promise<boolean> {
    const extraSets: string[] = [];
    const params: any[] = [trangThai, maPDC];
    let idx = 3;

    if (extras?.maGiaoDich !== undefined) {
      extraSets.push(`MaGiaoDich = $${idx++}`);
      params.splice(idx - 2, 0, extras.maGiaoDich);
    }
    if (extras?.nguoiXacNhan !== undefined) {
      extraSets.push(`NguoiXacNhan = $${idx++}`);
      params.splice(idx - 2, 0, extras.nguoiXacNhan);
    }
    if (extras?.urlChungTu !== undefined) {
      extraSets.push(`UrlChungTu = $${idx++}`);
      params.splice(idx - 2, 0, extras.urlChungTu);
    }
    if (extras?.maHoaDonTienMat !== undefined) {
      extraSets.push(`MaHoaDonTienMat = $${idx++}`);
      params.splice(idx - 2, 0, extras.maHoaDonTienMat);
    }

    const extraClause = extraSets.length > 0 ? ', ' + extraSets.join(', ') : '';
    const thoiGianXacNhan = trangThai === 'DaThanhToan' ? ', ThoiGianXacNhan = NOW()' : '';

    const res = await client.query(
      `UPDATE PhieuDatCoc 
       SET TrangThaiMoi = $1${extraClause}${thoiGianXacNhan}
       WHERE MaCoc = $2`,
      params
    );
    return (res.rowCount ?? 0) > 0;
  }

  /** Lấy tất cả phiếu quá hạn cần hủy */
  async layPhieuQuaHan(): Promise<any[]> {
    const res = await db.query(
      `SELECT pdc.*,
              pdc.TrangThaiMoi as trangthaimoi_val,
              k.Email as email, k.HoTen as hoten
       FROM PhieuDatCoc pdc
       LEFT JOIN KhachHang k ON k.MaKH = pdc.MaKH
       WHERE pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat')
         AND pdc.ThoiGianHetHan < NOW()`
    );
    return res.rows;
  }

  /** Lấy danh sách phiếu của khách hàng */
  async layTheoKhachHang(maKH: number, trangThai?: string): Promise<any[]> {
    let queryStr = `
      SELECT pdc.MaCoc as macoc, pdc.SoTien as sotien, pdc.NgayCoc as ngaycoc,
             pdc.TrangThaiMoi as trangthai, pdc.PhuongThucThanhToan as ptthanhtoan,
             pdc.ThoiGianTao as thoigiantao, pdc.ThoiGianHetHan as thoigianhethan,
             pdc.ThoiGianXacNhan as thoigianxacnhan, pdc.TienCoc as tiencoc,
             pdc.SoGiuongThue as sogiuongthue,
             p.TenPhong as tenphong, g.TenGiuong as tengiuong
      FROM PhieuDatCoc pdc
      LEFT JOIN Phong p ON p.MaPhong = pdc.MaPhong
      LEFT JOIN Giuong g ON g.MaGiuong = pdc.MaGiuong
      WHERE pdc.MaKH = $1
    `;
    const params: any[] = [maKH];

    if (trangThai) {
      if (trangThai === 'DangCho') {
        queryStr += ` AND pdc.TrangThaiMoi IN ('ChoDuyet', 'ChoThanhToan', 'ChoXacNhanTienMat')`;
      } else if (trangThai === 'DaThanhToan') {
        queryStr += ` AND pdc.TrangThaiMoi = 'DaThanhToan'`;
      } else if (trangThai === 'DaHuy') {
        queryStr += ` AND pdc.TrangThaiMoi = 'DaHuy'`;
      }
    }

    // Luôn ưu tiên hiển thị các phiếu "Đang chờ" ở trên đầu, sau đó sắp xếp theo MaCoc giảm dần (mới nhất trước)
    queryStr += `
      ORDER BY CASE WHEN pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat') THEN 0 ELSE 1 END,
               pdc.MaCoc DESC
    `;

    const res = await db.query(queryStr, params);
    return res.rows;
  }
}
