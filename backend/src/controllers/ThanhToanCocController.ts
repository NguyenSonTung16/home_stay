import { Request, Response, NextFunction } from 'express';
import { PhieuDatCocService } from '../services/PhieuDatCocService';

const service = new PhieuDatCocService();

/** Middleware kiểm tra VaiTro (đọc từ header x-vai-tro hoặc req.body.vaiTro) */
export function requireVaiTro(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const vaiTro = (req.headers['x-vai-tro'] as string) || req.body?.vaiTro || '';
    if (!allowedRoles.includes(vaiTro)) {
      res.status(403).json({ success: false, message: `Không có quyền truy cập. Cần vai trò: ${allowedRoles.join(', ')}` });
      return;
    }
    next();
  };
}

export class ThanhToanCocController {
  /** Webhook PayPal xác nhận thanh toán cọc — POST /api/webhook/dat-coc */
  handleWebhookDatCoc = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('[WebhookDatCoc] Nhận payload:', JSON.stringify(req.body, null, 2));

      const eventType = req.body?.event_type;
      let maGiaoDich: string | undefined;

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        maGiaoDich = req.body.resource?.supplementary_data?.related_ids?.order_id
          || req.body.resource?.custom_id;
      } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        maGiaoDich = req.body.resource?.id;
      } else {
        maGiaoDich = req.body.orderId || req.body.id || req.body.resource?.id;
      }

      if (!maGiaoDich) {
        res.status(400).json({ success: false, message: 'Không xác định được mã giao dịch' });
        return;
      }

      if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        console.log(`[WebhookDatCoc] Nhận event APPROVED cho ${maGiaoDich}. Đang tiến hành capture...`);
        try {
          const { PaypalService } = await import('../services/PaypalService');
          const paypalService = new PaypalService();
          await paypalService.captureOrder(maGiaoDich);
          res.status(200).json({ success: true, message: 'APPROVED event received, capture initiated' });
          return;
        } catch (captureErr: any) {
          console.error(`[WebhookDatCoc] Lỗi capture từ APPROVED webhook cho ${maGiaoDich}:`, captureErr.message);
          res.status(500).json({ success: false, message: 'Failed to capture order: ' + captureErr.message });
          return;
        }
      }

      const result = await service.xuLyWebhookDatCoc(maGiaoDich);
      res.status(200).json({ success: true, processed: result.processed });
    } catch (err: any) {
      console.error('[WebhookDatCoc] Lỗi:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };

  /** Cũ — giữ lại để không phá route cũ */
  getThongTinThanhToan = async (req: Request, res: Response): Promise<void> => {
    try {
      const maPDC = parseInt(req.params.maCoc as string);
      const result = await service.layTrangThai(maPDC);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status || 404).json({ success: false, message: err.message });
    }
  };

  /** Cũ — getDanhSachChuaThanhToan */
  getDanhSachChuaThanhToan = async (req: Request, res: Response): Promise<void> => {
    try {
      const repo = new (await import('../repositories/PhieuDatCocRepository')).PhieuDatCocRepository();
      const maKH = parseInt(req.query.maKH as string) || 1;
      const data = await repo.layTheoKhachHang(maKH);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}
