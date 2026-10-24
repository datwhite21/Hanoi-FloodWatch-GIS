import { Router } from 'express';
import { observationsController } from '../controllers/observations.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createObservationSchema } from '../validators/observations.validator.js';

const router = Router();

// GET /api/observations/:pointId - Lịch sử đo ngập tại một điểm
router.get('/:pointId', observationsController.getByPoint);

// POST /api/observations - Thêm bản ghi đo ngập mới (Yêu cầu đăng nhập)
router.post(
  '/',
  requireAuth,
  validate({ body: createObservationSchema }),
  observationsController.create
);

export default router;
