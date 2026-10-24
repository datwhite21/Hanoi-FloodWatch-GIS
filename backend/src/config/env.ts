import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ưu tiên load từ .env của backend hoặc .env của thư mục gốc dự án
const rootEnvPath = path.resolve(process.cwd(), '../.env');
const currentEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(currentEnvPath)) {
  dotenv.config({ path: currentEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};

// Kiểm tra nhanh các biến môi trường thiết yếu
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ CẢNH BÁO: Chưa cấu hình SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env');
}
