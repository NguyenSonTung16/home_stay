import { Router } from 'express';
import { searchRooms, getRoomDetails, createAppointment } from '../controllers/BookingController';
import { DatCocController } from '../controllers/DatCocController';
import { ThanhToanCocController } from '../controllers/ThanhToanCocController';
import { HoSoDatCocController } from '../controllers/HoSoDatCocController';
import { YeuCauTraPhongController } from '../controllers/YeuCauTraPhongController';

const router = Router();
const datCocController = new DatCocController();
const thanhToanCocController = new ThanhToanCocController();
const hoSoDatCocController = new HoSoDatCocController();
const yeuCauTraPhongController = new YeuCauTraPhongController();

// UC1: Đặt cọc
router.get('/phong-trong', datCocController.getPhongTrong);
router.post('/dat-coc', datCocController.taoPhieuDatCoc);

// UC2: Thanh toán cọc
router.get('/phieu-coc/chua-thanh-toan', thanhToanCocController.getDanhSachChuaThanhToan);
router.get('/thanh-toan/:maCoc', thanhToanCocController.getThongTinThanhToan);
router.post('/thanh-toan/xac-nhan', thanhToanCocController.xacNhanThanhToan);

// UC3: Xử lý hồ sơ đặt cọc (Admin)
router.get('/ho-so/cho-duyet', hoSoDatCocController.getDanhSach);
router.post('/ho-so/phe-duyet', hoSoDatCocController.pheDuyet);

// UC4: Yêu cầu trả phòng (Customer)
router.get('/hop-dong/dang-hoat-dong', yeuCauTraPhongController.getHopDongCuaKH);
router.post('/yeu-cau-tra-phong', yeuCauTraPhongController.taoYeuCau);

router.get('/rooms', searchRooms);
router.get('/rooms/:id', getRoomDetails);
router.post('/appointments', createAppointment);

export default router;

