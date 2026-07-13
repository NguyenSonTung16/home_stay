import { Router } from 'express';
import authRoutes from './authRoutes'; // Tín
import serviceRoutes from './serviceRoutes'; // Tuấn
import bookingRoutes from './bookingRoutes'; // Liêm
import roomRoutes from './roomRoutes';
import lichHenRoutes from './lichHenRoutes';
import financeRoutes from './financeRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/booking', bookingRoutes);
router.use('/phong', roomRoutes);
router.use('/lichhen', lichHenRoutes);
router.use('/finance', financeRoutes);

export default router;
