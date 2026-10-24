import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { UserRole } from '../types/index.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: UserRole;
  display_name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu xác thực: Thiếu hoặc sai định dạng Bearer Token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Token xác thực không hợp lệ hoặc đã hết hạn',
      });
      return;
    }

    // Lấy thông tin hồ sơ và role từ bảng profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: (profile?.role as UserRole) || 'user',
      display_name: profile?.display_name,
    };

    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Lỗi xác thực người dùng: ' + err.message,
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Quyền truy cập bị từ chối: Thao tác này chỉ dành riêng cho Quản trị viên (Admin)',
    });
    return;
  }
  next();
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        role: (profile?.role as UserRole) || 'user',
        display_name: profile?.display_name,
      };
    }
  } catch {
    // Bỏ qua lỗi trong optionalAuth
  }

  next();
}
