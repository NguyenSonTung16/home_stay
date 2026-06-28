import { PhongRepository } from '../repositories/PhongRepository';

export class PhongService {
  private phongRepo = new PhongRepository();

  async capNhatTrangThaiPhong(maPhong: number, trangThai: string): Promise<boolean> {
    // Theo DB, TrangThai là INT. "Trống" quy ước là 0
    const trangThaiInt = trangThai === 'Trống' ? 0 : 1;
    return await this.phongRepo.capNhatTrangThai(maPhong, trangThaiInt);
  }
}
