import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();
const webhookController = new WebhookController();

// POST /api/webhook/paypal
router.post('/paypal', webhookController.handlePaypalWebhook);

export default router;
