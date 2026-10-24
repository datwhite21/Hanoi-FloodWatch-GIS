-- ==============================================================================
-- HANOI FLOODWATCH GIS - POSTGRESQL + POSTGIS INITIAL SCHEMA MIGRATION
-- File: database/migrations/01_initial_schema.sql
-- Hệ quy chiếu tọa độ: WGS 84 (EPSG:4326)
-- ==============================================================================

-- 1. KÍCH HOẠT PHẦN MỞ RỘNG KHÔNG GIAN POSTGIS & TIỆN ÍCH
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TẠO CÁC BẢNG DỮ LIỆU
-- ==============================================================================

-- BẢNG 1: PROFILES (Liên kết tài khoản người dùng với Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 2: ADMINISTRATIVE_AREAS (Ranh giới hành chính các Quận/Huyện Hà Nội)
CREATE TABLE IF NOT EXISTS administrative_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    administrative_code VARCHAR(20) UNIQUE NOT NULL,
    boundary GEOMETRY(MultiPolygon, 4326),
    boundary_source VARCHAR(200) DEFAULT 'Sở TN&MT Hà Nội / OpenStreetMap',
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 3: DATA_SOURCES (Nguồn gốc dữ liệu kiểm chứng)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(250) NOT NULL,
    source_url TEXT,
    license VARCHAR(100) DEFAULT 'Open Data / Public Record',
    collected_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 4: FLOOD_POINTS (Bảng trung tâm: Điểm có nguy cơ ngập úng đô thị)
CREATE TABLE IF NOT EXISTS flood_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(250) NOT NULL,
    description TEXT,
    address VARCHAR(300) NOT NULL,
    administrative_area_id UUID REFERENCES administrative_areas(id) ON DELETE SET NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN' CHECK (risk_level IN ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN')),
    risk_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 100),
    frequency_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (frequency_score >= 0 AND frequency_score <= 100),
    depth_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (depth_score >= 0 AND depth_score <= 100),
    duration_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (duration_score >= 0 AND duration_score <= 100),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED', 'REJECTED')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 5: FLOOD_OBSERVATIONS (Lịch sử quan trắc ngập úng thực tế qua các trận mưa)
