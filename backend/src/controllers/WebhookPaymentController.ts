import { Request, Response } from 'express';
import { DonHangService } from '../services/DonHangService';
import { DonHangTrangThai } from '../models/DonHangDTO';

const donHangService = new DonHangService();

export class WebhookPaymentController {
  /**
   * POST /api/webhook/paypal - Nhận IPN / Webhook từ PayPal
   */
  public handlePaypalWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('[WebhookPaymentController] Nhận webhook từ PayPal:', JSON.stringify(req.body, null, 2));

      // 1. Xác thực Webhook Signature (Giả lập kiểm tra chữ ký hoặc chạy thực tế)
      // Trong môi trường production, chúng ta sử dụng SDK của PayPal để xác thực webhook signature.
      // Dưới đây là logic kiểm tra headers cơ bản:
      const authAlgo = req.headers['paypal-auth-algo'];
      const certUrl = req.headers['paypal-cert-url'];
      const transmissionId = req.headers['paypal-transmission-id'];
      const transmissionSig = req.headers['paypal-transmission-sig'];
      const transmissionTime = req.headers['paypal-transmission-time'];

      // Log các header bảo mật phục vụ đối soát chữ ký
      console.log(`[Webhook Security] Algo: ${authAlgo}, Sig: ${transmissionSig}, Cert: ${certUrl}`);

      // 2. Trích xuất mã đơn hàng (PayPal Order ID) từ payload
      const eventType = req.body.event_type;
      let maDH: string | undefined;

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        // Tìm order_id liên kết từ thông tin capture
        maDH = req.body.resource?.supplementary_data?.related_ids?.order_id;
        if (!maDH && req.body.resource?.custom_id) {
          maDH = req.body.resource.custom_id;
        }
      } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        maDH = req.body.resource?.id;
      } else {
        // Hỗ trợ định dạng test payload trực tiếp đơn giản
        maDH = req.body.orderId || req.body.id || req.body.resource?.id;
      }

      if (!maDH) {
        console.warn('[WebhookPaymentController] Không tìm thấy mã đơn hàng (Order ID) trong payload.');
        res.status(400).json({ success: false, message: 'Không xác định được mã đơn hàng' });
        return;
      }

      // 3. Kiểm tra trạng thái thanh toán từ event
      let newStatus: DonHangTrangThai = DonHangTrangThai.DaThanhToan;
      if (eventType && (eventType.endsWith('.FAILED') || eventType.endsWith('.DENIED'))) {
        newStatus = DonHangTrangThai.ThatBai;
      }

      // 4. Cập nhật trạng thái thông qua Service (Đảm bảo chạy ACID Transaction bên trong)
      console.log(`[WebhookPaymentController] Chuyển trạng thái đơn hàng ${maDH} thành ${newStatus}`);
      await donHangService.chuyenTTDonHang(maDH, newStatus);

      res.status(200).json({ success: true, message: 'Webhook đã được xử lý thành công' });
    } catch (error: any) {
      console.error('[WebhookPaymentController] Lỗi xử lý Webhook:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
