export enum DonHangTrangThai {
  DangCho = 'DangCho',
  DaThanhToan = 'DaThanhToan',
  ThatBai = 'ThatBai',
  HetHan = 'HetHan'
}

export interface DonHangDTO {
  madh: string;
  loaihoadon: 'DienNuoc' | 'PhiDinhKy' | 'DatCoc';
  phuongthuc: string;
  tongtien: number;
  mahoadon: number;
  trangthai: DonHangTrangThai;
  thoigianhethan: Date;
  idempotencykey?: string;
  ngaytao?: Date;
}
