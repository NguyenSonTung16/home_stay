import { db } from '../config/db';
import { PhieuDatCoc, PhieuDatCocChiTietView } from '../models/PhieuDatCocDTO';

// Legacy alias — giữ export để các import hiện tại không bị vỡ
export type { PhieuDatCocChiTietView as PhieuDatCocDTO };

// Helper: LEFT JOIN PhieuDatCoc với ChiTietXuLyDatCoc
// Dùng chung cho mọi hàm lấy dữ liệu trả ra ngoài (API/Service)
const JOIN_VIEW = `
  SELECT
    pdc.MaCoc as macoc, pdc.SoTien as sotien, pdc.NgayCoc as ngaycoc,
    pdc.TrangThaiMoi as trangthaimoi, pdc.MaGiaoDich as magiaodich,
    pdc.PTThanhToan as ptthanhtoan, pdc.MaKH as makh, pdc.MaPhong as maphong,
    ctdc.MaGiuong as magiuong, ctdc.SoGiuongThue as sogiuongthue,
    ctdc.ThoiGianHetHan as thoigianhethan, ctdc.MinhChung as urlchungtu,
    ctdc.NguoiXacNhan as nguoixacnhan, ctdc.ThoiGianXacNhan as thoigianxacnhan
  FROM PhieuDatCoc pdc
  LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
`;

export class PhieuDatCocRepository {
  // ─── LEGACY METHODS (Giữ nguyên để tương thích ngược) ──────────────────────

