import { Router } from 'express';
import { searchRooms, getRoomDetails, createAppointment } from '../controllers/BookingController';

const router = Router();

router.get('/rooms', searchRooms);
router.get('/rooms/:id', getRoomDetails);
router.post('/appointments', createAppointment);

export default router;
