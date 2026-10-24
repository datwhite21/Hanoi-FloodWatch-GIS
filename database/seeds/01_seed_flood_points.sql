-- ==============================================================================
-- HANOI FLOODWATCH GIS - SEED DATA SCRIPT
-- File: database/seeds/01_seed_flood_points.sql
-- Nạp dữ liệu 27 điểm ngập thực tế Hà Nội + Ranh giới quận + Quan trắc + Cảnh báo
-- ==============================================================================

-- 1. NẠP NGUỒN DỮ LIỆU CHÍNH THỨC (DATA SOURCES)
INSERT INTO data_sources (id, source_name, source_url, license, description)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Công ty TNHH MTV Thoát nước Hà Nội (HSDC)', 'http://thoatnuochanoi.vn', 'Public Report', 'Báo cáo kế hoạch thoát nước và danh mục các điểm đen ngập úng mùa mưa bão năm 2024'),
    ('22222222-2222-2222-2222-222222222222', 'Cổng Thông tin Điện tử UBND TP Hà Nội', 'https://hanoi.gov.vn', 'Official Government', 'Các thông báo điều hành phân luồng chống ngập trong bão số 3 (Yagi) năm 2024'),
    ('33333333-3333-3333-3333-333333333333', 'Đài Khí tượng Thủy văn Khu vực Đồng bằng Bắc Bộ', 'http://kttv.gov.vn', 'Open Meteorological Data', 'Dữ liệu đo mưa tự động từ hệ thống trạm quan trắc nội đô')
ON CONFLICT (id) DO NOTHING;

-- 2. NẠP CÁC QUẬN TRỌNG ĐIỂM (ADMINISTRATIVE AREAS)
INSERT INTO administrative_areas (id, name, administrative_code, boundary_source)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'Quận Cầu Giấy', 'Q-CG', 'Địa giới hành chính TP Hà Nội'),
    ('a2222222-2222-2222-2222-222222222222', 'Quận Thanh Xuân', 'Q-TX', 'Địa giới hành chính TP Hà Nội'),
    ('a3333333-3333-3333-3333-333333333333', 'Quận Hà Đông', 'Q-HD', 'Địa giới hành chính TP Hà Nội'),
    ('a4444444-4444-4444-4444-444444444444', 'Quận Đống Đa', 'Q-DD', 'Địa giới hành chính TP Hà Nội'),
    ('a5555555-5555-5555-5555-555555555555', 'Quận Nam Từ Liêm', 'Q-NTL', 'Địa giới hành chính TP Hà Nội'),
    ('a6666666-6666-6666-6666-666666666666', 'Quận Bắc Từ Liêm', 'Q-BTL', 'Địa giới hành chính TP Hà Nội'),
    ('a7777777-7777-7777-7777-777777777777', 'Quận Hoàng Mai', 'Q-HM', 'Địa giới hành chính TP Hà Nội'),
    ('a8888888-8888-8888-8888-888888888888', 'Quận Hai Bà Trưng', 'Q-HBT', 'Địa giới hành chính TP Hà Nội'),
    ('a9999999-9999-9999-9999-999999999999', 'Quận Tây Hồ', 'Q-TH', 'Địa giới hành chính TP Hà Nội')
ON CONFLICT (id) DO NOTHING;

