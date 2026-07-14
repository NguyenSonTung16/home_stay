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

  async xacNhanThanhToan(maCoc: number, ptThanhToan: string, maGiaoDich: string): Promise<any> {
    const phieu = await this.phieuDatCocRepo.getById(maCoc);
    if (!phieu) {
      throw new Error('Không tìm thấy phiếu đặt cọc.');
    }
    
    // Validate 24h expiration would go here logically: 
    // if (new Date().getTime() - new Date(phieu.ngaycoc).getTime() > 24 * 60 * 60 * 1000) { throw ... }

    // Update status to 2: Chờ duyệt hồ sơ
    const success = await this.phieuDatCocRepo.updateStatusAndTransaction(maCoc, 2, ptThanhToan, maGiaoDich);
    
    if (!success) {
      throw new Error('Lỗi khi cập nhật thanh toán.');
    }

    return {
      success: true,
      message: 'Đã lưu thông tin thanh toán, chờ quản lý duyệt.'
    };
  }
}
