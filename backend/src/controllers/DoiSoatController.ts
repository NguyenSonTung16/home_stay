import { Request, Response } from 'express';
import { DoiSoatService } from '../services/DoiSoatService';
import { z } from 'zod';

const service = new DoiSoatService();

const QuerySchema = z.object({
  thang: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  nam: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  chiNhanh: z.string().optional(),
  trangThai: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export class DoiSoatController {
  
  layDanhSachChiNhanh = async (req: Request, res: Response): Promise<void> => {
    try {
      const branches = await service.layDanhSachChiNhanh();
      res.status(200).json({ success: true, data: branches });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  layDanhSachDatCoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      const result = await service.layDanhSachDatCoc(query);
      res.status(200).json({
        success: true,
        data: result.list,
        total: result.total,
        page: query.page,
        limit: query.limit
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Dữ liệu truy vấn không hợp lệ', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };

  layDanhSachHoaDonDinhKy = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      
      const formattedThang = (query.thang && query.nam) 
        ? `${query.nam}-${String(query.thang).padStart(2, '0')}` 
        : undefined;

      const result = await service.layDanhSachHoaDonDinhKy({
        thang: formattedThang,
        chiNhanh: query.chiNhanh,
        trangThai: query.trangThai,
        page: query.page,
        limit: query.limit
      });

      res.status(200).json({
        success: true,
        data: result.list,
        total: result.total,
        page: query.page,
        limit: query.limit
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Dữ liệu truy vấn không hợp lệ', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };

  layDanhSachHoaDonDienNuoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      
      const formattedThang = (query.thang && query.nam) 
        ? `${query.nam}-${String(query.thang).padStart(2, '0')}` 
        : undefined;

      const result = await service.layDanhSachHoaDonDienNuoc({
        thang: formattedThang,
        chiNhanh: query.chiNhanh,
        trangThai: query.trangThai,
        page: query.page,
        limit: query.limit
      });

      res.status(200).json({
        success: true,
        data: result.list,
        total: result.total,
        page: query.page,
        limit: query.limit
      });
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
      const loai = req.query.loai as any;
      if (!loai) {
        res.status(400).json({ success: false, message: 'Thiếu tham số loại đối soát' });
        return;
      }
      const query = QuerySchema.parse(req.query);
      const summary = await service.laySummary(loai, query);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  exportExcel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { loai } = req.params;
      const query = QuerySchema.parse(req.query);
      const buffer = await service.exportExcel(loai as string, query);

      const filename = `doi-soat-${loai}-thang${query.thang || 'all'}-${query.nam || 'all'}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.status(200).send(buffer);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  layChiTietHoaDonDinhKy = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        return;
      }
      const data = await service.layChiTietHoaDonDinhKy(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn định kỳ' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  layChiTietHoaDonDienNuoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        return;
      }
      const data = await service.layChiTietHoaDonDienNuoc(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn điện nước' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
