import { z } from 'zod';

export const createAlertSchema = z.object({
  flood_point_id: z.string().uuid().optional().nullable(),
  administrative_area_id: z.string().uuid().optional().nullable(),
  alert_level: z.enum(['RED', 'ORANGE', 'YELLOW']),
  title: z.string().min(5, { message: 'Tiêu đề cảnh báo phải có ít nhất 5 ký tự' }),
  message: z.string().min(10, { message: 'Nội dung khuyến cáo phải có ít nhất 10 ký tự' }),
  alert_type: z.enum(['RAINFALL_THRESHOLD', 'URGENT', 'ADVISORY', 'DEMO']).default('RAINFALL_THRESHOLD'),
  verification_status: z.enum(['VERIFIED', 'DRAFT', 'REVOKED']).default('VERIFIED'),
  started_at: z.string().datetime().optional(),
  expires_at: z.string().datetime({ message: 'Thời gian hết hạn không hợp lệ' }),
});

export const updateAlertSchema = createAlertSchema.partial();
