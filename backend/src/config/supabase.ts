import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error('❌ Lỗi khởi tạo Supabase: Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY');
}

// Client dùng cho người dùng / xác thực token
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin Client (dùng service_role_key để quản trị an toàn từ phía backend)
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;
