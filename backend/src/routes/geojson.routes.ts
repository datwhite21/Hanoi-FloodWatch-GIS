import { Router } from 'express';
import { geojsonController } from '../controllers/geojson.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/export/geojson - Xuất dữ liệu điểm ngập ra chuẩn GeoJSON RFC 7946
router.get('/export', geojsonController.exportPoints);

// POST /api/import/geojson - Nhập dữ liệu từ file GeoJSON (Admin)
router.post('/import', requireAuth, requireAdmin, geojsonController.importPoints);

export default router;
