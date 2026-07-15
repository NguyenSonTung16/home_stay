import { Request, Response } from 'express';
import { HopDongService } from '../services/HopDongService';
import { YeuCauTraPhongRepository } from '../repositories/YeuCauTraPhongRepository';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';

export class CheckoutController {
  private hopDongService = new HopDongService();
  private yeuCauRepo = new YeuCauTraPhongRepository();

  public requestCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ngayTra, stk, lyDo, viPhamBaoTre } = req.body;
      
      // Lấy JWT token từ header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as any;
      const maTK = decoded.id || decoded.userId;

      // 1. Tìm hợp đồng Active của user này
      const hopDong = await this.hopDongService.layHopDongActiveTheoMaTK(maTK);
      if (!hopDong) {
        res.status(404).json({ success: false, message: 'Bạn không có hợp đồng nào đang có hiệu lực để trả phòng.' });
        return;
      }

      // Check first invoice
      const dbRes = await db.query(`SELECT TrangThai FROM HoaDonPhiDinhKy WHERE MaHD = $1 ORDER BY MaPDK ASC LIMIT 1`, [hopDong.mahd]);
      const isFirstPeriodPaid = dbRes.rows.length > 0 && dbRes.rows[0].trangthai === 'DaThanhToan';
      
      if (!isFirstPeriodPaid) {
          res.status(400).json({ success: false, message: 'Bạn cần thanh toán hóa đơn kỳ đầu tiên trước khi yêu cầu trả phòng.' });
          return;
      }

      // 2. Chèn flag phạt vào lý do nếu cần
      let finalLyDo = lyDo || '';
      if (viPhamBaoTre) {
        finalLyDo = `[PENALTY_25] ${finalLyDo}`;
      }

      // 3. Insert yêu cầu trả phòng (trạng thái 1 = chờ kiểm tra phòng)
      const yeuCau = await this.yeuCauRepo.taoYeuCauTraPhong(ngayTra, stk, 1, finalLyDo, hopDong.mahd);

      res.status(200).json({ success: true, data: yeuCau, message: 'Yêu cầu trả phòng đã được gửi thành công' });
    } catch (error) {
      console.error('Error requesting checkout:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as any;
      const maTK = decoded.id || decoded.userId;

      // Tìm hợp đồng Active của user này (hoặc hợp đồng vừa thanh lý/chờ thanh lý)
      // Chú ý: layHopDongActiveTheoMaTK hiện tại lấy TrangThai IN (1, 2, 3, 5).
      // Nhưng nếu trả phòng xong nó sẽ là 4. Ta nên lấy hợp đồng gần nhất.
      const hopDong = await this.hopDongService.layHopDongGanNhatTheoMaTK(maTK);

      if (!hopDong) {
        res.status(200).json({ success: true, data: { status: 'NO_CONTRACT' } });
        return;
      }

      // Check first invoice
      const dbRes = await db.query(`SELECT TrangThai FROM HoaDonPhiDinhKy WHERE MaHD = $1 ORDER BY MaPDK ASC LIMIT 1`, [hopDong.mahd]);
      const isFirstPeriodPaid = dbRes.rows.length > 0 && dbRes.rows[0].trangthai === 'DaThanhToan';

      // Lấy yêu cầu trả phòng của hợp đồng này
      const yeuCau = await this.yeuCauRepo.docYeuCauTheoHD(hopDong.mahd);
      if (!yeuCau) {
        if (!isFirstPeriodPaid) {
             res.status(200).json({ success: true, data: { status: 'UNPAID_FIRST_PERIOD', hopDong } });
             return;
        }
        res.status(200).json({ success: true, data: { status: 'CAN_CHECKOUT', hopDong } });
        return;
      }

      // Nếu trạng thái >= 2, ta có thể lấy bảng đối soát
      let doiSoat = null;
      if (yeuCau.trangthai >= 2) {
        try {
          const { HoanCocService } = await import('../services/HoanCocService');
          const hoanCocService = new HoanCocService();
          doiSoat = await hoanCocService.tinhToanChiPhiDoiSoat(hopDong.mahd);
        } catch (e) {
          // Bỏ qua lỗi nếu chưa có phiếu kiểm tra phòng
        }
      }

      res.status(200).json({ 
        success: true, 
        data: {
          status: 'HAS_CHECKOUT_REQUEST',
          yeuCau,
          doiSoat,
          hopDong
        }
      });
    } catch (error) {
      console.error('Error getting checkout status:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public payDebt = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: 'Missing token' });
        return;
      }
      
      const { maHD, amount } = req.body;
      console.log(`[CheckoutController] payDebt called - maHD: ${maHD}, amount: ${amount}`);
      
      const { PaypalService } = await import('../services/PaypalService');
      const paypalService = new PaypalService();

      // amount phải là USD (đã được tính từ frontend hoặc backend)
      const amountUSD = Math.abs(amount) / 25000;
      const referenceId = `DEBT_${maHD}_${Date.now()}`;
      
      const referer = req.headers.referer;
      const origin = (req.headers.origin as string | undefined) || 
        (typeof referer === 'string' ? new URL(referer).origin : undefined);
      const order = await paypalService.createOrder(amountUSD, referenceId, origin);
      console.log(`[CheckoutController] createOrder success - orderId: ${order.id}`);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      console.error('Error creating paypal order for debt:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public captureDebt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, maHD } = req.body;
      console.log(`[CheckoutController] captureDebt called - orderId: ${orderId}, maHD: ${maHD}`);
      
      const { PaypalService } = await import('../services/PaypalService');
      const paypalService = new PaypalService();

      const captureData = await paypalService.captureOrder(orderId);
      console.log(`[CheckoutController] captureOrder success - status: ${captureData.status}`);
      
      if (captureData.status === 'COMPLETED') {
        // Cập nhật hợp đồng về 4 (Đã thanh lý)
        await this.hopDongService.capNhatTrangThai(maHD, 4);
        
        // Cập nhật yêu cầu về 5 (Đã thanh toán nợ)
        const maYC = await this.yeuCauRepo.layMaYCByMaHD(maHD);
        if (maYC) {
          await this.yeuCauRepo.capNhatTrangThai(maYC, 5);
        }

        console.log(`[CheckoutController] Debt paid for maHD: ${maHD}`);
        res.status(200).json({ success: true, message: 'Thanh toán nợ thành công, hoàn tất thanh lý hợp đồng.' });
      } else {
        console.warn(`[CheckoutController] Debt capture not completed - status: ${captureData.status}`);
        res.status(400).json({ success: false, message: 'Thanh toán chưa hoàn tất' });
      }
    } catch (error) {
      console.error('Error capturing debt payment:', error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };
}
