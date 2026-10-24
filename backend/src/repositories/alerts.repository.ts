import { db } from '../config/database.js';
import { supabaseAdmin } from '../config/supabase.js';
import { FloodAlert } from '../types/index.js';

export const alertsRepository = {
  async findActive(): Promise<FloodAlert[]> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fa.id, fa.flood_point_id, fa.administrative_area_id, fa.alert_level,
          fa.title, fa.message, fa.alert_type, fa.verification_status,
          fa.started_at, fa.expires_at, fa.created_at,
          fp.name AS point_name, aa.name AS area_name
        FROM flood_alerts fa
        LEFT JOIN flood_points fp ON fa.flood_point_id = fp.id
        LEFT JOIN administrative_areas aa ON fa.administrative_area_id = aa.id
        WHERE fa.expires_at > NOW() AND fa.verification_status = 'VERIFIED'
        ORDER BY 
          CASE fa.alert_level WHEN 'RED' THEN 1 WHEN 'ORANGE' THEN 2 ELSE 3 END,
          fa.started_at DESC;
      `;
      const res = await db.query(sql);
      return res.rows;
    }

    const { data, error } = await supabaseAdmin
      .from('flood_alerts')
      .select('*, flood_points(name), administrative_areas(name)')
      .gt('expires_at', new Date().toISOString())
      .eq('verification_status', 'VERIFIED')
      .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      ...item,
      point_name: item.flood_points?.name || null,
      area_name: item.administrative_areas?.name || null,
    }));
  },

  async findAll(): Promise<FloodAlert[]> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fa.id, fa.flood_point_id, fa.administrative_area_id, fa.alert_level,
          fa.title, fa.message, fa.alert_type, fa.verification_status,
          fa.started_at, fa.expires_at, fa.created_at,
          fp.name AS point_name, aa.name AS area_name
        FROM flood_alerts fa
        LEFT JOIN flood_points fp ON fa.flood_point_id = fp.id
        LEFT JOIN administrative_areas aa ON fa.administrative_area_id = aa.id
        ORDER BY fa.created_at DESC;
      `;
      const res = await db.query(sql);
      return res.rows;
    }

    const { data, error } = await supabaseAdmin
      .from('flood_alerts')
      .select('*, flood_points(name), administrative_areas(name)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      ...item,
      point_name: item.flood_points?.name || null,
      area_name: item.administrative_areas?.name || null,
    }));
  },

  async create(alert: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('flood_alerts')
      .insert([alert])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('flood_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('flood_alerts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
};
