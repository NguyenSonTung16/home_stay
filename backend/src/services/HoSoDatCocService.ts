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
      // Approve: Change status to 1 (Cần thanh toán) — cho phép khách hàng tiến hành thanh toán
      await this.phieuDatCocRepo.updateStatus(maCoc, 1);
      return { success: true, message: 'Đã duyệt hồ sơ đặt cọc. Khách hàng có thể tiến hành thanh toán.' };
    } else {
      // Reject: Change status to 4 (Từ chối/Hủy)
      await this.phieuDatCocRepo.updateStatus(maCoc, 4);
      // Because we use virtual capacity calculation, changing status to 4 
      // automatically frees up the reserved beds for this room.
      return { success: true, message: 'Đã từ chối hồ sơ đặt cọc.' };
    }
  }
}
