import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { HoaDonDienNuocService } from '../services/HoaDonDienNuocService';
import { HoaDonPhiDinhKyService } from '../services/HoaDonPhiDinhKyService';
import { DonHangService } from '../services/DonHangService';

const dienNuocService = new HoaDonDienNuocService();
const phiDinhKyService = new HoaDonPhiDinhKyService();
const donHangService = new DonHangService();

// Schema validate cho DonHang
const createOrderSchema = z.object({
  loaiHoaDon: z.enum(['DienNuoc', 'PhiDinhKy', 'DatCoc']),
  phuongThuc: z.string().min(1, 'Phương thức thanh toán không được rỗng'),
  maHoaDon: z.number().int().positive('Mã hóa đơn phải là số nguyên dương')
});

export class PeriodicPaymentController {
  /**
   * GET /api/periodic/hoa-don/dien-nuoc/:maPhong
   */
  public getHoaDonDienNuoc = async (req: Request, res: Response) => {
    try {
      const maPhong = parseInt(String(req.params.maPhong), 10);
      if (isNaN(maPhong)) {
        return res.status(400).json({ success: false, message: 'Mã phòng không hợp lệ' });
      }
      const data = await dienNuocService.layHDDN(maPhong);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error('getHoaDonDienNuoc error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * GET /api/periodic/hoa-don/phi-dinh-ky/:maHopDong
   */
  public getHoaDonPhiDinhKy = async (req: Request, res: Response) => {
    try {
      const maHopDong = parseInt(String(req.params.maHopDong), 10);
      if (isNaN(maHopDong)) {
        return res.status(400).json({ success: false, message: 'Mã hợp đồng không hợp lệ' });
      }
      const data = await phiDinhKyService.layPDK(maHopDong);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error('getHoaDonPhiDinhKy error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * POST /api/periodic/don-hang
   */
  public createDonHang = async (req: Request, res: Response) => {
    try {
      // 1. Validate Input bằng Zod
      const parsedBody = createOrderSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const { loaiHoaDon, phuongThuc, maHoaDon } = parsedBody.data;

      // Lấy Idempotency Key từ header hoặc body để chống double-submit
      const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key'] || req.body.idempotencyKey) as string | undefined;

      // 2. Gọi service tạo đơn hàng / QR
      const data = await donHangService.taoMaQR(
        loaiHoaDon,
        phuongThuc,
        maHoaDon,
        idempotencyKey
      );

      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error('createDonHang error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * GET /api/periodic/don-hang/:maDH/status
   */
  public getDonHangStatus = async (req: Request, res: Response) => {
    try {
      const maDH = req.params.maDH;
      if (!maDH) {
        return res.status(400).json({ success: false, message: 'Mã đơn hàng không được để trống' });
      }

      const donHang = await donHangService.layChiTiet(String(maDH));
      if (!donHang) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }

      // Kiểm tra xem đơn hàng đã quá hạn chưa tại thời điểm truy vấn
      let trangThaiHienTai = donHang.trangthai;
      if (trangThaiHienTai === 'DangCho' && donHang.phuongthuc === 'PayPal') {
        try {
          const { PaypalService } = await import('../services/PaypalService');
          const paypalService = new PaypalService();
          const paypalOrder = await paypalService.getOrder(String(maDH));
          if (paypalOrder.status === 'APPROVED') {
            await paypalService.captureOrder(String(maDH));
            trangThaiHienTai = 'DaThanhToan' as any;
            await donHangService.chuyenTTDonHang(String(maDH), trangThaiHienTai);
          } else if (paypalOrder.status === 'COMPLETED') {
            trangThaiHienTai = 'DaThanhToan' as any;
            await donHangService.chuyenTTDonHang(String(maDH), trangThaiHienTai);
          } else if (new Date(donHang.thoigianhethan) < new Date()) {
            trangThaiHienTai = 'HetHan' as any;
            await donHangService.chuyenTTDonHang(String(maDH), trangThaiHienTai);
          }
        } catch (error) {
          console.error('[PeriodicPaymentController] Sync Paypal Status error:', error);
        }
      } else if (trangThaiHienTai === 'DangCho' && new Date(donHang.thoigianhethan) < new Date()) {
        trangThaiHienTai = 'HetHan' as any;
        await donHangService.chuyenTTDonHang(String(maDH), trangThaiHienTai);
      }

      return res.status(200).json({
        success: true,
        data: {
          maDH: donHang.madh,
          trangThai: trangThaiHienTai,
          thoiGianHetHan: donHang.thoigianhethan,
          tongTien: donHang.tongtien,
          loaiHoaDon: donHang.loaihoadon,
          maHoaDon: donHang.mahoadon,
          phuongThuc: donHang.phuongthuc
        }
      });
    } catch (error: any) {
      console.error('getDonHangStatus error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * GET /api/periodic/active-info - Lấy thông tin phòng và hợp đồng active của khách đang đăng nhập
   */
  public getActiveInfo = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Missing token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as any;
      const maTK = decoded.id || decoded.userId;

      // Tìm hợp đồng active
      const queryHD = `
        SELECT h.MaHD as mahd
        FROM HopDong h
        JOIN KhachHang k ON h.MaKHDaiDien = k.MaKH
        WHERE k.MaTK = $1 AND h.NgayHetHan >= CURRENT_DATE
        ORDER BY h.MaHD DESC LIMIT 1
      `;
      const resHD = await db.query(queryHD, [maTK]);
      if (resHD.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }

      const maHD = resHD.rows[0].mahd;

      // Tìm phòng liên kết thông qua Giuong
      const queryPhong = `
        SELECT g.MaPhong as maphong, p.TenPhong as tenphong
        FROM ChiTietGiuong cg
        JOIN Giuong g ON cg.MaGiuong = g.MaGiuong
        JOIN Phong p ON p.MaPhong = g.MaPhong
        WHERE cg.MaHD = $1
        LIMIT 1
      `;
      const resPhong = await db.query(queryPhong, [maHD]);
      const maPhong = resPhong.rows.length > 0 ? resPhong.rows[0].maphong : null;
      const tenPhong = resPhong.rows.length > 0 ? resPhong.rows[0].tenphong : null;

      return res.status(200).json({
        success: true,
        data: {
          maHopDong: maHD,
          maPhong: maPhong,
          tenPhong: tenPhong
        }
      });
    } catch (error: any) {
      console.error('getActiveInfo error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}
