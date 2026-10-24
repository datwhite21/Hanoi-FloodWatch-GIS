import { Router } from 'express';
import { citizenReportsController } from '../controllers/citizenReports.controller.js';

const router = Router();

// POST /api/citizen-reports - Người dân gửi báo cáo ngập tức thời bằng GPS
router.post('/', citizenReportsController.create);

// GET /api/citizen-reports/active - Lấy các báo cáo ngập đang hoạt động
router.get('/active', citizenReportsController.getActive);

// POST /api/citizen-reports/:id/upvote - Cộng đồng xác nhận (+1) điểm ngập này có thật
router.post('/:id/upvote', citizenReportsController.upvote);

export default router;
