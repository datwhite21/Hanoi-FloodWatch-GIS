import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

const hasValidDatabaseUrl = env.DATABASE_URL && 
  !env.DATABASE_URL.includes('[YOUR-PASSWORD]') && 
  !env.DATABASE_URL.includes('[YOUR-PROJECT-REF]');

if (hasValidDatabaseUrl) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Hỗ trợ kết nối SSL tới Supabase Pooler
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('⚠️ Lỗi bất ngờ trên PostgreSQL Pool:', err.message);
  });
} else {
  console.warn('⚠️ DATABASE_URL chưa được cập nhật mật khẩu thật trong .env. Các truy vấn SQL PostGIS trực tiếp sẽ chuyển hướng qua Supabase REST API.');
}

export const db = {
  isAvailable: (): boolean => pool !== null,
  query: async <T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> => {
    if (!pool) {
      throw new Error('DATABASE_URL chưa được cấu hình mật khẩu thực tế trong .env');
    }
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (!env.isProduction) {
      // console.log(`[SQL Query] (${duration}ms):`, text.slice(0, 80));
    }
    return res;
  },
  getPool: () => pool,
};
