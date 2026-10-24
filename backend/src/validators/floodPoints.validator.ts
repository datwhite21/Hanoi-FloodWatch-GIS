import { z } from 'zod';

export const createFloodPointSchema = z.object({
  name: z.string().min(3, { message: 'Tên điểm ngập phải có ít nhất 3 ký tự' }),
  description: z.string().optional(),
  address: z.string().min(5, { message: 'Địa chỉ phải có ít nhất 5 ký tự' }),
  administrative_area_id: z.string().uuid().optional().nullable(),
  latitude: z.number().min(-90).max(90, { message: 'Vĩ độ (latitude) phải từ -90 đến 90' }),
  longitude: z.number().min(-180).max(180, { message: 'Kinh độ (longitude) phải từ -180 đến 180' }),
  frequency_score: z.number().min(0).max(100).default(50),
  depth_score: z.number().min(0).max(100).default(50),
  duration_score: z.number().min(0).max(100).default(50),
  risk_level: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']).optional(),
  verification_status: z.enum(['VERIFIED', 'UNVERIFIED', 'REJECTED']).default('VERIFIED'),
  is_demo: z.boolean().default(false),
  data_source_id: z.string().uuid().optional().nullable(),
});

export const updateFloodPointSchema = createFloodPointSchema.partial();

export const filterFloodPointsSchema = z.object({
  search: z.string().optional(),
  district: z.string().optional(),
  risk_level: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']).optional(),
  is_demo: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});
