import { Request, Response } from 'express';
import { HoanCocService } from '../services/HoanCocService';

export class HoanCocController {
  private hoanCocService = new HoanCocService();

  // GET /api/hoancoc/cho-doi-soat
  public getDanhSachChoDoiSoat = async (req: Request, res: Response) => {
    try {
      const data = await this.hoanCocService.docDanhSachChoDoiSoat();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  // GET /api/hoancoc/chi-phi/:maHD
  public getChiPhiDoiSoat = async (req: Request, res: Response) => {
    try {
      const maHD = parseInt(req.params.maHD as string);
      const data = await this.hoanCocService.tinhToanChiPhiDoiSoat(maHD);
      res.status(200).json({ success: true, data });
    } catch (error) {
      // 404 cho lỗi không tìm thấy (theo logic message throw từ Service)
      const errMessage = (error as Error).message;
      const status = errMessage.includes('Không tìm thấy') || errMessage.includes('Chưa có phiếu') ? 404 : 500;
      res.status(status).json({ success: false, message: errMessage });
    }
  };

  // POST /api/finance/hoan-coc/phe-duyet
  public pheDuyetHoanCoc = async (req: Request, res: Response) => {
    try {
      const { maHD } = req.body;
      console.log(`[HoanCocController] pheDuyetHoanCoc called for maHD: ${maHD}`);
      const result = await this.hoanCocService.luuBangDoiSoat(maHD);
      console.log(`[HoanCocController] pheDuyetHoanCoc success for maHD: ${maHD}`);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`[HoanCocController] pheDuyetHoanCoc error:`, error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };
}