-- 3. NẠP 27 ĐIỂM NGUY CƠ NGẬP THỰC TẾ TẠI HÀ NỘI
-- Sử dụng ST_SetSRID(ST_MakePoint(Kinh độ, Vĩ độ), 4326)
INSERT INTO flood_points (name, description, address, administrative_area_id, location, frequency_score, depth_score, duration_score, is_demo, data_source_id)
VALUES
    -- CẦU GIẤY
    ('Phố Hoa Bằng (Yên Hòa)', 'Vùng trũng cục bộ đê sông Tô Lịch, cống tiêu nhỏ, ngập sâu khi mưa dồn', 'Phố Hoa Bằng, Phường Yên Hòa, Cầu Giấy', 'a1111111-1111-1111-1111-111111111111', ST_SetSRID(ST_MakePoint(105.7942, 21.0268), 4326), 90, 85, 80, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Phan Văn Trường', 'Khu vực chợ Nhà Xanh, đường hẹp trũng thấp, rác thải dồn gây nghẽn hố ga', 'Phố Phan Văn Trường, Phường Dịch Vọng Hậu, Cầu Giấy', 'a1111111-1111-1111-1111-111111111111', ST_SetSRID(ST_MakePoint(105.7865, 21.0392), 4326), 85, 80, 75, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Ngã tư Dương Đình Nghệ - Nam Trung Yên', 'Điểm trũng trước tòa Keangnam, tiêu thoát chậm ra kênh Cầu Mới', 'Ngã tư Dương Đình Nghệ - Nam Trung Yên, Cầu Giấy', 'a1111111-1111-1111-1111-111111111111', ST_SetSRID(ST_MakePoint(105.7880, 21.0185), 4326), 85, 80, 80, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Trần Bình (Gần BV 19-8)', 'Đoạn từ cổng Bệnh viện 19-8 đến UBND phường Mai Dịch', 'Phố Trần Bình, Phường Mai Dịch, Cầu Giấy', 'a1111111-1111-1111-1111-111111111111', ST_SetSRID(ST_MakePoint(105.7765, 21.0345), 4326), 65, 60, 55, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Cầu Giấy (Đoạn Bưu điện)', 'Mặt đường trước Bưu điện Cầu Giấy và Khách sạn Cầu Giấy, rút sau 30-45 phút', 'Đường Cầu Giấy, Phường Quan Hoa, Cầu Giấy', 'a1111111-1111-1111-1111-111111111111', ST_SetSRID(ST_MakePoint(105.8005, 21.0335), 4326), 40, 35, 30, FALSE, '11111111-1111-1111-1111-111111111111'),

    -- THANH XUÂN
    ('Đường Nguyễn Trãi (Trước ĐH KHTN)', 'Trục huyết mạch, trũng chân cầu vượt cạn, nước dồn nhanh gây tê liệt', 'Đường Nguyễn Trãi, Phường Thượng Đình, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8115, 20.9965), 4326), 95, 90, 85, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Bùi Xương Trạch', 'Điểm trũng thấp nhất quận, khi mực nước sông Lừ dâng sẽ ngập tràn ngõ xóm', 'Phố Bùi Xương Trạch, Phường Khương Đình, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8198, 20.9882), 4326), 90, 95, 90, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Vương Thừa Vũ', 'Đoạn giữa phố cốt nền thấp hơn đường Trường Chinh, thoát nước chậm', 'Phố Vương Thừa Vũ, Phường Khương Trung, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8232, 20.9995), 4326), 60, 55, 50, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Nguyễn Tuân (Giao Nguyễn Huy Tưởng)', 'Mật độ chung cư dày đặc, hệ thống thoát nước cũ quá tải khi mưa lớn', 'Đường Nguyễn Tuân, Phường Thanh Xuân Trung, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8035, 21.0022), 4326), 65, 60, 55, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Quan Nhân', 'Khu dân cư trong ngõ hẻm trũng thấp, nước tiêu thoát ra sông Tô Lịch chậm', 'Phố Quan Nhân, Phường Nhân Chính, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8110, 21.0075), 4326), 55, 50, 45, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Ngã tư Lê Văn Lương - Hoàng Đạo Thúy', 'Ngập dồn mép đường và chân hầm khi mưa trên 70mm/h', 'Ngã tư Lê Văn Lương - Hoàng Đạo Thúy, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8015, 21.0065), 4326), 45, 40, 35, FALSE, '11111111-1111-1111-1111-111111111111'),

    -- HÀ ĐÔNG
    ('Đường Quang Trung (Ga La Khê)', 'Nút thắt trước Ga La Khê và Bưu điện Hà Đông, phụ thuộc trạm Yên Nghĩa', 'Đường Quang Trung, Phường Quang Trung, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7680, 20.9635), 4326), 85, 80, 80, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Ngã ba Ba La (Quốc lộ 6 - Phú Lãm)', 'Vùng trũng cửa ngõ phía Tây Nam, hạ tầng thoát nước dồn chậm', 'Ngã ba Ba La, Phường Phú Lãm, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7585, 20.9525), 4326), 90, 85, 85, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('KĐT Geleximco Lê Trọng Tấn', 'Các hầm chui dân sinh ngập sâu biến thành túi nước khi mưa lớn', 'Đường Lê Trọng Tấn, Phường Dương Nội, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7420, 20.9855), 4326), 95, 100, 95, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Tô Hiệu (Hà Đông)', 'Đoạn giao cắt Bà Triệu và chợ Hà Đông', 'Phố Tô Hiệu, Phường Nguyễn Trãi, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7785, 20.9702), 4326), 65, 60, 55, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Phùng Hưng (Cổng Viện K Tân Triều)', 'Trũng cục bộ trước cổng bệnh viện và khu dân cư Tân Triều', 'Đường Phùng Hưng, Phường Phúc La, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7925, 20.9680), 4326), 70, 65, 60, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Yên Nghĩa (Bến xe Yên Nghĩa)', 'Nước ngập mặt đường trước bến xe khoảng 30-40 phút khi mưa dồn', 'Đường Quốc lộ 6, Phường Yên Nghĩa, Hà Đông', 'a3333333-3333-3333-3333-333333333333', ST_SetSRID(ST_MakePoint(105.7485, 20.9500), 4326), 40, 35, 30, FALSE, '11111111-1111-1111-1111-111111111111'),

    -- ĐỐNG ĐA
    ('Phố Thái Hà (Rạp Chiếu phim QG)', 'Trục giao thông chính, nước dồn về từ các tuyến phố xung quanh', 'Phố Thái Hà, Phường Trung Liệt, Đống Đa', 'a4444444-4444-4444-4444-444444444444', ST_SetSRID(ST_MakePoint(105.8210, 21.0145), 4326), 85, 75, 70, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Nguyễn Khuyến (Trường Lý Thường Kiệt)', 'Điểm trũng cố hữu lâu năm của nội đô, cốt nền thấp hơn xung quanh gần 1m', 'Phố Nguyễn Khuyến, Phường Văn Miếu, Đống Đa', 'a4444444-4444-4444-4444-444444444444', ST_SetSRID(ST_MakePoint(105.8385, 21.0255), 4326), 90, 85, 80, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Ngã tư Huỳnh Thúc Kháng - Nguyên Hồng', 'Quá tải cục bộ khi mưa cường độ lớn trong thời gian ngắn', 'Ngã tư Huỳnh Thúc Kháng - Nguyên Hồng, Đống Đa', 'a4444444-4444-4444-4444-444444444444', ST_SetSRID(ST_MakePoint(105.8120, 21.0205), 4326), 60, 50, 45, FALSE, '11111111-1111-1111-1111-111111111111'),

    -- NAM TỪ LIÊM & BẮC TỪ LIÊM
    ('Hầm chui Đại lộ Thăng Long (Số 3, 5, 6)', 'Đáy hầm chui giao thông gom cao tốc trũng sâu, ngập sâu khi mưa to', 'Đại lộ Thăng Long, Phường Mễ Trì, Nam Từ Liêm', 'a5555555-5555-5555-5555-555555555555', ST_SetSRID(ST_MakePoint(105.7480, 20.9990), 4326), 95, 100, 95, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Đỗ Đức Dục (Cổng TT Hội nghị QG)', 'Đoạn ngã ba giao với đường Miếu Đầm, nước dồn mặt đường', 'Đường Đỗ Đức Dục, Phường Mễ Trì, Nam Từ Liêm', 'a5555555-5555-5555-5555-555555555555', ST_SetSRID(ST_MakePoint(105.7875, 21.0080), 4326), 60, 55, 50, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Phạm Văn Đồng (Chân cầu Mai Dịch)', 'Đoạn trước cổng Trường ĐH Ngoại ngữ - ĐHQGHN', 'Đường Phạm Văn Đồng, Phường Mai Dịch, Bắc Từ Liêm', 'a6666666-6666-6666-6666-666666666666', ST_SetSRID(ST_MakePoint(105.7780, 21.0415), 4326), 65, 60, 55, FALSE, '11111111-1111-1111-1111-111111111111'),

    -- HOÀNG MAI, HAI BÀ TRƯNG, TÂY HỒ
    ('Phố Định Công (Gần nút rẽ Giải Phóng)', 'Tuyến đường hẹp cạnh đường sắt, trũng nước tiêu thoát chậm', 'Phố Định Công, Phường Định Công, Hoàng Mai', 'a7777777-7777-7777-7777-777777777777', ST_SetSRID(ST_MakePoint(105.8410, 20.9820), 4326), 85, 80, 80, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Đường Tân Mai (Đối diện hồ Đền Lừ)', 'Nước dồn tràn mặt đường khi hồ Đền Lừ đầy nước', 'Đường Tân Mai, Phường Hoàng Văn Thụ, Hoàng Mai', 'a7777777-7777-7777-7777-777777777777', ST_SetSRID(ST_MakePoint(105.8540, 20.9860), 4326), 60, 55, 50, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Minh Khai (Chân cầu Vĩnh Tuy)', 'Chân dốc cầu vượt và ngã ba rẽ Tam Trinh', 'Phố Minh Khai, Phường Vĩnh Tuy, Hai Bà Trưng', 'a8888888-8888-8888-8888-888888888888', ST_SetSRID(ST_MakePoint(105.8670, 20.9985), 4326), 65, 60, 55, FALSE, '11111111-1111-1111-1111-111111111111'),
    ('Phố Thụy Khuê (Dốc La Pho)', 'Điểm trũng chân dốc từ đường Hoàng Hoa Thám dốc xuống', 'Phố Thụy Khuê, Phường Thụy Khuê, Tây Hồ', 'a9999999-9999-9999-9999-999999999999', ST_SetSRID(ST_MakePoint(105.8270, 21.0425), 4326), 65, 60, 50, FALSE, '11111111-1111-1111-1111-111111111111');

