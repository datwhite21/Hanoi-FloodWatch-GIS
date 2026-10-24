# THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGIS (DATABASE SCHEMA)
*Chi tiết đầy đủ: xem tại [docs/DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/docs/DATABASE_SCHEMA.md)*

## CÁC BẢNG DỮ LIỆU CHÍNH TRÊN SUPABASE POSTGRESQL + POSTGIS
- `profiles`: Hồ sơ người dùng liên kết với Supabase Auth (`role`: admin | user).
- `administrative_areas`: Ranh giới hành chính các quận/huyện (`boundary`: geometry(MultiPolygon, 4326)).
- `data_sources`: Nguồn dữ liệu kiểm chứng và bản quyền.
- `flood_points`: Danh mục điểm nguy cơ ngập (`location`: geometry(Point, 4326), `risk_level`, `risk_score`, GiST Index).
- `flood_observations`: Lịch sử quan trắc độ sâu ngập (cm), thời gian ngập (phút).
- `rainfall_stations`: Danh mục trạm đo mưa khí tượng.
- `rainfall_observations`: Lịch sử đo mưa (mm).
- `flood_alerts`: Quản lý các bản tin cảnh báo ngập úng.
