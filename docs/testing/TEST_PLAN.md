# KẾ HOẠCH KIỂM THỬ HỆ THỐNG TOÀN DIỆN (TEST PLAN)
## DỰ ÁN: HỆ THỐNG WEBGIS THEO DÕI VÀ CẢNH BÁO NGUY CƠ NGẬP ÚNG HÀ NỘI (HANOI FLOODWATCH GIS)

---

### 1. TỔNG QUAN & MỤC TIÊU KIỂM THỬ

Tài liệu này xác định mục tiêu, phạm vi, chiến lược, môi trường và các ca kiểm thử (Test Cases) nhằm đảm bảo hệ thống WebGIS đạt chuẩn chất lượng cao nhất trước khi triển khai công khai lên môi trường Internet (Giai đoạn 7) và bảo vệ đồ án chuyên ngành CNTT (Giai đoạn 8).

#### Mục tiêu chính:
1. **Kiểm thử GIS & Thuật toán Không gian:** Xác minh tính chính xác của các phép toán hình học và trắc địa cầu (`ST_DWithin`, `ST_Distance`, Haversine) trên hệ tọa độ thực tế WGS84 (EPSG:4326) của Hà Nội.
2. **Kiểm thử Bảo mật & Rào chắn Dữ liệu:** Xác thực cơ chế phân quyền JWT (Supabase Auth), ngăn chặn tấn công SQL Injection, Cross-Site Scripting (XSS), và rào chắn dữ liệu đầu vào bằng Zod Schema.
3. **Kiểm thử Chuẩn tương thích Dữ liệu GIS:** Kiểm tra tính tuân thủ đặc tả GeoJSON chuẩn quốc tế (IETF RFC 7946).
4. **Kiểm thử Giao diện & Trải nghiệm Người dùng (UI/UX):** Đánh giá tính tương tác bản đồ Leaflet, hiển thị màu sắc theo cấp báo động, responsive trên máy tính, máy tính bảng và điện thoại di động.
5. **Đo lường Hiệu năng (Performance):** Đảm bảo thời gian phản hồi của các truy vấn không gian phức tạp đạt dưới 500ms.

---

### 2. MÔI TRƯỜNG & CÔNG CỤ THỰC HIỆN KIỂM THỬ

| Hạng mục | Thông số kỹ thuật | Ghi chú |
| :--- | :--- | :--- |
| **Hệ điều hành kiểm thử** | Windows 10/11 64-bit | Môi trường máy trạm lập trình |
| **Runtime Môi trường** | Node.js v24.22.1 LTS, npm 11.19.1 | Tận dụng native fetch & `--env-file` |
| **Cơ sở dữ liệu** | PostgreSQL 15.x + PostGIS 3.x trên Supabase Cloud | Region: Singapore (ap-southeast-1) |
| **Khung kiểm thử tự động** | Vitest 3.x + Supertest 7.x | Chạy kiểm thử tự động API Backend |
| **Script QA kiểm thử sâu** | `database/scripts/test_quality_assurance.js` | Đo lường độ chính xác GIS & An toàn |
| **Script E2E toàn trình** | `database/scripts/test_integration.js` | Kiểm thử luồng dữ liệu CRUD 3 tầng |
| **Trình duyệt kiểm thử** | Chrome / Edge (Chromium based), Mobile Responsive Mode | Độ phân giải: 1920x1080, 768x1024, 375x812 |

---

### 3. MA TRẬN PHÂN LOẠI & DANH SÁCH CA KIỂM THỬ (TEST MATRIX)

#### 3.1. Nhóm 1: Kiểm thử Độ chính xác Không gian GIS (Spatial GIS Testing)
- **TC-GIS-01:** Kiểm tra tính năng truy vấn bán kính `GET /api/spatial/nearby` với cự ly 1.000m tại điểm ngập thực tế Hầm chui Mễ Trì (21.005, 105.779).
- **TC-GIS-02:** Xác thực cự ly mét tại chính xác tọa độ tâm truy vấn bằng 0 mét.
- **TC-GIS-03:** Kiểm tra tính đơn điệu tăng dần của mảng kết quả trả về (`distance_meters` tăng dần).
- **TC-GIS-04:** Kiểm tra tính mở rộng bao trùm bán kính: Quét 3.000m phải chứa tập hợp con của bán kính 1.000m.
- **TC-GIS-05:** Kiểm tra thuật toán tìm Top N điểm nguy cơ gần nhất sử dụng toán tử khoảng cách PostGIS `<->`.
- **TC-GIS-06:** Kiểm tra trích xuất chính xác tọa độ [latitude, longitude] từ cột PostGIS geography/geometry của CSDL Supabase.