-- 4. NẠP 3 ĐIỂM KỊCH BẢN MÔ PHỎNG KIỂM THỬ (DEMO SCENARIOS)
INSERT INTO flood_points (name, description, address, administrative_area_id, location, frequency_score, depth_score, duration_score, is_demo, data_source_id)
VALUES
    ('[DEMO] Hầm chui Mễ Trì - Kịch bản mưa cực đoan 180mm', 'Dữ liệu mô phỏng tình huống khẩn cấp bão số 3 gây ngập 80cm đáy hầm', 'Hầm chui Mễ Trì, Đại lộ Thăng Long, Nam Từ Liêm', 'a5555555-5555-5555-5555-555555555555', ST_SetSRID(ST_MakePoint(105.7790, 21.0050), 4326), 100, 100, 100, TRUE, '11111111-1111-1111-1111-111111111111'),
    ('[DEMO] Ngã tư Khuất Duy Tiến - Nguyễn Trãi', 'Dữ liệu mô phỏng tình huống ùn ứ nước mưa rào đầu mùa 70mm', 'Nút giao 4 tầng Thanh Xuân, Thanh Xuân', 'a2222222-2222-2222-2222-222222222222', ST_SetSRID(ST_MakePoint(105.8010, 20.9920), 4326), 75, 70, 65, TRUE, '11111111-1111-1111-1111-111111111111'),
    ('[DEMO] Cầu Tó - Nước sông Tô Lịch dâng', 'Dữ liệu mô phỏng triều dâng kết hợp xả lũ ngập 45cm', 'Khu vực Cầu Tó, Đường Kim Giang, Thanh Trì', 'a7777777-7777-7777-7777-777777777777', ST_SetSRID(ST_MakePoint(105.8150, 20.9570), 4326), 80, 75, 70, TRUE, '11111111-1111-1111-1111-111111111111');

