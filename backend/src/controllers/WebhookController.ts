import { Request, Response } from 'express';

export class WebhookController {
  public handlePaypalWebhook = async (req: Request, res: Response) => {
    try {
      const event = req.body;
      console.log('Received PayPal Webhook:', event.event_type);

      // Xử lý event từ PayPal
      if (event.event_type === 'PAYMENT.PAYOUTSBATCH.SUCCESS') {
        const batchId = event.resource.batch_header.payout_batch_id;
        console.log(`[SUCCESS] Payout batch ${batchId} completed successfully.`);
        // Ở đây có thể update trạng thái bảng đối soát trong DB thành "Đã hoàn tất"
      } else if (event.event_type === 'PAYMENT.PAYOUTSBATCH.DENIED') {
        const batchId = event.resource.batch_header.payout_batch_id;
        console.log(`[FAILED] Payout batch ${batchId} was denied.`);
      }

      // Luôn trả về 200 OK để PayPal biết là đã nhận được Webhook
      res.status(200).send();
    } catch (error) {
      console.error('Lỗi khi xử lý webhook:', error);
      res.status(500).send();
    }
  };
}
