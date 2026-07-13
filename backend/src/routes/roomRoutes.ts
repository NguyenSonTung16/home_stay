import { Router, Request, Response } from 'express';
import { PhongBUS } from '../services/PhongBUS';

const router = Router();

// GET /api/phong/search
router.get('/search', async (req: Request, res: Response) => {
    try {
        const loaiphong = req.query.loaiphong as string || '';
        const gia = parseFloat(req.query.gia as string) || 0;
        // const dichvu = req.query.dichvu ...
        
        const data = await PhongBUS.layDSphong();
        res.json({ success: true, data });
    } catch (error) {
        console.error("API Search Room Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

export default router;
