import { db } from '../config/db';
import { HoaDonPhiDinhKyDTO } from '../models/HoaDonPhiDinhKyDTO';

export class HoaDonPhiDinhKyRepository {
  /**
   * Lấy danh sách hóa đơn định kỳ của một hợp đồng
   */
  public async layPDK(maHopDong: number): Promise<HoaDonPhiDinhKyDTO[]> {
    const query = `
      SELECT MaPDK as mapdk, MaHD as mahd, Thang as thang, 
             TienPhong as tienphong, TienDichVu as tiendichvu, 
             TongTien as tongtien, TrangThai as trangthai
      FROM HoaDonPhiDinhKy
      WHERE MaHD = $1
      ORDER BY Thang DESC
    `;
    const result = await db.query(query, [maHopDong]);
    return result.rows;
  }

  /**
   * Cập nhật trạng thái thanh toán hóa đơn định kỳ
   */
  public async capNhatTT(maPDK: number, trangThai: 'ChuaThanhToan' | 'DaThanhToan'): Promise<boolean> {
    const query = `
      UPDATE HoaDonPhiDinhKy
      SET TrangThai = $2
      WHERE MaPDK = $1
    `;
    const result = await db.query(query, [maPDK, trangThai]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Lấy thông tin chi tiết một hóa đơn định kỳ theo ID
   */
  public async layTheoId(maPDK: number): Promise<HoaDonPhiDinhKyDTO | null> {
    const query = `
      SELECT MaPDK as mapdk, MaHD as mahd, Thang as thang, 
             TienPhong as tienphong, TienDichVu as tiendichvu, 
             TongTien as tongtien, TrangThai as trangthai
      FROM HoaDonPhiDinhKy
      WHERE MaPDK = $1
    `;
    const result = await db.query(query, [maPDK]);
    return result.rows.length ? (result.rows[0] as HoaDonPhiDinhKyDTO) : null;
  }

  /**
   * Tạo hóa đơn kỳ đầu tự động bằng transaction client
   */
  public async taoHoaDonKyDau(client: any, maHD: number, tienPhong: number): Promise<number> {
    const query = `
      INSERT INTO HoaDonPhiDinhKy (MaHD, Thang, TienPhong, TienDichVu, TongTien, TrangThai) 
      VALUES ($1, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), $2, 0, $2, 'ChuaThanhToan')
      RETURNING MaPDK
    `;
    const result = await client.query(query, [maHD, tienPhong]);
    return result.rows[0].mapdk;
  }

  /**
   * Lấy danh sách tất cả các hợp đồng còn hiệu lực và tính tổng tiền phòng dựa trên số giường
   */
  public async layDanhSachHopDongActive(): Promise<any[]> {
    const query = `
      SELECT h.MaHD as mahd, lp.GiaTien as giatien, COUNT(ctg.MaGiuong) as sogiuong
      FROM HopDong h
      JOIN ChiTietGiuong ctg ON h.MaHD = ctg.MaHD
      JOIN Giuong g ON ctg.MaGiuong = g.MaGiuong
      JOIN Phong ph ON g.MaPhong = ph.MaPhong
      JOIN LoaiPhong lp ON ph.MaLoai = lp.MaLoai
      WHERE h.NgayHetHan >= CURRENT_DATE
      GROUP BY h.MaHD, lp.GiaTien
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Kiểm tra xem hóa đơn định kỳ cho hợp đồng và tháng cụ thể đã tồn tại chưa
   */
  public async kiemTraHoaDonTonTai(maHD: number, thang: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM HoaDonPhiDinhKy
      WHERE MaHD = $1 AND Thang = $2
      LIMIT 1
    `;
    const result = await db.query(query, [maHD, thang]);
    return result.rows.length > 0;
  }

  /**
   * Tạo hóa đơn tự động bằng pool kết nối thông thường
   */
  public async taoHoaDonTuDong(maHD: number, thang: string, tienPhong: number, tienDichVu: number = 0): Promise<number> {
    const query = `
      INSERT INTO HoaDonPhiDinhKy (MaHD, Thang, TienPhong, TienDichVu, TongTien, TrangThai) 
      VALUES ($1, $2, $3, $4, $3 + $4, 'ChuaThanhToan')
      RETURNING MaPDK
    `;
    const result = await db.query(query, [maHD, thang, tienPhong, tienDichVu]);
    return result.rows[0].mapdk;
  }
}
