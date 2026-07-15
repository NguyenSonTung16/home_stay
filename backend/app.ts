import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './src/routes';
import { startCronJobs } from './src/jobs/cron';
import { DonHangService } from './src/services/DonHangService';
import { PhieuDatCocService } from './src/services/PhieuDatCocService';

const app = express();
startCronJobs();

app.use(cors());
app.use(express.json());
// Exclude static files from forcing application/json
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/room_images', express.static(path.join(__dirname, 'public/room_images')));
app.use((req, res, next) => {
    if (!req.path.startsWith('/uploads') && !req.path.startsWith('/public') && !req.path.startsWith('/room_images')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Khởi động cron job đối soát đơn hàng
    DonHangService.startCronJob();
    PhieuDatCocService.startCronJob();
});
