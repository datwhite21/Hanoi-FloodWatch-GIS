import { Router } from 'express';
import { spatialController } from '../controllers/spatial.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { nearbyQuerySchema, nearestQuerySchema } from '../validators/spatial.validator.js';

const router = Router();

// GET /api/spatial/nearby - Tìm điểm ngập trong bán kính R mét
router.get('/nearby', validate({ query: nearbyQuerySchema }), spatialController.getNearby);

// GET /api/spatial/nearest - Tìm Top N điểm nguy cơ gần nhất
router.get('/nearest', validate({ query: nearestQuerySchema }), spatialController.getNearest);

export default router;
