import { Router } from 'express';
import { DatCocController } from '../controllers/DatCocController';
import { ThanhToanCocController } from '../controllers/ThanhToanCocController';
import { HoSoDatCocController } from '../controllers/HoSoDatCocController';
import { YeuCauTraPhongController } from '../controllers/YeuCauTraPhongController';
import { searchRooms, getRoomDetails, createAppointment } from '../controllers/BookingController';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = Router();
const datCocController = new DatCocController();
const thanhToanCocController = new ThanhToanCocController();
const hoSoDatCocController = new HoSoDatCocController();
const yeuCauTraPhongController = new YeuCauTraPhongController();

// UC1: Đặt cọc
router.get('/phong-trong', datCocController.getPhongTrong);
router.post('/dat-coc', datCocController.taoPhieuDatCoc);

// UC2: Thanh toán cọc
router.get('/phieu-coc/danh-sach', thanhToanCocController.getDanhSachPhieuCoc);
router.get('/thanh-toan/:maCoc', thanhToanCocController.getThongTinThanhToan);
router.post('/thanh-toan/xac-nhan', upload.single('minhChung'), thanhToanCocController.xacNhanThanhToan);
router.delete('/thanh-toan/:maCoc', thanhToanCocController.huyThanhToanCoc);

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

