import { db } from '../config/database.js';
import { supabaseAdmin } from '../config/supabase.js';
import { FloodPoint } from '../types/index.js';

// Hàm tính khoảng cách trắc địa Haversine (mét) dùng làm giải pháp dự phòng khi chưa có DATABASE_URL
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

export const spatialRepository = {
  /**
   * Truy vấn các điểm ngập trong bán kính R mét bằng PostGIS ST_DWithin & ST_Distance
   */
  async findNearby(lat: number, lng: number, radiusMeters: number, limit: number = 50): Promise<FloodPoint[]> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fp.id, fp.name, fp.description, fp.address, fp.administrative_area_id,
          fp.risk_level, fp.risk_score, fp.frequency_score, fp.depth_score, fp.duration_score,
          fp.verification_status, fp.is_demo, fp.data_source_id, fp.created_at, fp.updated_at,
          aa.name AS area_name, ds.source_name,
          ST_Y(fp.location::geometry) AS latitude,
          ST_X(fp.location::geometry) AS longitude,
          ROUND(ST_Distance(
            fp.location::geography, 
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          )::numeric, 1) AS distance_meters
        FROM flood_points fp
        LEFT JOIN administrative_areas aa ON fp.administrative_area_id = aa.id
        LEFT JOIN data_sources ds ON fp.data_source_id = ds.id
        WHERE ST_DWithin(
          fp.location::geography, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
          $3
        )
        ORDER BY distance_meters ASC
        LIMIT $4;
      `;
      const res = await db.query(sql, [lng, lat, radiusMeters, limit]);
      return res.rows;
    }

    // Dự phòng qua Supabase REST API (nếu pool chưa kết nối mật khẩu)
    const { data, error } = await supabaseAdmin
      .from('flood_points')
      .select('*, administrative_areas(name), data_sources(source_name)');

    if (error || !data) throw new Error(error?.message || 'Không thể lấy dữ liệu điểm ngập');

    const pointsWithDistance = data.map((item: any) => {
      // Parse coordinates từ WKT hoặc PostGIS representation
      let pointLat = 21.0285;
      let pointLng = 105.8542;
      
      if (item.location && typeof item.location === 'string' && item.location.includes('POINT')) {
        const matches = item.location.match(/\(([^)]+)\)/);
        if (matches) {
          const parts = matches[1].split(' ');
          pointLng = parseFloat(parts[0]);
          pointLat = parseFloat(parts[1]);
        }
      }

      const dist = calculateHaversineDistance(lat, lng, pointLat, pointLng);
      return {
        ...item,
        area_name: item.administrative_areas?.name || null,
        source_name: item.data_sources?.source_name || null,
        latitude: pointLat,
        longitude: pointLng,
        distance_meters: dist,
      } as FloodPoint;
    });

    return pointsWithDistance
      .filter((p) => p.distance_meters !== undefined && p.distance_meters <= radiusMeters)
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))
      .slice(0, limit);
  },

  /**
   * Tìm Top N điểm nguy cơ ngập gần nhất bằng toán tử không gian PostGIS <->
   */
  async findNearest(lat: number, lng: number, limit: number = 10): Promise<FloodPoint[]> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fp.id, fp.name, fp.description, fp.address, fp.administrative_area_id,
          fp.risk_level, fp.risk_score, fp.frequency_score, fp.depth_score, fp.duration_score,
          fp.verification_status, fp.is_demo, fp.data_source_id, fp.created_at, fp.updated_at,
          aa.name AS area_name, ds.source_name,
          ST_Y(fp.location::geometry) AS latitude,
          ST_X(fp.location::geometry) AS longitude,
          ROUND(ST_Distance(
            fp.location::geography, 
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          )::numeric, 1) AS distance_meters
        FROM flood_points fp
        LEFT JOIN administrative_areas aa ON fp.administrative_area_id = aa.id
        LEFT JOIN data_sources ds ON fp.data_source_id = ds.id
        ORDER BY fp.location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326) ASC
        LIMIT $3;
      `;
      const res = await db.query(sql, [lng, lat, limit]);
      return res.rows;
    }

    // Dự phòng qua hàm tìm nearby với bán kính mở rộng
    return this.findNearby(lat, lng, 50000, limit);
  },
};
