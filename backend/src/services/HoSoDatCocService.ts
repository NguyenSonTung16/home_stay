import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';

export class HoSoDatCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();

  async layDanhSachChoDuyet(): Promise<any> {
    const data = await this.phieuDatCocRepo.getPending();
    return {
      success: true,
      data
    };
  }

  async pheDuyetHoSo(maCoc: number, isDuyet: boolean): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Phiếu đặt cọc không tồn tại.');
    }

    if (isDuyet) {
      // Approve: Change status to 3 (Đã xác nhận cọc)
      await this.phieuDatCocRepo.updateStatus(maCoc, 3);
      // In a real system, we'd also generate HopDong or notify customer.
      return { success: true, message: 'Đã duyệt hồ sơ đặt cọc thành công.' };
    } else {
      // Reject: Change status to 4 (Từ chối/Hủy)
      await this.phieuDatCocRepo.updateStatus(maCoc, 4);
      // We should also free up the beds (status = 0) in GiuongRepository.
      const { GiuongRepository } = require('../repositories/GiuongRepository');
      const giuongRepo = new GiuongRepository();
      // Need a way to link which beds were reserved, simplify by freeing all in the room or matching count
      // For now, assume it's just rejecting the paper.
      
      return { success: true, message: 'Đã từ chối hồ sơ đặt cọc.' };
    }
  }
}
