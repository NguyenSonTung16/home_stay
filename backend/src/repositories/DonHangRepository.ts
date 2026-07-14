import { db } from '../config/db';
import { DonHangDTO, DonHangTrangThai } from '../models/DonHangDTO';

export class DonHangRepository {
  /**
   * Tạo đơn hàng mới trong cơ sở dữ liệu
   */
  public async taoDonHang(
    maDH: string,
    loaiHoaDon: 'DienNuoc' | 'PhiDinhKy',
    phuongThuc: string,
    tongTien: number,
    maHoaDon: number,
    thoiGianHetHan: Date,
    idempotencyKey?: string
  ): Promise<DonHangDTO> {
    const query = `
      INSERT INTO DonHang (MaDH, LoaiHoaDon, PhuongThuc, TongTien, MaHoaDon, TrangThai, ThoiGianHetHan, IdempotencyKey)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING MaDH as madh, LoaiHoaDon as loaihoadon, PhuongThuc as phuongthuc, 
                TongTien as tongtien, MaHoaDon as mahoadon, TrangThai as trangthai, 
                ThoiGianHetHan as thoigianhethan, IdempotencyKey as idempotencykey, NgayTao as ngaytao
    `;
    const result = await db.query(query, [
      maDH,
      loaiHoaDon,
      phuongThuc,
      tongTien,
      maHoaDon,
      DonHangTrangThai.DangCho,
      thoiGianHetHan,
      idempotencyKey || null
    ]);
    return result.rows[0];
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  public async capNhatTT(maDH: string, trangThai: DonHangTrangThai): Promise<boolean> {
    const query = `
      UPDATE DonHang
      SET TrangThai = $2
      WHERE MaDH = $1
    `;
    const result = await db.query(query, [maDH, trangThai]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Cập nhật trạng thái đơn hàng với DB Transaction Client (để thực hiện transactional updates)
   */
  public async capNhatTTWithClient(client: any, maDH: string, trangThai: DonHangTrangThai): Promise<boolean> {
    const query = `
      UPDATE DonHang
      SET TrangThai = $2
      WHERE MaDH = $1
    `;
    const result = await client.query(query, [maDH, trangThai]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Lấy đơn hàng theo ID (PayPal Order ID)
   */
  public async layTheoId(maDH: string): Promise<DonHangDTO | null> {
    const query = `
      SELECT MaDH as madh, LoaiHoaDon as loaihoadon, PhuongThuc as phuongthuc, 
             TongTien as tongtien, MaHoaDon as mahoadon, TrangThai as trangthai, 
             ThoiGianHetHan as thoigianhethan, IdempotencyKey as idempotencykey, NgayTao as ngaytao
      FROM DonHang
      WHERE MaDH = $1
    `;
    const result = await db.query(query, [maDH]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Lấy đơn hàng theo Idempotency Key
   */
  public async layTheoIdempotencyKey(idempotencyKey: string): Promise<DonHangDTO | null> {
    const query = `
      SELECT MaDH as madh, LoaiHoaDon as loaihoadon, PhuongThuc as phuongthuc, 
             TongTien as tongtien, MaHoaDon as mahoadon, TrangThai as trangthai, 
             ThoiGianHetHan as thoigianhethan, IdempotencyKey as idempotencykey, NgayTao as ngaytao
      FROM DonHang
      WHERE IdempotencyKey = $1
    `;
    const result = await db.query(query, [idempotencyKey]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Lấy danh sách các đơn hàng ở trạng thái "DangCho" đã được tạo lâu hơn một khoảng thời gian nhất định (phục vụ đối soát)
   */
  public async layDanhSachDangChoQuáHan(minutes: number): Promise<DonHangDTO[]> {
    const query = `
      SELECT MaDH as madh, LoaiHoaDon as loaihoadon, PhuongThuc as phuongthuc, 
             TongTien as tongtien, MaHoaDon as mahoadon, TrangThai as trangthai, 
             ThoiGianHetHan as thoigianhethan, IdempotencyKey as idempotencykey, NgayTao as ngaytao
      FROM DonHang
      WHERE TrangThai = 'DangCho' AND NgayTao < NOW() - INTERVAL '1 minute' * $1
    `;
    const result = await db.query(query, [minutes]);
    return result.rows;
  }
}
