import { Router } from 'express';
import authRoutes from './authRoutes'; // Tín
import serviceRoutes from './serviceRoutes'; // Tuấn
import bookingRoutes from './bookingRoutes'; // Liêm
import financeRoutes from './financeRoutes'; // Tùng
import webhookRoutes from './webhookRoutes';
import roomRoutes from './roomRoutes';
import lichHenRoutes from './lichHenRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/booking', bookingRoutes);
router.use('/phong', roomRoutes);
router.use('/lichhen', lichHenRoutes);
router.use('/finance', financeRoutes);
router.use('/webhook', webhookRoutes);

export default router;
