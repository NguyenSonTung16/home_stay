import { Request, Response } from 'express';
import { BaoCaoService } from '../services/BaoCaoService';
import { z } from 'zod';

const service = new BaoCaoService();

const DoanhThuQuerySchema = z.object({
  tuNgay: z.string(),
  denNgay: z.string(),
  granularity: z.enum(['day', 'week', 'month', 'year']).default('day'),
  chiNhanh: z.string().optional()
});

const SummaryQuerySchema = z.object({
  thang: z.string().optional().transform(val => val ? parseInt(val) : new Date().getMonth() + 1),
  nam: z.string().optional().transform(val => val ? parseInt(val) : new Date().getFullYear()),
  chiNhanh: z.string().optional()
});

export class BaoCaoController {
  
  layDoanhThuPhanRa = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = DoanhThuQuerySchema.parse(req.query);
      const data = await service.layDoanhThuPhanRa(query);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Dữ liệu truy vấn không hợp lệ', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };

  laySummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = SummaryQuerySchema.parse(req.query);
      const data = await service.laySummary(query.thang, query.nam, query.chiNhanh);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Dữ liệu truy vấn không hợp lệ', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };

  layDoanhThuTheoChiNhanh = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = SummaryQuerySchema.parse(req.query);
      const data = await service.layDoanhThuTheoChiNhanh(query.thang, query.nam);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Dữ liệu truy vấn không hợp lệ', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };
}
