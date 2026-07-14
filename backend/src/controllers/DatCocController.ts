import { Request, Response } from 'express';
import { DatCocService } from '../services/DatCocService';
import { PhongRepository } from '../repositories/PhongRepository';

const datCocService = new DatCocService();
const phongRepo = new PhongRepository();

export class DatCocController {
  async taoPhieuDatCoc(req: Request, res: Response): Promise<void> {
    try {
      // In a real app, maKH would come from auth token. Here we take it from body or hardcode.
      const maKH = req.body.maKH || 1; // Fallback to 1 for testing
      const { maPhong, soGiuong, soThangThue, gioiTinh, soNguoiO, ngayDuKienVao } = req.body;

      if (!maPhong || !soGiuong || !gioiTinh || !ngayDuKienVao) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin phòng, số giường, giới tính hoặc ngày dự kiến vào ở.' });
        return;
      }

      const result = await datCocService.xuLyDatCoc({
        maKH,
        maPhong: parseInt(maPhong),
        soGiuong: parseInt(soGiuong),
        soThangThue: parseInt(soThangThue || 6),
        gioiTinh,
        soNguoiO: parseInt(soNguoiO || soGiuong),
        ngayDuKienVao
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPhongTrong(req: Request, res: Response): Promise<void> {
    try {
      const data = await phongRepo.getPhongCoGiuongTrong();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

