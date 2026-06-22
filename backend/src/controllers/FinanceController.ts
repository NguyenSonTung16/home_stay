import { Request, Response } from 'express';
import { FinanceService } from '../services/FinanceService';

export const FinanceController = {
    xuLyHoanCoc: async (req: Request, res: Response) => {
        try {
            const data = await FinanceService.hoanCoc(req.body);
            res.status(200).json(data);
        } catch (err: any) {
            res.status(500).send(err.message);
        }
    },

    xuLyTraPhong: async (req: Request, res: Response) => {
        try {
            // res.status(200).json({ message: 'Xử lý trả phòng thành công' });
        } catch (err: any) {
            res.status(500).send(err.message);
        }
    }
};
