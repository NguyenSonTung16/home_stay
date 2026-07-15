import { Router } from 'express';
import { DoiSoatController } from '../controllers/DoiSoatController';
import { requireVaiTro } from '../controllers/ThanhToanCocController';

const router = Router();
const controller = new DoiSoatController();

// Tất cả các route đối soát đều yêu cầu vai trò Kế toán
router.use(requireVaiTro('KeToan'));

router.get('/chi-nhanh', controller.layDanhSachChiNhanh);
router.get('/dat-coc', controller.layDanhSachDatCoc);
router.get('/hoa-don-dinh-ky', controller.layDanhSachHoaDonDinhKy);
router.get('/hoa-don-dinh-ky/:id', controller.layChiTietHoaDonDinhKy);
router.get('/hoa-don-dien-nuoc', controller.layDanhSachHoaDonDienNuoc);
router.get('/hoa-don-dien-nuoc/:id', controller.layChiTietHoaDonDienNuoc);
router.get('/summary', controller.laySummary);
router.get('/:loai/export', controller.exportExcel);

export default router;
