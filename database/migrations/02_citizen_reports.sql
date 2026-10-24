-- ==============================================================================
-- VIETNAM FLOODWATCH GIS - POSTGIS MIGRATION 02: CITIZEN REPORTS
-- Báo cáo ngập úng cộng đồng thời gian thực trên toàn quốc (GPS Crowdsourcing)
-- ==============================================================================

-- 1. TẠO BẢNG CITIZEN_REPORTS (Không chèn dữ liệu mẫu, dữ liệu sinh ra từ người dùng thật)
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name VARCHAR(100) DEFAULT 'Người dân',
    reporter_phone VARCHAR(20),
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city_province VARCHAR(100) DEFAULT 'Toàn quốc',
    water_depth_level VARCHAR(30) NOT NULL DEFAULT 'HALF_WHEEL' CHECK (water_depth_level IN ('ANKLE', 'HALF_WHEEL', 'FLOOD_DEEP')),
    estimated_depth_cm NUMERIC(5, 1) NOT NULL DEFAULT 30.0,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED')),
    upvotes INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 2. TẠO CHỈ MỤC KHÔNG GIAN GIST ĐỂ TRUY VẤN BÁN KÍNH SIÊU TỐC
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON citizen_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports(status);

-- 3. KÍCH HOẠT SUPABASE REALTIME ĐỂ PHÁT SÓNG SỰ KIỆN QUA WEBSOCKETS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE citizen_reports;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Bỏ qua nếu bảng đã được thêm vào publication trước đó
END $$;
