import rateLimit from 'express-rate-limit';

// Rate limiter cho các API tra cứu công cộng (100 requests / 15 phút)
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho các thao tác nhạy cảm (Đăng nhập, Thêm/Sửa/Xóa: 30 requests / 15 phút)
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Quá nhiều thao tác quản trị. Vui lòng chờ vài phút trước khi tiếp tục.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
