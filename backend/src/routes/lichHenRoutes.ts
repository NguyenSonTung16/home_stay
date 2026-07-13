import { Router, Request, Response } from 'express';
import { LichHenBUS } from '../services/LichHenBUS';
import { LichHenDTO } from '../models/LichHenDTO';

const router = Router();

// GET /api/lichhen
router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await LichHenBUS.LayDSLichHen();
        res.json({ success: true, data });
    } catch (error) {
        console.error("API Get Appointments Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// POST /api/lichhen
router.post('/', async (req: Request, res: Response) => {
    try {
        const lichHenData: LichHenDTO = {
            MaKH: req.body.MaKH || 1,
            DanhSachMaPhong: req.body.DanhSachMaPhong || [],
            NgayHen: req.body.NgayHen,
            GioHen: req.body.GioHen,
            GhiChu: req.body.GhiChu,
            TrangThai: 0
        };
        const result = await LichHenBUS.themLichhen(lichHenData);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("API Booking Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + (error.message || error), stack: error.stack });
    }
});

// PUT /api/lichhen/:id/status
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id));

        const { status, phanHoi } = req.body;
        const result = await LichHenBUS.ThayDoiTrangThai(id, status, phanHoi);

        res.json({ success: true, data: result });
    } catch (error) {

        console.error("API Update Appointment Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

export default router;
