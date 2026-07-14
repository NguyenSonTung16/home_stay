import { Request, Response } from 'express';
import { DonHangService } from '../services/DonHangService';
import { DonHangTrangThai } from '../models/DonHangDTO';

const donHangService = new DonHangService();

export class WebhookController {
  public handlePaypalWebhook = async (req: Request, res: Response) => {
    try {
      const event = req.body;
      const eventType = event.event_type;
      console.log('Received PayPal Webhook:', eventType);

      // 1. Xử lý event từ PayPal Payouts
      if (eventType === 'PAYMENT.PAYOUTSBATCH.SUCCESS') {
        const batchId = event.resource.batch_header.payout_batch_id;
        console.log(`[SUCCESS] Payout batch ${batchId} completed successfully.`);
      } else if (eventType === 'PAYMENT.PAYOUTSBATCH.DENIED') {
        const batchId = event.resource.batch_header.payout_batch_id;
        console.log(`[FAILED] Payout batch ${batchId} was denied.`);
      }
      // 2. Xử lý event từ PayPal Orders (Thanh toán định kỳ)
      else if (
        eventType === 'PAYMENT.CAPTURE.COMPLETED' || 
        eventType === 'CHECKOUT.ORDER.APPROVED' || 
        event.orderId || 
        event.id
      ) {
        let maDH: string | undefined;

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
          maDH = event.resource?.supplementary_data?.related_ids?.order_id;
          if (!maDH && event.resource?.custom_id) {
            maDH = event.resource.custom_id;
          }
        } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
          maDH = event.resource?.id;
        } else {
          maDH = event.orderId || event.id || event.resource?.id;
        }

        if (maDH) {
          if (eventType === 'CHECKOUT.ORDER.APPROVED') {
            console.log(`[WebhookController] Nhận event APPROVED cho ${maDH}. Đang tiến hành capture...`);
            try {
              const { PaypalService } = await import('../services/PaypalService');
              const paypalService = new PaypalService();
              await paypalService.captureOrder(maDH);
              res.status(200).json({ success: true, message: 'APPROVED event received, capture initiated' });
              return;
            } catch (captureErr: any) {
              console.error(`[WebhookController] Lỗi capture từ APPROVED webhook cho ${maDH}:`, captureErr.message);
              res.status(500).json({ success: false, message: 'Failed to capture order: ' + captureErr.message });
              return;
            }
          }

          let newStatus = DonHangTrangThai.DaThanhToan;
          if (eventType && (eventType.endsWith('.FAILED') || eventType.endsWith('.DENIED'))) {
            newStatus = DonHangTrangThai.ThatBai;
          }
          console.log(`[WebhookController] Cập nhật đơn hàng ${maDH} thành ${newStatus}`);
          await donHangService.chuyenTTDonHang(maDH, newStatus);
        }
      }

      // Luôn trả về 200 OK để PayPal biết là đã nhận được Webhook
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Lỗi khi xử lý webhook:', error);
      res.status(500).send();
    }
  };
}
