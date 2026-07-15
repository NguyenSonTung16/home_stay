import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';
import { ThanhToanCocController } from '../controllers/ThanhToanCocController';

const router = Router();
const webhookController = new WebhookController();
const thanhToanCocController = new ThanhToanCocController();

// POST /api/webhook/paypal — thanh toán định kỳ/đơn hàng
router.post('/paypal', webhookController.handlePaypalWebhook);

// POST /api/webhook/dat-coc — thanh toán cọc qua PayPal
router.post('/dat-coc', thanhToanCocController.handleWebhookDatCoc);

export default router;
