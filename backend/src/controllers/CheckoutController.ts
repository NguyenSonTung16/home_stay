import { Request, Response } from 'express';
import { HopDongService } from '../services/HopDongService';
import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import jwt from 'jsonwebtoken';

export class CheckoutController {
  private hopDongService = new HopDongService();
  private yeuCauRepo = new YeuCauTraPhongRepository();

  public requestCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ngayTra, stk, lyDo, viPhamBaoTre } = req.body;
      
      // Lấy JWT token từ header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as any;
      const maTK = decoded.id || decoded.userId;

      // 1. Tìm hợp đồng Active của user này
      const hopDong = await this.hopDongService.layHopDongActiveTheoMaTK(maTK);
      if (!hopDong) {
        res.status(404).json({ success: false, message: 'Bạn không có hợp đồng nào đang có hiệu lực để trả phòng.' });
        return;
      }

      // 2. Chèn flag phạt vào lý do nếu cần
      let finalLyDo = lyDo || '';
      if (viPhamBaoTre) {
        finalLyDo = `[PENALTY_25] ${finalLyDo}`;
      }

      // 3. Insert yêu cầu trả phòng (trạng thái 1 = chờ kiểm tra phòng)
      const yeuCau = await this.yeuCauRepo.taoYeuCauTraPhong(ngayTra, stk, 1, finalLyDo, hopDong.mahd);

      res.status(200).json({ success: true, data: yeuCau, message: 'Yêu cầu trả phòng đã được gửi thành công' });
    } catch (error) {
      console.error('Error requesting checkout:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };
}
