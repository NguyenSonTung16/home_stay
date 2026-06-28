import { PhieuKiemTraPhongRepository } from '../repositories/PhieuKiemTraPhongRepository';

export class PhieuKiemTraPhongService {
  private phieuKiemTraRepo = new PhieuKiemTraPhongRepository();

  async docPhieuKiemTra(maHD: number) {
    return await this.phieuKiemTraRepo.docPhieuKiemTraTheoMaHD(maHD);
  }
}
