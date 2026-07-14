import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';

export class ThanhToanCocService {
  private phieuDatCocRepo = new PhieuDatCocRepository();

  async layThongTinThanhToan(maCoc: number): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }
    if (phieu.trangthai !== 1) {
      throw new Error('Phiếu đặt cọc không ở trạng thái chờ thanh toán.');
    }

    return {
      success: true,
      data: phieu
    };
  }

  async xacNhanThanhToan(maCoc: number, ptThanhToan: string, maGiaoDich: string, minhChung: string): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }
    
    // Update status to 2: Chờ Kế toán duyệt
    const success = await this.phieuDatCocRepo.updateStatusAndTransaction(maCoc, 2, ptThanhToan, maGiaoDich, minhChung);
    
    if (!success) {
      throw new Error('Lỗi khi cập nhật thanh toán.');
    }

    return {
      success: true,
      message: 'Đã lưu thông tin thanh toán, chờ quản lý duyệt.'
    };
  }

  async huyThanhToanCoc(maCoc: number): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }
    
    const success = await this.phieuDatCocRepo.delete(maCoc);
    if (!success) {
      throw new Error('Không thể xóa phiếu đặt cọc này.');
    }
    return {
      success: true,
      message: 'Đã xóa phiếu đặt cọc thành công.'
    };
  }
}
