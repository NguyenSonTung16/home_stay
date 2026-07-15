import { Request, Response } from 'express';
import { DonHangService } from '../services/DonHangService';
import { DonHangTrangThai } from '../models/DonHangDTO';
import { db } from '../config/db';

const donHangService = new DonHangService();

export class WebhookController {
  public handlePaypalWebhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers['paypal-transmission-sig'] as string;
      const webhookId = process.env.PAYPAL_WEBHOOK_ID as string;
      const event = req.body;
      const eventType = event.event_type;
      console.log('Received PayPal Webhook:', eventType);

      // 1. Xử lý event từ PayPal Payouts
      if (eventType && eventType.startsWith('PAYMENT.PAYOUTS')) {
        if (eventType === 'PAYMENT.PAYOUTSBATCH.SUCCESS') {
          const batchId = event.resource.batch_header.payout_batch_id;
          console.log(`[SUCCESS] Payout batch ${batchId} completed successfully.`);
        } else if (eventType === 'PAYMENT.PAYOUTSBATCH.DENIED') {
          const batchId = event.resource.batch_header.payout_batch_id;
          console.log(`[FAILED] Payout batch ${batchId} was denied.`);
        } else {
          console.log(`[PAYOUT] Received Payout event ${eventType}`);
        }
      }
      // 2. Xử lý event từ PayPal Orders (Thanh toán định kỳ / Đặt cọc / Nợ)
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
          // Check if this order belongs to Deposit (PhieuDatCoc)
          const phieuRes = await db.query('SELECT MaCoc FROM PhieuDatCoc WHERE MaGiaoDich = $1', [maDH]);
          const isDeposit = phieuRes.rows.length > 0;

          // Check if this order belongs to DonHang (Periodic / Utilities)
          const donHangRes = await db.query('SELECT MaDH FROM DonHang WHERE MaDH = $1', [maDH]);
          const isDonHang = donHangRes.rows.length > 0;

          if (isDeposit) {
            console.log(`[WebhookController] Detected Deposit payment for order ${maDH}`);
            if (eventType === 'CHECKOUT.ORDER.APPROVED') {
              console.log(`[WebhookController] Auto-capturing Deposit order ${maDH}`);
              try {
                const { PaypalService } = await import('../services/PaypalService');
                const paypalService = new PaypalService();
                await paypalService.captureOrder(maDH);
              } catch (error: any) {
                // Axios error details
                const errName = error.response?.data?.name || '';
                if (errName !== 'UNPROCESSABLE_ENTITY') {
                  console.error(`[WebhookController] Failed to auto-capture Deposit order ${maDH}:`, error.message);
                }
              }
            }

            const { PhieuDatCocService } = await import('../services/PhieuDatCocService');
            const phieuService = new PhieuDatCocService();
            await phieuService.xuLyWebhookDatCoc(maDH);
          } else if (isDonHang) {
            console.log(`[WebhookController] Detected DonHang payment for order ${maDH}`);
            if (eventType === 'CHECKOUT.ORDER.APPROVED') {
              console.log(`[WebhookController] Auto-capturing DonHang order ${maDH}`);
              try {
                const { PaypalService } = await import('../services/PaypalService');
                const paypalService = new PaypalService();
                await paypalService.captureOrder(maDH);
              } catch (error: any) {
                const errName = error.response?.data?.name || '';
                if (errName !== 'UNPROCESSABLE_ENTITY') {
                  console.error(`[WebhookController] Failed to auto-capture DonHang order ${maDH}:`, error.message);
                }
              }
            }

            let newStatus = DonHangTrangThai.DaThanhToan;
            if (eventType && (eventType.endsWith('.FAILED') || eventType.endsWith('.DENIED'))) {
              newStatus = DonHangTrangThai.ThatBai;
            }
            console.log(`[WebhookController] Cập nhật đơn hàng ${maDH} thành ${newStatus}`);
            await donHangService.chuyenTTDonHang(maDH, newStatus);
          } else {
            console.log(`[WebhookController] Detected other/debt payment for order ${maDH}`);
            if (eventType === 'CHECKOUT.ORDER.APPROVED') {
              try {
                const { PaypalService } = await import('../services/PaypalService');
                const paypalService = new PaypalService();
                await paypalService.captureOrder(maDH);
              } catch (error: any) {
                const errName = error.response?.data?.name || '';
                if (errName !== 'UNPROCESSABLE_ENTITY') {
                  console.error(`[WebhookController] Failed to auto-capture other order ${maDH}:`, error.message);
                }
              }
            }
          }
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
