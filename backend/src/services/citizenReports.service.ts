import { supabaseAdmin } from '../config/supabase.js';
import { db } from '../config/database.js';

export interface CreateReportPayload {
  reporter_name?: string;
  reporter_phone?: string;
  latitude: number;
  longitude: number;
  address: string;
  city_province?: string;
  water_depth_level: 'ANKLE' | 'HALF_WHEEL' | 'FLOOD_DEEP';
  estimated_depth_cm: number;
  description?: string;
  image_url?: string;
}

export const citizenReportsService = {
  async createReport(payload: CreateReportPayload) {
    const lat = Number(payload.latitude);
    const lng = Number(payload.longitude);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      const err: any = new Error('Tọa độ GPS không hợp lệ');
      err.statusCode = 400;
      throw err;
    }

    if (!payload.address || payload.address.trim() === '') {
      const err: any = new Error('Vui lòng cung cấp địa chỉ hoặc tên vị trí ngập úng');
      err.statusCode = 400;
      throw err;
    }

    // 1. Thử lưu vào bảng chuyên biệt citizen_reports
    const { data, error } = await supabaseAdmin
      .from('citizen_reports')
      .insert({
        reporter_name: payload.reporter_name || 'Người dân',
        reporter_phone: payload.reporter_phone || null,
        location: `POINT(${lng} ${lat})`,
        latitude: lat,
        longitude: lng,
        address: payload.address.trim(),
        city_province: payload.city_province || 'Toàn quốc',
        water_depth_level: payload.water_depth_level || 'HALF_WHEEL',
        estimated_depth_cm: payload.estimated_depth_cm || 30.0,
        description: payload.description || null,
        image_url: payload.image_url || null,
        status: 'ACTIVE',
        upvotes: 1,
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }

    // 2. Dự phòng: Nếu bảng citizen_reports chưa được tạo trên Supabase, lưu vào flood_points
    console.warn('[CitizenReports] Bảng citizen_reports chưa sẵn sàng, lưu tạm vào flood_points:', error?.message);
    const riskLevel = payload.water_depth_level === 'FLOOD_DEEP' ? 'HIGH' : payload.water_depth_level === 'HALF_WHEEL' ? 'MEDIUM' : 'LOW';
    const riskScore = payload.water_depth_level === 'FLOOD_DEEP' ? 95 : payload.water_depth_level === 'HALF_WHEEL' ? 65 : 35;

    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
      .from('flood_points')
      .insert({
        name: `[Cộng đồng] ${payload.address}`,
        description: payload.description || `Người dân báo ngập mức: ${payload.water_depth_level} (~${payload.estimated_depth_cm}cm)`,
        address: payload.address,
        location: `POINT(${lng} ${lat})`,
        risk_level: riskLevel,
        risk_score: riskScore,
        depth_score: payload.estimated_depth_cm,
        verification_status: 'UNVERIFIED',
        is_demo: false,
      })
      .select()
      .single();

    if (fallbackError) {
      throw new Error(`Không thể ghi nhận báo cáo: ${fallbackError.message}`);
    }

    return {
      ...fallbackData,
      latitude: lat,
      longitude: lng,
      water_depth_level: payload.water_depth_level,
      estimated_depth_cm: payload.estimated_depth_cm,
      is_fallback: true,
    };
  },

  async getActiveReports() {
    // 1. Thử lấy từ bảng citizen_reports
    const { data, error } = await supabaseAdmin
      .from('citizen_reports')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      return data;
    }

    // 2. Nếu bảng citizen_reports chưa có, lấy từ flood_points (các điểm UNVERIFIED do cộng đồng tạo)
    const { data: fallbackPoints } = await supabaseAdmin
      .from('flood_points')
      .select('*')
      .eq('verification_status', 'UNVERIFIED')
      .order('created_at', { ascending: false })
      .limit(50);

    return (fallbackPoints || []).map((p: any) => {
      // Trích xuất tọa độ nếu cần
      let lat = p.latitude;
      let lng = p.longitude;
      if (!lat && p.location) {
        const match = p.location.match(/\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(' ');
          lng = parseFloat(parts[0]);
          lat = parseFloat(parts[1]);
        }
      }
      return {
        id: p.id,
        reporter_name: 'Người dân',
        latitude: lat,
        longitude: lng,
        address: p.address,
        water_depth_level: p.risk_level === 'HIGH' ? 'FLOOD_DEEP' : p.risk_level === 'MEDIUM' ? 'HALF_WHEEL' : 'ANKLE',
        estimated_depth_cm: p.depth_score || 30,
        description: p.description,
        status: 'ACTIVE',
        created_at: p.created_at,
        upvotes: 1,
      };
    });
  },

  async upvoteReport(id: string) {
    const { data, error } = await supabaseAdmin
      .from('citizen_reports')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (!error && data) {
      const newUpvotes = (data.upvotes || 1) + 1;
      await supabaseAdmin.from('citizen_reports').update({ upvotes: newUpvotes }).eq('id', id);
      return { id, upvotes: newUpvotes };
    }
    return { id, upvotes: 2 };
  },
};
