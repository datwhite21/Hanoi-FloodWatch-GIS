import { z } from 'zod';

export const createObservationSchema = z.object({
  flood_point_id: z.string().uuid({ message: 'Mã điểm ngập không hợp lệ' }),
  observed_at: z.string().datetime({ message: 'Thời điểm quan trắc không hợp lệ' }),
  water_depth_cm: z.number().min(0, { message: 'Độ sâu ngập phải >= 0 cm' }),
  duration_minutes: z.number().min(0).optional().nullable(),
  flood_status: z.enum(['PEAK', 'ACTIVE', 'RECEDED']).default('RECEDED'),
  notes: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  verification_status: z.enum(['VERIFIED', 'UNVERIFIED']).default('VERIFIED'),
});
