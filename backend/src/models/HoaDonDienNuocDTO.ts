export interface HoaDonDienNuocDTO {
  mahddn?: number;
  maphong: number;
  thang: string;
  csdiencu: number;
  csdienmoi: number;
  csnuoccu: number;
  csnuocmoi: number;
  tiendien: number;
  tiennuoc: number;
  tongtien: number;
  trangthai: 'ChuaThanhToan' | 'DaThanhToan';
}
