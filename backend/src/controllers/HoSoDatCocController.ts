import { Request, Response } from 'express';
import { HoSoDatCocService } from '../services/HoSoDatCocService';

const hoSoDatCocService = new HoSoDatCocService();

export class HoSoDatCocController {
  async getDanhSach(req: Request, res: Response): Promise<void> {
    try {
      const result = await hoSoDatCocService.layDanhSachChoDuyet();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async pheDuyet(req: Request, res: Response): Promise<void> {
    try {
      const { maCoc, isDuyet } = req.body;
      if (!maCoc || isDuyet === undefined) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin phê duyệt.' });
        return;
      }

      const result = await hoSoDatCocService.pheDuyetHoSo(parseInt(maCoc), isDuyet);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
