import { HoaDonPhiDinhKyRepository } from '../repositories/HoaDonPhiDinhKyRepository';
import { HoaDonPhiDinhKyDTO } from '../models/HoaDonPhiDinhKyDTO';

export class HoaDonPhiDinhKyService {
  private repository = new HoaDonPhiDinhKyRepository();

  public async layPDK(maHopDong: number): Promise<HoaDonPhiDinhKyDTO[]> {
    return await this.repository.layPDK(maHopDong);
  }

  public async chuyenTTHoaDon(maPDK: number, trangThai: 'ChuaThanhToan' | 'DaThanhToan'): Promise<boolean> {
    const check = await this.repository.layTheoId(maPDK);
    if (!check) {
      throw new Error(`Không tìm thấy hóa đơn định kỳ với mã ${maPDK}`);
    }
    return await this.repository.capNhatTT(maPDK, trangThai);
  }
}
