import { Request, Response } from 'express';
import { TraPhongService } from '../services/TraPhongService';

export class TraPhongController {
  private traPhongService = new TraPhongService();

  public getDanhSachChoTraPhong = async (req: Request, res: Response) => {
    try {
      const data = await this.traPhongService.docDanhSachChoTraPhong();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public getThongTinThue = async (req: Request, res: Response) => {
    try {
      const maHD = parseInt(req.params.maHD as string);
      const data = await this.traPhongService.traCuuThongTinThue(maHD);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public xacNhanBanGiao = async (req: Request, res: Response) => {
    try {
      const pktData = req.body;
      const result = await this.traPhongService.taoPhieuKiemTra(pktData);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public ghiNhanKhieuNai = async (req: Request, res: Response) => {
    try {
      const { maHD, lyDo } = req.body;
      const result = await this.traPhongService.ghiNhanKhieuNai(maHD, lyDo);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  public giaiQuyetKhieuNai = async (req: Request, res: Response) => {
    try {
      const { maHD } = req.body;
      const result = await this.traPhongService.giaiQuyetKhieuNai(maHD);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };
}
