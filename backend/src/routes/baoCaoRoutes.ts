import { Router } from 'express';
import { BaoCaoController } from '../controllers/BaoCaoController';
import { requireVaiTro } from '../controllers/ThanhToanCocController';

const router = Router();
const controller = new BaoCaoController();

// Bảo vệ bằng phân quyền: Chỉ KeToan hoặc Admin mới được phép xem báo cáo
router.use(requireVaiTro('KeToan', 'Admin'));

router.get('/doanh-thu', controller.layDoanhThuPhanRa);
router.get('/summary', controller.laySummary);
router.get('/doanh-thu-chi-nhanh', controller.layDoanhThuTheoChiNhanh);

export default router;
