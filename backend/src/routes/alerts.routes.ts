import { Router } from 'express';
import { alertsController } from '../controllers/alerts.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { sensitiveActionLimiter } from '../middlewares/rateLimiter.middleware.js';
import { createAlertSchema, updateAlertSchema } from '../validators/alerts.validator.js';

const router = Router();

// GET /api/alerts - Lấy các cảnh báo ngập đang có hiệu lực (hoặc toàn bộ nếu ?all=true)
router.get('/', (req, res, next) => {
  if (req.query.all === 'true') {
    return alertsController.getAll(req, res, next);
  }
  return alertsController.getActive(req, res, next);
});

// POST /api/alerts - Tạo cảnh báo mới (Admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  validate({ body: createAlertSchema }),
  alertsController.create
);

// PUT /api/alerts/:id - Sửa cảnh báo (Admin)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  validate({ body: updateAlertSchema }),
  alertsController.update
);

// DELETE /api/alerts/:id - Hủy bỏ cảnh báo (Admin)
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  sensitiveActionLimiter,
  alertsController.delete
);

export default router;