CREATE TABLE IF NOT EXISTS flood_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flood_point_id UUID NOT NULL REFERENCES flood_points(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    water_depth_cm NUMERIC(6, 2) NOT NULL CHECK (water_depth_cm >= 0),
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    flood_status VARCHAR(20) NOT NULL DEFAULT 'RECEDED' CHECK (flood_status IN ('PEAK', 'ACTIVE', 'RECEDED')),
    notes TEXT,
    image_url TEXT,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 6: RAINFALL_STATIONS (Trạm đo mưa khí tượng phục vụ cảnh báo sớm)
CREATE TABLE IF NOT EXISTS rainfall_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name VARCHAR(200) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 7: RAINFALL_OBSERVATIONS (Số liệu đo mưa theo thời gian)
CREATE TABLE IF NOT EXISTS rainfall_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES rainfall_stations(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    rainfall_mm NUMERIC(6, 2) NOT NULL CHECK (rainfall_mm >= 0),
    duration_minutes INTEGER DEFAULT 60 CHECK (duration_minutes > 0),
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- BẢNG 8: FLOOD_ALERTS (Các bản tin cảnh báo nguy cơ ngập)
CREATE TABLE IF NOT EXISTS flood_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flood_point_id UUID REFERENCES flood_points(id) ON DELETE CASCADE,
    administrative_area_id UUID REFERENCES administrative_areas(id) ON DELETE CASCADE,
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('RED', 'ORANGE', 'YELLOW')),
    title VARCHAR(250) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(30) NOT NULL DEFAULT 'RAINFALL_THRESHOLD' CHECK (alert_type IN ('RAINFALL_THRESHOLD', 'URGENT', 'ADVISORY', 'DEMO')),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'DRAFT', 'REVOKED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 3. CHỈ MỤC TỐI ƯU HÓA KHÔNG GIAN VÀ TRUY VẤN (INDEXES)
-- ==============================================================================

-- Chỉ mục không gian GiST (Generalized Search Tree) - Yếu tố cốt lõi của WebGIS
CREATE INDEX IF NOT EXISTS idx_flood_points_location ON flood_points USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_administrative_areas_boundary ON administrative_areas USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_rainfall_stations_location ON rainfall_stations USING GIST (location);

-- Chỉ mục quan hệ B-Tree tăng tốc độ tìm kiếm và lọc
CREATE INDEX IF NOT EXISTS idx_flood_points_risk_level ON flood_points(risk_level);
CREATE INDEX IF NOT EXISTS idx_flood_points_area_id ON flood_points(administrative_area_id);
CREATE INDEX IF NOT EXISTS idx_flood_points_is_demo ON flood_points(is_demo);
CREATE INDEX IF NOT EXISTS idx_flood_observations_point_id ON flood_observations(flood_point_id);
CREATE INDEX IF NOT EXISTS idx_flood_observations_observed_at ON flood_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_flood_alerts_active ON flood_alerts(expires_at DESC) WHERE verification_status = 'VERIFIED';

-- ==============================================================================
-- 4. HÀM VÀ TRIGGER TÍNH ĐIỂM NGUY CƠ NGUY CƠ (RISK SCORE) TỰ ĐỘNG
-- Công thức chuẩn hóa: RiskScore = 0.40 * Frequency + 0.35 * Depth + 0.25 * Duration
-- ==============================================================================

CREATE OR REPLACE FUNCTION fn_calculate_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Tính điểm tổng hợp (0 - 100)
    NEW.risk_score := ROUND((0.40 * COALESCE(NEW.frequency_score, 0) + 
                             0.35 * COALESCE(NEW.depth_score, 0) + 
                             0.25 * COALESCE(NEW.duration_score, 0))::NUMERIC, 2);

    -- Tự động phân cấp nếu không có chỉ định đặc biệt
    IF NEW.risk_score >= 70 THEN
        NEW.risk_level := 'HIGH';
    ELSIF NEW.risk_score >= 40 THEN
        NEW.risk_level := 'MEDIUM';
    ELSIF NEW.risk_score > 0 THEN
        NEW.risk_level := 'LOW';
    ELSE
        NEW.risk_level := 'UNKNOWN';
    END IF;

    NEW.updated_at := TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_risk_level ON flood_points;
CREATE TRIGGER trg_calculate_risk_level
BEFORE INSERT OR UPDATE OF frequency_score, depth_score, duration_score ON flood_points
FOR EACH ROW EXECUTE FUNCTION fn_calculate_risk_level();

-- ==============================================================================
-- 5. THIẾT LẬP CHÍNH SÁCH BẢO VỆ DÒNG (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flood_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE flood_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrative_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rainfall_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rainfall_observations ENABLE ROW LEVEL SECURITY;

-- Chính sách 1: Mọi người (Public Guest) được phép đọc dữ liệu công khai
CREATE POLICY "Public Read Flood Points" ON flood_points FOR SELECT USING (true);
CREATE POLICY "Public Read Areas" ON administrative_areas FOR SELECT USING (true);
CREATE POLICY "Public Read Data Sources" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Public Read Observations" ON flood_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Rainfall Stations" ON rainfall_stations FOR SELECT USING (true);
CREATE POLICY "Public Read Rainfall Observations" ON rainfall_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Active Alerts" ON flood_alerts FOR SELECT USING (expires_at > TIMEZONE('utc', NOW()));

-- Chính sách 2: Profiles chỉ người dùng chính chủ hoặc admin đọc/sửa
CREATE POLICY "Users Read Own Profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chính sách 3: Quản trị viên (Admin) toàn quyền Thêm / Sửa / Xóa dữ liệu điểm ngập & cảnh báo
CREATE POLICY "Admin Full Access Flood Points" ON flood_points 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin Full Access Alerts" ON flood_alerts 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin Full Access Observations" ON flood_observations 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
