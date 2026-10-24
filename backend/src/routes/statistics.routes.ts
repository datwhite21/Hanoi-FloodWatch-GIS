import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller.js';

const router = Router();

// GET /api/statistics/overview - Thống kê tổng hợp số liệu cho Dashboard
router.get('/overview', statisticsController.getOverview);

export default router;