#### 3.2. Nhóm 2: Kiểm thử Bảo mật & Rào chắn Dữ liệu (Security & Validation)
- **TC-SEC-01:** Thử nghiệm chèn chuỗi SQL Injection độc hại (`' OR '1'='1' --`) vào tham số tìm kiếm. Hệ thống không sinh lỗi SQL Syntax và không rò rỉ dữ liệu.
- **TC-SEC-02:** Thử nghiệm chèn chuỗi mã lệnh XSS (`<script>alert("XSS")</script>`) vào tham số tìm kiếm và địa chỉ.
- **TC-SEC-03:** Kiểm tra rào chắn Zod Validation khi vĩ độ (latitude) vượt quá giới hạn hợp lệ `[-90, 90]` (Ví dụ: `lat=195.5`). Phải trả về mã `400 Bad Request`.
- **TC-SEC-04:** Kiểm tra rào chắn Zod Validation khi bán kính tìm kiếm (radius) mang giá trị âm hoặc nhỏ hơn 100m. Phải trả về mã `400 Bad Request`.
- **TC-SEC-05:** Kiểm tra phân quyền: Yêu cầu thêm điểm ngập mới `POST /api/flood-points` khi không có Bearer Token. Phải trả về mã `401 Unauthorized`.
- **TC-SEC-06:** Kiểm tra phân quyền: Yêu cầu thêm điểm ngập với Token giả mạo hoặc hết hạn. Phải trả về mã `401 Unauthorized`.
- **TC-SEC-07:** Kiểm tra Rate Limiting: Hạn chế tần suất gọi API công cộng và API nhạy cảm nhằm chống tấn công DoS/Brute Force.

#### 3.3. Nhóm 3: Kiểm thử Chuẩn xuất bản dữ liệu GeoJSON (RFC 7946 Standard)
- **TC-GEO-01:** Kiểm tra API xuất dữ liệu `GET /api/export/geojson` trả về mã trạng thái 200 OK.
- **TC-GEO-02:** Kiểm tra thuộc tính gốc `type` có giá trị là `"FeatureCollection"`.
- **TC-GEO-03:** Kiểm tra số lượng phần tử trong mảng `features` chứa đủ 30 điểm ngập (27 thực tế + 3 mô phỏng).
- **TC-GEO-04:** Kiểm tra cấu trúc mỗi phần tử: `type: "Feature"`, `geometry.type: "Point"`.
- **TC-GEO-05:** Kiểm tra trật tự mảng tọa độ `geometry.coordinates`: Đúng thứ tự chuẩn GIS RFC 7946 là `[Kinh độ (Longitude), Vĩ độ (Latitude)]`.
- **TC-GEO-06:** Kiểm tra phạm vi tọa độ thực nghiệm: Kinh độ nằm trong khoảng `[105.6, 106.0]`, Vĩ độ nằm trong khoảng `[20.9, 21.2]` thuộc địa giới hành chính Hà Nội.
- **TC-GEO-07:** Kiểm tra thuộc tính nghiệp vụ `properties`: Chứa đầy đủ `name`, `address`, `risk_level`, `risk_score`, `is_demo`.

#### 3.4. Nhóm 4: Kiểm thử Tích hợp Toàn trình & CRUD (End-to-End Integration)
- **TC-E2E-01:** Thêm mới điểm ngập từ Admin ➔ Kiểm tra lưu thành công vào PostgreSQL Supabase ➔ Trigger CSDL tự động tính toán `risk_score` và `risk_level`.
- **TC-E2E-02:** Điểm ngập vừa tạo xuất hiện ngay lập tức trong kết quả tìm kiếm Backend API và hiển thị trên bản đồ công khai.
- **TC-E2E-03:** Dọn dẹp bản ghi kiểm thử thành công, trả CSDL về trạng thái sạch ban đầu.
- **TC-E2E-04:** Kiểm tra chuyển tiếp thông suốt qua Vite Reverse Proxy (`/api` ➔ `http://localhost:5000/api`).

#### 3.5. Nhóm 5: Kiểm thử Hiệu năng & Khả năng chịu tải (Performance Benchmark)
- **TC-PERF-01:** Đo thời gian phản hồi trung bình qua 5 vòng truy vấn không gian GIS liên tiếp. Yêu cầu: Thời gian trung bình < 500ms.
- **TC-PERF-02:** Kiểm tra kích thước gói tin phản hồi JSON và mức độ tiêu thụ bộ nhớ RAM của tiến trình Node.js Backend (< 150MB).

---

### 4. TIÊU CHÍ NGHIỆM THU ĐẠT CHUẨN (ACCEPTANCE CRITERIA)

1. **Tỷ lệ vượt qua kiểm thử:** Đạt **100%** các ca kiểm thử mức Độ nghiêm trọng Cao (Blocker / Critical / Major).
2. **Không tồn tại lỗi suy diễn:** Không có cảnh báo hoặc lỗi biên dịch TypeScript (`tsc --noEmit` đạt 0 lỗi ở cả backend và frontend).
3. **An toàn bảo mật:** Tất cả các truy vấn có tham số người dùng phải được parameterized; mọi API thao tác dữ liệu đều bắt buộc xác thực token JWT.
4. **Hồ sơ nghiệm thu:** Phải có file biên bản kết quả kiểm thử `docs/testing/TEST_RESULTS.md` chi tiết để đính kèm vào hồ sơ đồ án.
