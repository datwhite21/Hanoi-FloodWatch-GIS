import { db } from '../config/database.js';
import { supabaseAdmin } from '../config/supabase.js';
import { FloodObservation } from '../types/index.js';

export const observationsRepository = {
  async findByPointId(pointId: string): Promise<FloodObservation[]> {
    if (db.isAvailable()) {
      const sql = `
        SELECT 
          fo.id, fo.flood_point_id, fo.observed_at, fo.water_depth_cm,
          fo.duration_minutes, fo.flood_status, fo.notes, fo.image_url,
          fo.verification_status, fo.created_at, fp.name AS point_name
        FROM flood_observations fo
        JOIN flood_points fp ON fo.flood_point_id = fp.id
        WHERE fo.flood_point_id = $1
        ORDER BY fo.observed_at DESC;
      `;
      const res = await db.query(sql, [pointId]);
      return res.rows;
    }

    const { data, error } = await supabaseAdmin
      .from('flood_observations')
      .select('*, flood_points(name)')
      .eq('flood_point_id', pointId)
      .order('observed_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      ...item,
      point_name: item.flood_points?.name || null,
    }));
  },

  async create(obs: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('flood_observations')
      .insert([obs])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('flood_observations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};
