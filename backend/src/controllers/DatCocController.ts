import { Request, Response } from 'express';
import { z } from 'zod';
import { PhieuDatCocService } from '../services/PhieuDatCocService';

const service = new PhieuDatCocService();

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const TaoDatCocSchema = z.object({
  maKH: z.number({ coerce: true }).int().positive(),
  maGiuong: z.number({ coerce: true }).int().positive().optional().nullable(),
  maPhong: z.number({ coerce: true }).int().positive().optional().nullable(),
  soGiuongThue: z.number({ coerce: true }).int().min(1).max(20).optional().nullable(),
  soGiuong: z.number({ coerce: true }).int().min(1).max(20).optional().nullable(),
});

const GuiChungTuSchema = z.object({
  maHoaDonTienMat: z.string().min(1),
  urlChungTu: z.string().min(1),
});

const XacNhanTienMatSchema = z.object({
  maNhanVien: z.number({ coerce: true }).int().positive(),
  duyet: z.boolean(),
});

export class DatCocController {
  /** POST /api/booking/dat-coc */
  taoPhieuDatCoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = TaoDatCocSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() });
        return;
      }
      const { maKH, maGiuong, maPhong, soGiuongThue, soGiuong } = parsed.data;
      const parsedSoGiuongThue = soGiuongThue ?? soGiuong ?? 1;

      const result = await service.taoDatCoc(maKH, maGiuong || null, parsedSoGiuongThue, maPhong || null);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      res.status(status).json({ success: false, message: err.message || 'Lỗi server' });
    }
  };

  /** POST /api/booking/dat-coc/:maPDC/thanh-toan-online */
  taoThanhToanOnline = async (req: Request, res: Response): Promise<void> => {
    try {
      const maPDC = parseInt(req.params.maPDC);
      if (isNaN(maPDC)) { res.status(400).json({ success: false, message: 'maPDC không hợp lệ' }); return; }
      const referer = req.headers.referer;
      const origin = (req.headers.origin as string | undefined) || 
        (typeof referer === 'string' ? new URL(referer).origin : undefined);
      const result = await service.taoThanhToanOnline(maPDC, origin);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  };

  /** POST /api/booking/dat-coc/:maPDC/thanh-toan-tien-mat */
  guiChungTuTienMat = async (req: Request, res: Response): Promise<void> => {
    try {
      const maPDC = parseInt(req.params.maPDC);
      const parsed = GuiChungTuSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() });
        return;
      }
      const result = await service.guiChungTuTienMat(maPDC, parsed.data.maHoaDonTienMat, parsed.data.urlChungTu);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  };

  /** POST /api/booking/dat-coc/:maPDC/xac-nhan-tien-mat — chỉ QuanLy */
  xacNhanTienMat = async (req: Request, res: Response): Promise<void> => {
    try {
      const maPDC = parseInt(req.params.maPDC);
      const parsed = XacNhanTienMatSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() });
        return;
      }
      const result = await service.xacNhanTienMat(maPDC, parsed.data.maNhanVien, parsed.data.duyet);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  };

  /** GET /api/booking/dat-coc/:maPDC/status */
  layTrangThai = async (req: Request, res: Response): Promise<void> => {
    try {
      const maPDC = parseInt(req.params.maPDC);
      const result = await service.layTrangThai(maPDC);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  };

  /** GET /api/booking/dat-coc/lich-su?maKH=... */
  layLichSu = async (req: Request, res: Response): Promise<void> => {
    try {
      const repo = new (await import('../repositories/PhieuDatCocRepository')).PhieuDatCocRepository();
      const maKH = parseInt(req.query.maKH as string) || 1;
      const trangThai = req.query.trangThai as string | undefined;
      
      // Lấy danh sách đã filter
      const data = await repo.layTheoKhachHang(maKH, trangThai);
      
      // Lấy toàn bộ để đếm số lượng (counts) cho các tab
      const allData = await repo.layTheoKhachHang(maKH);
      const pending = allData.filter(p => ['ChoDuyet', 'ChoThanhToan', 'ChoXacNhanTienMat'].includes(p.trangthai)).length;
      const completed = allData.filter(p => p.trangthai === 'DaThanhToan').length;
      const canceled = allData.filter(p => p.trangthai === 'DaHuy').length;

      res.status(200).json({
        success: true,
        data,
        counts: {
          all: allData.length,
          pending,
          completed,
          canceled
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}
