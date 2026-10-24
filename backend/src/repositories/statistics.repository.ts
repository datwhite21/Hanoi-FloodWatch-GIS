import { db } from '../config/database.js';
import { supabaseAdmin } from '../config/supabase.js';
import { StatisticsOverview } from '../types/index.js';

export const statisticsRepository = {
  async getOverview(): Promise<StatisticsOverview> {
    if (db.isAvailable()) {
      const countsSql = `
        SELECT 
          COUNT(*) as total_points,
          COUNT(*) FILTER (WHERE risk_level = 'HIGH') as high_risk_count,
          COUNT(*) FILTER (WHERE risk_level = 'MEDIUM') as medium_risk_count,
          COUNT(*) FILTER (WHERE risk_level = 'LOW') as low_risk_count,
          COUNT(*) FILTER (WHERE risk_level = 'UNKNOWN') as unknown_risk_count,
          COUNT(*) FILTER (WHERE is_demo = true) as demo_points_count,
          COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') as verified_points_count
        FROM flood_points;
      `;
      const countsRes = await db.query(countsSql);
      const c = countsRes.rows[0];

      // Đếm cảnh báo đang hiệu lực
      const alertsSql = `SELECT COUNT(*) as count FROM flood_alerts WHERE expires_at > NOW();`;
      const alertsRes = await db.query(alertsSql);

      // Thống kê theo quận
      const areaSql = `
        SELECT 
          aa.name as area_name,
          aa.administrative_code as area_code,
          COUNT(fp.id) as point_count,
          COUNT(fp.id) FILTER (WHERE fp.risk_level = 'HIGH') as high_risk_count
        FROM administrative_areas aa
        LEFT JOIN flood_points fp ON aa.id = fp.administrative_area_id
        GROUP BY aa.id, aa.name, aa.administrative_code
        ORDER BY point_count DESC;
      `;
      const areaRes = await db.query(areaSql);

      return {
        total_points: parseInt(c.total_points || '0', 10),
        high_risk_count: parseInt(c.high_risk_count || '0', 10),
        medium_risk_count: parseInt(c.medium_risk_count || '0', 10),
        low_risk_count: parseInt(c.low_risk_count || '0', 10),
        unknown_risk_count: parseInt(c.unknown_risk_count || '0', 10),
        demo_points_count: parseInt(c.demo_points_count || '0', 10),
        verified_points_count: parseInt(c.verified_points_count || '0', 10),
        active_alerts_count: parseInt(alertsRes.rows[0]?.count || '0', 10),
        points_by_area: areaRes.rows.map((r: any) => ({
          area_name: r.area_name,
          area_code: r.area_code,
          point_count: parseInt(r.point_count || '0', 10),
          high_risk_count: parseInt(r.high_risk_count || '0', 10),
        })),
      };
    }

    // Dự phòng qua Supabase REST API
    const { data: points } = await supabaseAdmin.from('flood_points').select('risk_level, is_demo, verification_status, administrative_area_id');
    const { data: alerts } = await supabaseAdmin.from('flood_alerts').select('id').gt('expires_at', new Date().toISOString());
    const { data: areas } = await supabaseAdmin.from('administrative_areas').select('id, name, administrative_code');

    const allPoints = points || [];
    const allAreas = areas || [];

    const areaMap: Record<string, { area_name: string; area_code: string; point_count: number; high_risk_count: number }> = {};
    allAreas.forEach(a => {
      areaMap[a.id] = { area_name: a.name, area_code: a.administrative_code, point_count: 0, high_risk_count: 0 };
    });

    allPoints.forEach(p => {
      if (p.administrative_area_id && areaMap[p.administrative_area_id]) {
        areaMap[p.administrative_area_id].point_count++;
        if (p.risk_level === 'HIGH') {
          areaMap[p.administrative_area_id].high_risk_count++;
        }
      }
    });

    return {
      total_points: allPoints.length,
      high_risk_count: allPoints.filter(p => p.risk_level === 'HIGH').length,
      medium_risk_count: allPoints.filter(p => p.risk_level === 'MEDIUM').length,
      low_risk_count: allPoints.filter(p => p.risk_level === 'LOW').length,
      unknown_risk_count: allPoints.filter(p => p.risk_level === 'UNKNOWN').length,
      demo_points_count: allPoints.filter(p => p.is_demo).length,
      verified_points_count: allPoints.filter(p => p.verification_status === 'VERIFIED').length,
      active_alerts_count: (alerts || []).length,
      points_by_area: Object.values(areaMap).sort((a, b) => b.point_count - a.point_count),
    };
  },
};
