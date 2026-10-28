-- ==============================================================================
-- VIETNAM FLOODWATCH GIS - POSTGIS MIGRATION 03: ENHANCED SCHEMA
-- Chuẩn hóa CSDL: Chống trùng lặp, hỗ trợ Ingestion Idempotency & Báo cáo Cộng đồng
-- An toàn: KHÔNG DROP TABLE, KHÔNG XÓA DỮ LIỆU HIỆN CÓ
-- ==============================================================================

-- 1. BẢNG CITIZEN_REPORTS (Báo cáo Ngập Cộng đồng Toàn quốc)
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name VARCHAR(150) DEFAULT 'Người dân',
    reporter_phone VARCHAR(20),
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city_province VARCHAR(100) DEFAULT 'Toàn quốc',
    water_depth_level VARCHAR(30) NOT NULL CHECK (water_depth_level IN ('ANKLE', 'HALF_WHEEL', 'FLOOD_DEEP')),
    estimated_depth_cm NUMERIC(5, 1) DEFAULT 30.0,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED')),
    upvotes INTEGER NOT NULL DEFAULT 1 CHECK (upvotes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Chỉ mục không gian GiST và chỉ mục lọc
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports (status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON citizen_reports (created_at DESC);

-- Bật bảo mật hàng RLS
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'citizen_reports' AND policyname = 'Public Read Active Citizen Reports') THEN
        CREATE POLICY "Public Read Active Citizen Reports" ON citizen_reports FOR SELECT USING (status IN ('ACTIVE', 'VERIFIED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'citizen_reports' AND policyname = 'Public Insert Citizen Reports') THEN
        CREATE POLICY "Public Insert Citizen Reports" ON citizen_reports FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'citizen_reports' AND policyname = 'Public Update Upvotes') THEN
        CREATE POLICY "Public Update Upvotes" ON citizen_reports FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Thêm vào kênh WebSockets Realtime
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE citizen_reports;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Bỏ qua nếu đã thêm
END $$;

-- 2. BỔ SUNG CỘT METADATA VÀO RAINFALL_OBSERVATIONS (Để phân biệt các mốc thời gian)
ALTER TABLE rainfall_observations ADD COLUMN IF NOT EXISTS valid_at TIMESTAMPTZ;
ALTER TABLE rainfall_observations ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE rainfall_observations ADD COLUMN IF NOT EXISTS quality_status VARCHAR(20) DEFAULT 'VALID';

-- 3. RÀNG BUỘC DUY NHẤT CHỐNG TRÙNG LẶP IDEMPOTENCY
-- Đảm bảo cùng một trạm/tọa độ tại cùng một thời điểm quan trắc chỉ có tối đa 1 bản ghi
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_rainfall_station_observed_at'
    ) THEN
        ALTER TABLE rainfall_observations 
        ADD CONSTRAINT uq_rainfall_station_observed_at UNIQUE (station_id, observed_at);
    END IF;
END $$;

-- 4. BẢNG INGESTION_LOGS (Nhật ký Tiến trình Thu thập Dữ liệu)
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMPTZ,
    records_inserted INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_started_at ON ingestion_logs(started_at DESC);
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ingestion_logs' AND policyname = 'Public Read Ingestion Logs') THEN
        CREATE POLICY "Public Read Ingestion Logs" ON ingestion_logs FOR SELECT USING (true);
    END IF;
END $$;
