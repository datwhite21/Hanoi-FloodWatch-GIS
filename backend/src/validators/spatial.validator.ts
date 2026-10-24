import { z } from 'zod';

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, { message: 'Vĩ độ (lat) phải nằm trong khoảng -90 đến 90' }),
  lng: z.coerce.number().min(-180).max(180, { message: 'Kinh độ (lng) phải nằm trong khoảng -180 đến 180' }),
  radius: z.coerce.number().min(100).max(20000, { message: 'Bán kính (radius) phải từ 100m đến 20.000m' }).default(2000),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const nearestQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, { message: 'Vĩ độ (lat) phải nằm trong khoảng -90 đến 90' }),
  lng: z.coerce.number().min(-180).max(180, { message: 'Kinh độ (lng) phải nằm trong khoảng -180 đến 180' }),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const areaSpatialQuerySchema = z.object({
  area_id: z.string().uuid().optional(),
  area_code: z.string().optional(),
});
