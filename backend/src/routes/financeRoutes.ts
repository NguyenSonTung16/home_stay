import { Router } from 'express';
import { HoanCocController } from '../controllers/HoanCocController';
import { TraPhongController } from '../controllers/TraPhongController';

const router = Router();
const hoanCocController = new HoanCocController();
const traPhongController = new TraPhongController();

// Các routes cho Xử lý hoàn cọc
router.get('/hoan-coc/cho-doi-soat', hoanCocController.getDanhSachChoDoiSoat);
router.get('/hoan-coc/chi-phi/:maHD', hoanCocController.getChiPhiDoiSoat);
router.post('/hoan-coc/phe-duyet', hoanCocController.pheDuyetHoanCoc);

// Các routes cho Xử lý trả phòng
router.get('/tra-phong/cho-tra-phong', traPhongController.getDanhSachChoTraPhong);
router.get('/tra-phong/thong-tin-thue/:maHD', traPhongController.getThongTinThue);
router.post('/tra-phong/xac-nhan-ban-giao', traPhongController.xacNhanBanGiao);
router.post('/tra-phong/khieu-nai', traPhongController.ghiNhanKhieuNai);
router.post('/tra-phong/giai-quyet-khieu-nai', traPhongController.giaiQuyetKhieuNai);

export default router;
