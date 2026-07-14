import express from 'express';
import cors from 'cors';
import routes from './src/routes';
import { startCronJobs } from './src/jobs/cron';

const app = express();
startCronJobs();

import path from 'path';

app.use(cors());
app.use(express.json());
// Exclude static files from forcing application/json
app.use((req, res, next) => {
    if (!req.path.startsWith('/uploads')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
