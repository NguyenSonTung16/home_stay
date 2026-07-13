import { Router } from 'express';
import authRoutes from './authRoutes'; // Tín
import serviceRoutes from './serviceRoutes'; // Tuấn
import bookingRoutes from './bookingRoutes'; // Liêm
import financeRoutes from './financeRoutes'; // Tùng
import webhookRoutes from './webhookRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/booking', bookingRoutes);
router.use('/finance', financeRoutes);
router.use('/webhook', webhookRoutes);

export default router;
