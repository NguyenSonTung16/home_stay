import { db } from '../config/db';
import { HoaDonDienNuocDTO } from '../models/HoaDonDienNuocDTO';

export class HoaDonDienNuocRepository {
  /**
   * Lấy danh sách hóa đơn điện nước của một phòng (cả đã thanh toán và chưa thanh toán)
   */
  public async layHDDN(maPhong: number): Promise<HoaDonDienNuocDTO[]> {
    const query = `
      SELECT MaHDDN as mahddn, MaPhong as maphong, Thang as thang, 
             CSDienCu as csdiencu, CSDienMoi as csdienmoi, 
             CSNuocCu as csnuoccu, CSNuocMoi as csnuocmoi, 
             TienDien as tiendien, TienNuoc as tiennuoc, 
             TongTien as tongtien, TrangThai as trangthai
      FROM HoaDonDienNuoc
      WHERE MaPhong = $1
      ORDER BY Thang DESC
    `;
    const result = await db.query(query, [maPhong]);
    return result.rows;
  }

  /**
   * Cập nhật trạng thái thanh toán của hóa đơn điện nước
   */
  public async capNhatTT(maHDDN: number, trangThai: 'ChuaThanhToan' | 'DaThanhToan'): Promise<boolean> {
    const query = `
      UPDATE HoaDonDienNuoc
      SET TrangThai = $2
      WHERE MaHDDN = $1
    `;
    const result = await db.query(query, [maHDDN, trangThai]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Lấy thông tin chi tiết một hóa đơn điện nước theo ID
   */
  public async layTheoId(maHDDN: number): Promise<HoaDonDienNuocDTO | null> {
    const query = `
      SELECT MaHDDN as mahddn, MaPhong as maphong, Thang as thang, 
             CSDienCu as csdiencu, CSDienMoi as csdienmoi, 
             CSNuocCu as csnuoccu, CSNuocMoi as csnuocmoi, 
             TienDien as tiendien, TienNuoc as tiennuoc, 
             TongTien as tongtien, TrangThai as trangthai
      FROM HoaDonDienNuoc
      WHERE MaHDDN = $1
    `;
    const result = await db.query(query, [maHDDN]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
