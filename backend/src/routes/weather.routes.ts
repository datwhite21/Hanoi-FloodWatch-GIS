import { Router } from 'express';
import { weatherController } from '../controllers/weather.controller.js';

const router = Router();

// GET /api/weather/current?lat=...&lng=... - Lấy thời tiết và lượng mưa thực tế theo tọa độ GPS
router.get('/current', weatherController.getCurrent);

// GET /api/weather/stations - Lấy toàn bộ quan trắc vệ tinh các trạm trọng điểm toàn quốc
router.get('/stations', weatherController.getStationsOverview);

export default router;
