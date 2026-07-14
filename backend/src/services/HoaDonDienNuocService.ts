import { HoaDonDienNuocRepository } from '../repositories/HoaDonDienNuocRepository';
import { HoaDonDienNuocDTO } from '../models/HoaDonDienNuocDTO';

export class HoaDonDienNuocService {
  private repository = new HoaDonDienNuocRepository();

  public async layHDDN(maPhong: number): Promise<HoaDonDienNuocDTO[]> {
    return await this.repository.layHDDN(maPhong);
  }

  public async chuyenTTHoaDon(maHDDN: number, trangThai: 'ChuaThanhToan' | 'DaThanhToan'): Promise<boolean> {
    const check = await this.repository.layTheoId(maHDDN);
    if (!check) {
      throw new Error(`Không tìm thấy hóa đơn điện nước với mã ${maHDDN}`);
    }
    return await this.repository.capNhatTT(maHDDN, trangThai);
  }
}
