import express from 'express';
import cors from 'cors';
import routes from './src/routes';
import { DonHangService } from './src/services/DonHangService';

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Khởi động cron job đối soát đơn hàng
    DonHangService.startCronJob();
});
