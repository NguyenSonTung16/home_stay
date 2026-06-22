import { Router } from 'express';
import authRoutes from './authRoutes'; // Tín
import serviceRoutes from './serviceRoutes'; // Tuấn
import bookingRoutes from './bookingRoutes'; // Liêm
import financeRoutes from './financeRoutes'; // Tùng

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/booking', bookingRoutes);
router.use('/finance', financeRoutes);

export default router;
