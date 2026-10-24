import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`❌ [Error ${req.method} ${req.url}]:`, err);

  // 1. Xử lý lỗi validate schema từ Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Dữ liệu đầu vào không hợp lệ',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // 2. Xử lý lỗi PostGIS / PostgreSQL
  if (err.code && typeof err.code === 'string') {
    // 23505: Unique violation
    if (err.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Dữ liệu đã tồn tại trong hệ thống (vi phạm ràng buộc duy nhất)',
        detail: err.detail,
      });
      return;
    }
    // 23503: Foreign key violation
    if (err.code === '23503') {
      res.status(400).json({
        success: false,
        error: 'Khóa ngoại không hợp lệ hoặc bản ghi tham chiếu không tồn tại',
        detail: err.detail,
      });
      return;
    }
  }

  // 3. Lỗi mặc định máy chủ (500)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
