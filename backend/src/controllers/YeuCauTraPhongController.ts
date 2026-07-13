import { Request, Response } from 'express';
import { YeuCauTraPhongService } from '../services/YeuCauTraPhongService';
import { HopDongRepository } from '../repositories/HopDongRepository';

const yeuCauService = new YeuCauTraPhongService();
const hopDongRepo = new HopDongRepository();

export class YeuCauTraPhongController {
  async taoYeuCau(req: Request, res: Response): Promise<void> {
    try {
      const { maHD, ngayDuKien, lyDo, stkNhanCoc } = req.body;
      
      if (!maHD || !ngayDuKien) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin hợp đồng hoặc ngày dự kiến.' });
        return;
      }

      const result = await yeuCauService.taoYeuCauTraPhong({
        maHD: parseInt(maHD),
        ngayDuKien,
        lyDo,
        stkNhanCoc
      });
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHopDongCuaKH(req: Request, res: Response): Promise<void> {
    try {
      const maKH = parseInt(req.query.maKH as string) || 1;
      const data = await hopDongRepo.getActiveByKH(maKH);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

