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
      // Approve: Change status to 1 (Cần thanh toán) and TrangThaiMoi to ChoThanhToan
      await this.phieuDatCocRepo.updateStatusAndTransaction(maCoc, 1, 'TienMat', undefined);
      await import('../config/db').then(({ db }) => 
        db.query(`UPDATE PhieuDatCoc SET TrangThaiMoi = 'ChoThanhToan' WHERE MaCoc = $1`, [maCoc])
      );
      return { success: true, message: 'Đã duyệt hồ sơ đặt cọc. Khách hàng có thể tiến hành thanh toán.' };
    } else {
      // Reject: Change status to 4 (Từ chối/Hủy) and TrangThaiMoi to DaHuy
      await this.phieuDatCocRepo.updateStatus(maCoc, 4);
      await import('../config/db').then(({ db }) => 
        db.query(`UPDATE PhieuDatCoc SET TrangThaiMoi = 'DaHuy' WHERE MaCoc = $1`, [maCoc])
      );
      
      // Release bed lock if needed
      if (phieu.magiuong) {
        await import('../config/db').then(({ db }) => 
          db.query(`UPDATE Giuong SET TrangThaiStr = 'Trong', TrangThai = 0 WHERE MaGiuong = $1`, [phieu.magiuong])
        );
      }
      return { success: true, message: 'Đã từ chối hồ sơ đặt cọc.' };
    }
  }
}
