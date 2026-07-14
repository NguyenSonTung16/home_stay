import { Router } from 'express';
import { searchRooms, getRoomDetails, createAppointment } from '../controllers/BookingController';
import { DatCocController } from '../controllers/DatCocController';
import { ThanhToanCocController, requireVaiTro } from '../controllers/ThanhToanCocController';
import { HoSoDatCocController } from '../controllers/HoSoDatCocController';
import { YeuCauTraPhongController } from '../controllers/YeuCauTraPhongController';
import { UploadController, uploadMiddleware } from '../controllers/UploadController';

const router = Router();
const datCocController = new DatCocController();
const thanhToanCocController = new ThanhToanCocController();
const hoSoDatCocController = new HoSoDatCocController();
const yeuCauTraPhongController = new YeuCauTraPhongController();
const uploadController = new UploadController();

// ─── UC Tìm phòng / đặt lịch ─────────────────────────────────────────────
router.get('/rooms', searchRooms);
router.get('/rooms/:id', getRoomDetails);
router.post('/appointments', createAppointment);
// ─── Legacy cũ (giữ backward compat) ──────────────────────────────────────
router.get('/dat-coc/lich-su', datCocController.layLichSu); // phải đặt trước /:maPDC

// ─── UC Đặt cọc (new endpoints) ──────────────────────────────────────────
router.post('/dat-coc', datCocController.taoPhieuDatCoc);
router.post('/dat-coc/:maPDC/thanh-toan-online', datCocController.taoThanhToanOnline);
router.post('/dat-coc/:maPDC/thanh-toan-tien-mat', datCocController.guiChungTuTienMat);
router.post(
  '/dat-coc/:maPDC/xac-nhan-tien-mat',
  requireVaiTro('QuanLy', 'Admin'),
  datCocController.xacNhanTienMat
);
router.get('/dat-coc/:maPDC/status', datCocController.layTrangThai);
router.get('/dat-coc/lich-su', datCocController.layLichSu);

// ─── Upload chứng từ ──────────────────────────────────────────────────────
router.post('/upload/chung-tu', uploadMiddleware, uploadController.uploadChungTu);

// ─── Legacy endpoints (không xóa để backward compat) ──────────────────────
router.get('/phieu-coc/chua-thanh-toan', thanhToanCocController.getDanhSachChuaThanhToan);
router.get('/thanh-toan/:maCoc', thanhToanCocController.getThongTinThanhToan);

// ─── UC Hồ sơ đặt cọc (Admin / HoSo) ────────────────────────────────────
router.get('/ho-so/cho-duyet', hoSoDatCocController.getDanhSach);
router.post('/ho-so/phe-duyet', hoSoDatCocController.pheDuyet);

// ─── UC Yêu cầu trả phòng ─────────────────────────────────────────────────
router.get('/hop-dong/dang-hoat-dong', yeuCauTraPhongController.getHopDongCuaKH);
router.post('/yeu-cau-tra-phong', yeuCauTraPhongController.taoYeuCau);

export default router;
