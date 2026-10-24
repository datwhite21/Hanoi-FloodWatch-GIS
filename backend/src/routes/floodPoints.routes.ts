import { Router } from 'express';
import { floodPointsController } from '../controllers/floodPoints.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { sensitiveActionLimiter } from '../middlewares/rateLimiter.middleware.js';
import { createFloodPointSchema, updateFloodPointSchema, filterFloodPointsSchema } from '../validators/floodPoints.validator.js';

const router = Router();

// GET /api/flood-points - Danh sách điểm ngập (có tìm kiếm, lọc quận, nguy cơ)
router.get('/', validate({ query: filterFloodPointsSchema }), floodPointsController.getAll);

// GET /api/flood-points/:id - Chi tiết một điểm ngập kèm quan trắc & cảnh báo
router.get('/:id', floodPointsController.getById);

// POST /api/flood-points - Thêm điểm ngập mới (Yêu cầu quyền Admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  validate({ body: createFloodPointSchema }),
  floodPointsController.create
);

// PUT /api/flood-points/:id - Cập nhật thông tin điểm ngập (Yêu cầu quyền Admin)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  validate({ body: updateFloodPointSchema }),
  floodPointsController.update
);

// DELETE /api/flood-points/:id - Xóa điểm ngập (Yêu cầu quyền Admin)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  floodPointsController.delete
);

export default router;