  async create(phieu: { SoTien: number, TrangThai: number, MaGiaoDich?: string, PTThanhToan?: string, MaKH: number, MaPhong: number }): Promise<any> {
    const res = await db.query(
      `INSERT INTO PhieuDatCoc (SoTien, TrangThaiMoi, MaGiaoDich, PTThanhToan, MaKH, MaPhong)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [phieu.SoTien, phieu.TrangThai === 1 ? 'ChoDuyet' : 'ChoDuyet', phieu.MaGiaoDich, phieu.PTThanhToan, phieu.MaKH, phieu.MaPhong]
    );
    return res.rows[0];
  }

  async getById(maCoc: number): Promise<any> {
    const res = await db.query(`${JOIN_VIEW} WHERE pdc.MaCoc = $1`, [maCoc]);
    return res.rows[0];
  }

  async updateStatusAndTransaction(maCoc: number, trangThai: number, ptThanhToan: string, maGiaoDich?: string): Promise<boolean> {
    const trangThaiMoi = trangThai === 1 ? 'ChoThanhToan' : trangThai === 3 ? 'DaThanhToan' : 'DaHuy';
    const res = await db.query(
      'UPDATE PhieuDatCoc SET TrangThaiMoi = $1, PTThanhToan = $2, MaGiaoDich = $3 WHERE MaCoc = $4',
      [trangThaiMoi, ptThanhToan, maGiaoDich, maCoc]
    );
    return (res as any).rowCount > 0;
  }

  async getPending(): Promise<any[]> {
    const res = await db.query(`
      SELECT
        pdc.MaCoc as macoc, pdc.SoTien as sotien, pdc.NgayCoc as ngaycoc,
        pdc.TrangThaiMoi as trangthaimoi, pdc.MaGiaoDich as magiaodich,
        pdc.PTThanhToan as ptthanhtoan, pdc.MaKH as makh, pdc.MaPhong as maphong,
        ctdc.MaGiuong as magiuong, ctdc.SoGiuongThue as sogiuongthue,
        ctdc.ThoiGianHetHan as thoigianhethan, ctdc.MinhChung as urlchungtu,
        ctdc.NguoiXacNhan as nguoixacnhan, ctdc.ThoiGianXacNhan as thoigianxacnhan,
        k.HoTen as hoten, k.SDT as sdt, ph.TenPhong as tenphong
      FROM PhieuDatCoc pdc
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      LEFT JOIN KhachHang k ON pdc.MaKH = k.MaKH
      LEFT JOIN Phong ph ON pdc.MaPhong = ph.MaPhong
      WHERE pdc.TrangThaiMoi IN ('ChoDuyet', 'ChoXacNhanTienMat')
      ORDER BY pdc.MaCoc DESC
    `);
    return res.rows;
  }

  async updateStatus(maCoc: number, trangThai: number): Promise<boolean> {
    const trangThaiMoi = trangThai === 4 ? 'DaHuy' : trangThai === 3 ? 'DaThanhToan' : 'ChoDuyet';
    const res = await db.query('UPDATE PhieuDatCoc SET TrangThaiMoi = $1 WHERE MaCoc = $2', [trangThaiMoi, maCoc]);
    return (res as any).rowCount > 0;
  }

  async getChuaThanhToanByKH(maKH: number): Promise<any[]> {
    const res = await db.query(`
      ${JOIN_VIEW}
      LEFT JOIN Phong ph ON pdc.MaPhong = ph.MaPhong
      LEFT JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      WHERE pdc.MaKH = $1 AND pdc.TrangThaiMoi = 'ChoThanhToan'
      ORDER BY pdc.MaCoc DESC
    `, [maKH]);
    return res.rows;
  }

  // ─── NEW METHODS (Cấu hình cọc v2) ──────────────────────────────────────────

  /**
   * Tạo phiếu trong transaction client — chỉ INSERT 8 cột PhieuDatCoc.
   * Sau đó gọi ChiTietXuLyDatCocRepository.taoChiTiet() trong cùng transaction.
   */
  async taoPhieu(client: any, data: {
    maKH: number;
    maPhong: number;
    soTien: number;
    gioiTinh?: string;
    soNguoiO?: number;
    ngayDuKienVao?: string;
  }): Promise<PhieuDatCoc> {
    const res = await client.query(
      `INSERT INTO PhieuDatCoc
         (MaKH, MaPhong, SoTien, TrangThaiMoi, GioiTinh, SoNguoiO, NgayDuKienVao)
       VALUES ($1, $2, $3, 'ChoDuyet', $4, $5, $6)
       RETURNING *`,
      [data.maKH, data.maPhong, data.soTien, data.gioiTinh, data.soNguoiO, data.ngayDuKienVao || null]
    );
    return res.rows[0];
  }

  /** Lấy phiếu theo ID (có LEFT JOIN ChiTietXuLyDatCoc + KhachHang + Giuong + Phong) */
  async layTheoId(maPDC: number): Promise<PhieuDatCocChiTietView | null> {
    const res = await db.query(
      `${JOIN_VIEW}
       LEFT JOIN KhachHang k ON k.MaKH = pdc.MaKH
       LEFT JOIN Giuong g ON g.MaGiuong = ctdc.MaGiuong
       LEFT JOIN Phong p ON p.MaPhong = pdc.MaPhong
       WHERE pdc.MaCoc = $1`,
      [maPDC]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...row,
      hoten: row.hoten,
      email: row.email,
      tengiuong: row.tengiuong,
      tenphong: row.tenphong,
    };
  }

  /** FOR UPDATE — dùng trong transaction để check idempotency & lock */
  async layTheoIdForUpdate(client: any, maPDC: number): Promise<PhieuDatCocChiTietView | null> {
    // Lock cả 2 bảng
    const res = await client.query(
      `SELECT pdc.*, ctdc.magiuong, ctdc.sogiuongthue, ctdc.thoigianhethan,
              ctdc.minhchung as urlchungtu, ctdc.nguoixacnhan, ctdc.thoigianxacnhan
       FROM PhieuDatCoc pdc
       LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
       WHERE pdc.MaCoc = $1 FOR UPDATE OF pdc`,
      [maPDC]
    );
    return res.rows[0] ?? null;
  }

  /** Kiểm tra idempotency — phiếu đã được confirm bởi maGiaoDich này chưa */
  async layTheoMaGiaoDich(maGiaoDich: string): Promise<any | null> {
    const res = await db.query(
      `SELECT * FROM PhieuDatCoc WHERE MaGiaoDich = $1 AND TrangThaiMoi = 'DaThanhToan'`,
      [maGiaoDich]
    );
    return res.rows[0] ?? null;
  }

  /** Cập nhật trạng thái (chỉ cột thuộc PhieuDatCoc) trong transaction */
  async capNhatTrangThai(client: any, maPDC: number, trangThai: string, extras?: {
    maGiaoDich?: string;
  }): Promise<boolean> {
    const extraSets: string[] = [];
    const params: any[] = [trangThai, maPDC];
    let idx = 3;

    if (extras?.maGiaoDich !== undefined) {
      extraSets.push(`MaGiaoDich = $${idx++}`);
      params.splice(idx - 2, 0, extras.maGiaoDich);
    }

    const extraClause = extraSets.length > 0 ? ', ' + extraSets.join(', ') : '';

    const res = await client.query(
      `UPDATE PhieuDatCoc
       SET TrangThaiMoi = $1${extraClause}
       WHERE MaCoc = $2`,
      params
    );
    return (res.rowCount ?? 0) > 0;
  }

  /** Lấy tất cả phiếu quá hạn cần hủy (JOIN bảng con để check ThoiGianHetHan) */
  async layPhieuQuaHan(): Promise<any[]> {
    const res = await db.query(
      `SELECT pdc.MaCoc as macoc, pdc.MaKH as makh, pdc.MaPhong as maphong,
              pdc.TrangThaiMoi as trangthaimoi,
              ctdc.MaGiuong as magiuong, ctdc.ThoiGianHetHan as thoigianhethan,
              k.Email as email, k.HoTen as hoten
       FROM PhieuDatCoc pdc
       JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
       LEFT JOIN KhachHang k ON k.MaKH = pdc.MaKH
       WHERE pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat')
         AND ctdc.ThoiGianHetHan < NOW()`
    );
    return res.rows;
  }

  /** Lấy danh sách phiếu của khách hàng */
  async layTheoKhachHang(maKH: number, trangThai?: string): Promise<any[]> {
    let queryStr = `
      SELECT pdc.MaCoc as macoc, pdc.SoTien as sotien, pdc.NgayCoc as ngaycoc,
             pdc.TrangThaiMoi as trangthai, pdc.PTThanhToan as ptthanhtoan,
             ctdc.ThoiGianHetHan as thoigianhethan, ctdc.ThoiGianXacNhan as thoigianxacnhan,
             ctdc.MinhChung as urlchungtu, pdc.SoTien as tiencoc,
             ctdc.SoGiuongThue as sogiuongthue,
             p.TenPhong as tenphong, g.TenGiuong as tengiuong
      FROM PhieuDatCoc pdc
      LEFT JOIN ChiTietXuLyDatCoc ctdc ON ctdc.MaCoc = pdc.MaCoc
      LEFT JOIN Phong p ON p.MaPhong = pdc.MaPhong
      LEFT JOIN Giuong g ON g.MaGiuong = ctdc.MaGiuong
      WHERE pdc.MaKH = $1
    `;
    const params: any[] = [maKH];

    if (trangThai) {
      if (trangThai === 'DangCho') {
        queryStr += ` AND pdc.TrangThaiMoi IN ('ChoDuyet', 'ChoThanhToan', 'ChoXacNhanTienMat')`;
      } else if (trangThai === 'DaThanhToan') {
        queryStr += ` AND pdc.TrangThaiMoi IN ('DaThanhToan', 'DaHoanThanh')`;
      } else if (trangThai === 'DaHuy') {
        queryStr += ` AND pdc.TrangThaiMoi = 'DaHuy'`;
      }
    }

    queryStr += `
      ORDER BY CASE WHEN pdc.TrangThaiMoi IN ('ChoThanhToan', 'ChoXacNhanTienMat') THEN 0 ELSE 1 END,
               pdc.MaCoc DESC
    `;

    const res = await db.query(queryStr, params);
    return res.rows;
  }
}