-- 5. NẠP LỊCH SỬ QUAN TRẮC MẪU (OBSERVATIONS) CHO CÁC ĐIỂM CHÍNH
INSERT INTO flood_observations (flood_point_id, observed_at, water_depth_cm, duration_minutes, flood_status, notes)
SELECT id, '2024-09-08 08:30:00+07', 48.0, 120, 'RECEDED', 'Ghi nhận ngập sâu trong bão số 3 (Yagi), giao thông tê liệt'
FROM flood_points WHERE name LIKE '%Hoa Bằng%'
LIMIT 1;

INSERT INTO flood_observations (flood_point_id, observed_at, water_depth_cm, duration_minutes, flood_status, notes)
SELECT id, '2024-09-08 09:15:00+07', 52.0, 150, 'RECEDED', 'Nước dồn tràn qua mặt đường Nguyễn Trãi, nhiều ô tô chết máy'
FROM flood_points WHERE name LIKE '%Nguyễn Trãi%'
LIMIT 1;

INSERT INTO flood_observations (flood_point_id, observed_at, water_depth_cm, duration_minutes, flood_status, notes)
SELECT id, '2024-09-08 10:00:00+07', 65.0, 180, 'RECEDED', 'Hầm chui Geleximco ngập sâu, lực lượng chức năng phong tỏa hầm'
FROM flood_points WHERE name LIKE '%Geleximco%'
LIMIT 1;

