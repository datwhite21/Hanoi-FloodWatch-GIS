-- ==============================================================================
-- VIETNAM FLOODWATCH GIS - POSTGIS MIGRATION 03: ROLLBACK SCRIPT
-- Script hoàn nguyên an toàn nếu cần quay về cấu trúc CSDL trước migration 03
-- ==============================================================================

-- 1. Xóa ràng buộc duy nhất uq_rainfall_station_observed_at
ALTER TABLE IF EXISTS rainfall_observations 
DROP CONSTRAINT IF EXISTS uq_rainfall_station_observed_at;

-- 2. Xóa các cột metadata đã thêm vào rainfall_observations
ALTER TABLE IF EXISTS rainfall_observations DROP COLUMN IF EXISTS valid_at;
ALTER TABLE IF EXISTS rainfall_observations DROP COLUMN IF EXISTS fetched_at;
ALTER TABLE IF EXISTS rainfall_observations DROP COLUMN IF EXISTS quality_status;

-- 3. Xóa bảng ingestion_logs (nếu cần hoàn nguyên hoàn toàn)
DROP TABLE IF EXISTS ingestion_logs CASCADE;

-- 4. Xóa bảng citizen_reports (Lưu ý: Chỉ chạy khi thực sự muốn rollback bảng báo cáo cộng đồng)
-- DROP TABLE IF EXISTS citizen_reports CASCADE;
