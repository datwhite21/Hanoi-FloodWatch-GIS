import { db } from '../config/database.js';
import { supabaseAdmin } from '../config/supabase.js';
import { FloodPoint } from '../types/index.js';
import { extractCoordinates } from './spatial.repository.js';

export const floodPointsRepository = {
  async findAll(filters: {
    search?: string;
    district?: string;
    risk_level?: string;
    is_demo?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: FloodPoint[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    if (db.isAvailable()) {
      let whereClauses: string[] = ['1=1'];
      let params: any[] = [];
      let paramIndex = 1;

      if (filters.search) {
        whereClauses.push(`(fp.name ILIKE $${paramIndex} OR fp.address ILIKE $${paramIndex})`);
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.district) {
        whereClauses.push(`(aa.name ILIKE $${paramIndex} OR aa.administrative_code = $${paramIndex})`);
        params.push(filters.district);
        paramIndex++;
      }

      if (filters.risk_level) {
        whereClauses.push(`fp.risk_level = $${paramIndex}`);
        params.push(filters.risk_level);
        paramIndex++;
      }

      if (filters.is_demo !== undefined) {
        whereClauses.push(`fp.is_demo = $${paramIndex}`);
        params.push(filters.is_demo);
        paramIndex++;
      }

      const whereSql = whereClauses.join(' AND ');

      // Đếm tổng số bản ghi
      const countSql = `
        SELECT COUNT(*) as total 
        FROM flood_points fp
        LEFT JOIN administrative_areas aa ON fp.administrative_area_id = aa.id
        WHERE ${whereSql}
      `;
      const countRes = await db.query(countSql, params);
      const total = parseInt(countRes.rows[0]?.total || '0', 10);

      // Lấy dữ liệu phân trang
      const dataSql = `
        SELECT 
          fp.id, fp.name, fp.description, fp.address, fp.administrative_area_id,
          fp.risk_level, fp.risk_score, fp.frequency_score, fp.depth_score, fp.duration_score,
          fp.verification_status, fp.is_demo, fp.data_source_id, fp.created_at, fp.updated_at,
          aa.name AS area_name, ds.source_name,
          ST_Y(fp.location::geometry) AS latitude,
          ST_X(fp.location::geometry) AS longitude
        FROM flood_points fp
        LEFT JOIN administrative_areas aa ON fp.administrative_area_id = aa.id
        LEFT JOIN data_sources ds ON fp.data_source_id = ds.id
        WHERE ${whereSql}
        ORDER BY fp.risk_score DESC, fp.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      params.push(limit, offset);
      const dataRes = await db.query(dataSql, params);

      return { data: dataRes.rows, total };
    }

    // Dự phòng qua Supabase API
    let query = supabaseAdmin
      .from('flood_points')
      .select('*, administrative_areas(name), data_sources(source_name)', { count: 'exact' });

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
    }
    if (filters.risk_level) {
      query = query.eq('risk_level', filters.risk_level);
    }
    if (filters.is_demo !== undefined) {
      query = query.eq('is_demo', filters.is_demo);
    }

    query = query.range(offset, offset + limit - 1).order('risk_score', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    const formatted = (data || []).map((item: any) => {
      const { lat, lng } = extractCoordinates(item.location);
      return {
        ...item,
        area_name: item.administrative_areas?.name || null,
        source_name: item.data_sources?.source_name || null,
        latitude: lat,
        longitude: lng,
      } as FloodPoint;
    });

    return { data: formatted, total: count || formatted.length };
  },

  async findById(id: string): Promise<any | null> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fp.id, fp.name, fp.description, fp.address, fp.administrative_area_id,
          fp.risk_level, fp.risk_score, fp.frequency_score, fp.depth_score, fp.duration_score,
          fp.verification_status, fp.is_demo, fp.data_source_id, fp.created_at, fp.updated_at,
          aa.name AS area_name, ds.source_name,
          ST_Y(fp.location::geometry) AS latitude,
          ST_X(fp.location::geometry) AS longitude
        FROM flood_points fp
        LEFT JOIN administrative_areas aa ON fp.administrative_area_id = aa.id
        LEFT JOIN data_sources ds ON fp.data_source_id = ds.id
        WHERE fp.id = $1
      `;
      const res = await db.query(sql, [id]);
      if (res.rows.length === 0) return null;

      const point = res.rows[0];

      // Lấy lịch sử quan trắc
      const obsSql = `
        SELECT id, observed_at, water_depth_cm, duration_minutes, flood_status, notes, image_url
        FROM flood_observations
        WHERE flood_point_id = $1
        ORDER BY observed_at DESC
      `;
      const obsRes = await db.query(obsSql, [id]);
      point.observations = obsRes.rows;

      // Lấy cảnh báo liên quan
      const alertSql = `
        SELECT id, alert_level, title, message, started_at, expires_at
        FROM flood_alerts
        WHERE flood_point_id = $1 AND expires_at > NOW()
      `;
      const alertRes = await db.query(alertSql, [id]);
      point.active_alerts = alertRes.rows;

      return point;
    }

    // Dự phòng qua Supabase API
    const { data, error } = await supabaseAdmin
      .from('flood_points')
      .select('*, administrative_areas(name), data_sources(source_name), flood_observations(*), flood_alerts(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const { lat, lng } = extractCoordinates(data.location);

    return {
      ...data,
      area_name: data.administrative_areas?.name || null,
      source_name: data.data_sources?.source_name || null,
      latitude: lat,
      longitude: lng,
      observations: data.flood_observations || [],
      active_alerts: data.flood_alerts || [],
    };
  },

  async create(point: any): Promise<any> {
    if (db.isAvailable()) {
      const sql = `
        INSERT INTO flood_points (
          name, description, address, administrative_area_id,
          location, frequency_score, depth_score, duration_score,
          verification_status, is_demo, data_source_id
        )
        VALUES (
          $1, $2, $3, $4,
          ST_SetSRID(ST_MakePoint($5, $6), 4326),
          $7, $8, $9, $10, $11, $12
        )
        RETURNING id, name, address, risk_level, risk_score, created_at;
      `;
      const params = [
        point.name,
        point.description || null,
        point.address,
        point.administrative_area_id || null,
        point.longitude,
        point.latitude,
        point.frequency_score || 50,
        point.depth_score || 50,
        point.duration_score || 50,
        point.verification_status || 'VERIFIED',
        point.is_demo || false,
        point.data_source_id || null,
      ];
      const res = await db.query(sql, params);
      return res.rows[0];
    }

    // Qua Supabase
    const insertPayload = {
      name: point.name,
      description: point.description,
      address: point.address,
      administrative_area_id: point.administrative_area_id,
      location: `POINT(${point.longitude} ${point.latitude})`,
      frequency_score: point.frequency_score || 50,
      depth_score: point.depth_score || 50,
      duration_score: point.duration_score || 50,
      verification_status: point.verification_status || 'VERIFIED',
      is_demo: point.is_demo || false,
      data_source_id: point.data_source_id,
    };
    const { data, error } = await supabaseAdmin.from('flood_points').insert([insertPayload]).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: any): Promise<any> {
    if (db.isAvailable()) {
      const sets: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (updates.name) { sets.push(`name = $${idx++}`); params.push(updates.name); }
      if (updates.description !== undefined) { sets.push(`description = $${idx++}`); params.push(updates.description); }
      if (updates.address) { sets.push(`address = $${idx++}`); params.push(updates.address); }
      if (updates.administrative_area_id !== undefined) { sets.push(`administrative_area_id = $${idx++}`); params.push(updates.administrative_area_id); }
      if (updates.latitude !== undefined && updates.longitude !== undefined) {
        sets.push(`location = ST_SetSRID(ST_MakePoint($${idx++}, $${idx++}), 4326)`);
        params.push(updates.longitude, updates.latitude);
      }
      if (updates.frequency_score !== undefined) { sets.push(`frequency_score = $${idx++}`); params.push(updates.frequency_score); }
      if (updates.depth_score !== undefined) { sets.push(`depth_score = $${idx++}`); params.push(updates.depth_score); }
      if (updates.duration_score !== undefined) { sets.push(`duration_score = $${idx++}`); params.push(updates.duration_score); }
      if (updates.verification_status) { sets.push(`verification_status = $${idx++}`); params.push(updates.verification_status); }

      sets.push(`updated_at = NOW()`);
      params.push(id);

      const sql = `UPDATE flood_points SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *;`;
      const res = await db.query(sql, params);
      return res.rows[0];
    }

    const { data, error } = await supabaseAdmin.from('flood_points').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    if (db.isAvailable()) {
      const res = await db.query('DELETE FROM flood_points WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }
    const { error } = await supabaseAdmin.from('flood_points').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
};
