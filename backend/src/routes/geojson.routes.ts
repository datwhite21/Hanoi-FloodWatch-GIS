import { Router } from 'express';
import { geojsonController } from '../controllers/geojson.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/export/geojson, /api/geojson/export, /api/export
router.get(['/', '/export', '/geojson'], geojsonController.exportPoints);

// POST /api/import/geojson, /api/geojson/import, /api/import (Admin)
router.post(['/', '/import', '/geojson'], requireAuth, requireAdmin, geojsonController.importPoints);

export default router;
