import { Router } from 'express';
import { HoanCocController } from '../controllers/HoanCocController';
import { TraPhongController } from '../controllers/TraPhongController';

import { CheckoutController } from '../controllers/CheckoutController';

const router = Router();
const hoanCocController = new HoanCocController();
const traPhongController = new TraPhongController();
const checkoutController = new CheckoutController();

// Các routes cho Xử lý hoàn cọc
router.get('/hoan-coc/cho-doi-soat', hoanCocController.getDanhSachChoDoiSoat);
router.get('/hoan-coc/chi-phi/:maHD', hoanCocController.getChiPhiDoiSoat);
router.post('/hoan-coc/phe-duyet', hoanCocController.pheDuyetHoanCoc);

// Các routes cho Xử lý trả phòng
router.post('/tra-phong/request', checkoutController.requestCheckout);
router.get('/tra-phong/status', checkoutController.getStatus);
router.post('/tra-phong/pay-debt', checkoutController.payDebt);
router.post('/tra-phong/capture-debt', checkoutController.captureDebt);
router.get('/tra-phong/cho-tra-phong', traPhongController.getDanhSachChoTraPhong);
router.get('/tra-phong/thong-tin-thue/:maHD', traPhongController.getThongTinThue);
router.post('/tra-phong/xac-nhan-ban-giao', traPhongController.xacNhanBanGiao);
router.post('/tra-phong/khieu-nai', traPhongController.ghiNhanKhieuNai);
router.post('/tra-phong/giai-quyet-khieu-nai', traPhongController.giaiQuyetKhieuNai);

export default router;