-- 6. NẠP 3 TRẠM ĐO MƯA KHÍ TƯỢNG (RAINFALL STATIONS)
INSERT INTO rainfall_stations (station_name, location, data_source_id)
VALUES
    ('Trạm Khí tượng Cầu Giấy (Trần Thái Tông)', ST_SetSRID(ST_MakePoint(105.7895, 21.0315), 4326), '33333333-3333-3333-3333-333333333333'),
    ('Trạm Khí tượng Thanh Xuân (Nguyễn Quý Đức)', ST_SetSRID(ST_MakePoint(105.7995, 20.9950), 4326), '33333333-3333-3333-3333-333333333333'),
    ('Trạm Khí tượng Hà Đông (Bà Triệu)', ST_SetSRID(ST_MakePoint(105.7750, 20.9715), 4326), '33333333-3333-3333-3333-333333333333');

-- 7. NẠP CẢNH BÁO MẪU ĐANG CÓ HIỆU LỰC (FLOOD ALERTS)
INSERT INTO flood_alerts (alert_level, title, message, alert_type, verification_status, started_at, expires_at)
VALUES
    ('RED', 'CẢNH BÁO NGUY HIỂM: Ngập sâu trên 50cm trục đường Nguyễn Trãi', 'Trục đường Nguyễn Trãi (đoạn cổng ĐH KHTN) đang ngập sâu 40-55cm. Khuyến cáo các phương tiện xe máy và ô tô con chuyển hướng lưu thông qua đường Lê Văn Lương.', 'URGENT', 'VERIFIED', NOW(), NOW() + INTERVAL '4 hours'),
    ('ORANGE', 'CẢNH BÁO: Ngập cục bộ 30-40cm phố Hoa Bằng và Phan Văn Trường', 'Khu vực Cầu Giấy xuất hiện ngập dồn tại Hoa Bằng và Phan Văn Trường. Người dân hạn chế di chuyển vào ngõ trũng.', 'RAINFALL_THRESHOLD', 'VERIFIED', NOW(), NOW() + INTERVAL '3 hours'),
    ('YELLOW', 'KHUYẾN CÁO: Nước dồn chậm tại ngã ba Ba La (Hà Đông)', 'Giao thông di chuyển chậm do nước ngập 20cm mép đường QL6. Dự kiến nước rút sau 45 phút.', 'ADVISORY', 'VERIFIED', NOW(), NOW() + INTERVAL '2 hours');
