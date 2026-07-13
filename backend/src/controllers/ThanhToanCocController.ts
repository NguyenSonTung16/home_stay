import { Request, Response } from 'express';
import { ThanhToanCocService } from '../services/ThanhToanCocService';
import { PhieuDatCocRepository } from '../repositories/PhieuDatCocRepository';

const thanhToanCocService = new ThanhToanCocService();
const phieuDatCocRepo = new PhieuDatCocRepository();

export class ThanhToanCocController {
  async getThongTinThanhToan(req: Request, res: Response): Promise<void> {
    try {
      const { maCoc } = req.params;
      const result = await thanhToanCocService.layThongTinThanhToan(parseInt(maCoc));
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async xacNhanThanhToan(req: Request, res: Response): Promise<void> {
    try {
      const { maCoc, ptThanhToan, maGiaoDich } = req.body;
      
      if (!maCoc || !ptThanhToan || !maGiaoDich) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin thanh toán.' });
        return;
      }

      const result = await thanhToanCocService.xacNhanThanhToan(
        parseInt(maCoc), 
        ptThanhToan, 
        maGiaoDich
      );
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDanhSachChuaThanhToan(req: Request, res: Response): Promise<void> {
    try {
      const maKH = parseInt(req.query.maKH as string) || 1;
      const data = await phieuDatCocRepo.getChuaThanhToanByKH(maKH);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

