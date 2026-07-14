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
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
