import { Router } from 'express';
import { FinanceController } from '../controllers/FinanceController';

const router = Router();

// Mọi route về Hoàn cọc, Trả phòng đặt tại đây
router.post('/hoan-coc', FinanceController.xuLyHoanCoc);
router.post('/tra-phong', FinanceController.xuLyTraPhong);

export default router;
