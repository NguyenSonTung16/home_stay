import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import { HopDongRepository } from '../repositories/HopDongRepository';

export class YeuCauTraPhongService {
  private yeuCauRepo = new YeuCauTraPhongRepository();
  private hopDongRepo = new HopDongRepository();

  async taoYeuCauTraPhong(data: { maHD: number, ngayDuKien: string, lyDo: string, stkNhanCoc: string }): Promise<any> {
    const { maHD, ngayDuKien, lyDo, stkNhanCoc } = data;

    // Validate if contract exists
    const hd = await this.hopDongRepo.layThongTin(maHD);
    if (!hd) {
      throw new Error('Hợp đồng không tồn tại.');
    }

    // Insert request to YeuCauTraPhong table
    const result = await this.yeuCauRepo.create({
      NgayDuKien: ngayDuKien,
      STKNhanCoc: stkNhanCoc,
      TrangThai: 1, // 1: Chờ kiểm kê
      LyDo: lyDo,
      MaHD: maHD
    });

    return {
      success: true,
      message: 'Yêu cầu trả phòng đã được gửi thành công.',
      data: result
    };
  }
}
