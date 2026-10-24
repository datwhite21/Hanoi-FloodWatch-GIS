import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/auth/me - Kiểm tra trạng thái đăng nhập và quyền hạn hiện tại
router.get('/me', requireAuth, authController.getMe);

export default router;
