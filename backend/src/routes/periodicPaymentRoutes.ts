import { Router } from 'express';
import { PeriodicPaymentController } from '../controllers/PeriodicPaymentController';

const router = Router();
const controller = new PeriodicPaymentController();

// GET /api/hoa-don/active-info
router.get('/hoa-don/active-info', controller.getActiveInfo);

// GET /api/hoa-don/dien-nuoc/:maPhong
router.get('/hoa-don/dien-nuoc/:maPhong', controller.getHoaDonDienNuoc);

// GET /api/hoa-don/phi-dinh-ky/:maHopDong
router.get('/hoa-don/phi-dinh-ky/:maHopDong', controller.getHoaDonPhiDinhKy);

// POST /api/don-hang
router.post('/don-hang', controller.createDonHang);

// GET /api/don-hang/:maDH/status
router.get('/don-hang/:maDH/status', controller.getDonHangStatus);

export default router;
