# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS - SOFTWARE REQUIREMENTS SPECIFICATION)
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. GIỚI THIỆU & MỤC TIÊU HỆ THỐNG
Tài liệu này xác định đầy đủ các yêu cầu chức năng (FR) và phi chức năng (NFR) cho hệ thống **Hanoi FloodWatch GIS** - Nền tảng WebGIS theo dõi, tra cứu và cảnh báo nguy cơ ngập úng đô thị tại thủ đô Hà Nội.

### 1.1. Phạm vi Địa lý
- Khu vực trọng tâm nghiên cứu: Địa bàn thủ đô Hà Nội, ưu tiên khảo sát chi tiết các quận có mật độ đô thị hóa cao và thường xuyên xuất hiện điểm ngập cục bộ: **Cầu Giấy, Thanh Xuân, Hà Đông, Đống Đa, Hoàng Mai, Nam Từ Liêm, Tây Hồ**.
- Toàn bộ vị trí địa lý được lưu trữ dưới hệ quy chiếu không gian chuẩn quốc tế **WGS 84 (EPSG:4326)**.

### 1.2. Phân loại Dữ liệu Nghiêm ngặt
Hệ thống phân định rạch ròi giữa các nhóm dữ liệu:
1. **Dữ liệu Nguy cơ Lịch sử (Historical Risk Data):** Mức độ nhạy cảm và nguy cơ ngập của một địa điểm dựa trên tần suất, độ sâu và thời gian ngập được thống kê qua các đợt mưa bão trước đây.
2. **Dữ liệu Ghi nhận Hiện trường (Observation Data):** Số liệu đo đạc thực tế hoặc phản ánh cụ thể tại một mốc thời gian xác định (có thông tin người/nguồn báo cáo và trạng thái xác minh).
3. **Dữ liệu Quan trắc Khí tượng (Rainfall Data):** Lượng mưa đo được từ các trạm đo mưa chuyên dụng (tính theo mm/h).
4. **Dữ liệu Cảnh báo (Alerts):** Cảnh báo được ban hành bởi quản trị viên hoặc sinh ra theo quy tắc ngưỡng kích hoạt tự động.
5. **Dữ liệu Mô phỏng (Demo / Simulated Data):** Dữ liệu giả lập phục vụ kiểm thử tính năng phải được gắn cờ `is_demo: true` và hiển thị nhãn **[DEMO]** rõ ràng trên giao diện, tuyệt đối không gây hiểu nhầm cho người dân.

---

## 2. CÁC TÁC NHÂN HỆ THỐNG (ACTORS)
1. **Người dùng công cộng (Public User - Guest/Citizen):**
   - Người dân, người tham gia giao thông cần theo dõi tình hình ngập úng, tìm lộ trình an toàn hoặc tra cứu các điểm có nguy cơ ngập quanh vị trí của mình.
   - Không cần đăng nhập vẫn sử dụng được toàn bộ tính năng tra cứu công khai.
2. **Quản trị viên hệ thống (Administrator):**
   - Cán bộ kỹ thuật/vận hành hệ thống có tài khoản xác thực qua Supabase Auth.
   - Quyền hạn: Thêm, sửa, xóa, duyệt điểm ngập, nhập dữ liệu đo mưa, phát hành/hủy bỏ cảnh báo, cấu hình ngưỡng nguy cơ.

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1. Phân hệ WebGIS & Bản đồ Tương tác
- **FR-01: Hiển thị Bản đồ Nền & Điểm Nguy cơ:**
  - Hiển thị bản đồ OpenStreetMap mượt mà, hỗ trợ zoom, pan, hiển thị thanh tỷ lệ (scale).
  - Tải và biểu diễn các điểm ngập dưới dạng Marker trực quan, phân màu chuẩn mực:
    - 🔴 **Đỏ (Cao - High Risk):** Ngập sâu > 40cm hoặc thường xuyên gây tê liệt giao thông.
    - 🟠 **Cam (Trung bình - Medium Risk):** Ngập từ 20cm – 40cm, phương tiện di chuyển khó khăn.
    - 🟢 **Xanh lá (Thấp - Low Risk):** Ngập nhẹ < 20cm, nước rút nhanh (< 30 phút).
    - ⚪ **Xám (Chưa xác minh / Thiếu dữ liệu):** Điểm mới phản ánh, chưa đủ thông tin lịch sử.
- **FR-02: Popup & Xem Chi tiết Điểm ngập:**
  - Click vào Marker mở Popup tóm tắt: Tên điểm, địa chỉ, mức nguy cơ, độ sâu ngập lịch sử, thời gian rút nước trung bình.
  - Nút "Xem chi tiết" dẫn đến trang hồ sơ toàn diện của điểm ngập (gồm lịch sử quan trắc và ảnh hiện trường nếu có).
- **FR-03: Quản lý Lớp bản đồ (Layer Controls):**
  - Cho phép người dùng bật/tắt các lớp: Lớp điểm ngập theo mức nguy cơ, Lớp ranh giới hành chính quận/huyện, Lớp trạm đo mưa.
- **FR-04: Phân tích Không gian - Truy vấn theo Bán kính (Spatial Buffer Query):**
  - Người dùng có thể click chọn 1 tọa độ bất kỳ trên bản đồ (hoặc sử dụng Geolocation GPS của thiết bị).
  - Chọn bán kính quét: `500m`, `1km`, `2km`, `3km`, `5km`.
  - Bản đồ vẽ đường tròn bán kính trực quan (GeoJSON Circle).
  - Backend sử dụng hàm PostGIS `ST_DWithin` và `ST_Distance` để trả về danh sách các điểm ngập nằm trong phạm vi, sắp xếp theo khoảng cách từ gần đến xa kèm khoảng cách thực tế (mét/km).
- **FR-05: Phân tích Không gian - Tìm điểm nguy cơ gần nhất (Nearest Neighbor Query):**
  - Nhập tọa độ hoặc chọn vị trí, hệ thống tìm Top N điểm ngập gần nhất bằng toán tử không gian `<->` của PostGIS.

### 3.2. Phân hệ Tra cứu & Dashboard Thống kê
- **FR-06: Tìm kiếm & Lọc Đa tiêu chí:**
  - Tìm kiếm theo tên đường, tên điểm, tên phường/quận.
  - Lọc điểm ngập theo Quận/Huyện, theo Cấp độ nguy cơ (Cao/TB/Thấp), theo Nguồn dữ liệu.
- **FR-07: Dashboard Tổng quan Giám sát:**
  - Hiển thị thẻ chỉ số: Tổng số điểm đen ngập úng, số điểm nguy cơ cao/trung bình/thấp, số cảnh báo đang kích hoạt.
  - Biểu đồ phân bố nguy cơ ngập theo từng quận (Cầu Giấy, Thanh Xuân, Hà Đông...) bằng Recharts.
  - Danh sách các cảnh báo khẩn cấp mới nhất.

### 3.3. Phân hệ Cảnh báo & Đánh giá Nguy cơ
- **FR-08: Mô hình Đánh giá Điểm Nguy cơ (Risk Score Model):**
  - Tính toán chỉ số nguy cơ tổng hợp chuẩn hóa trên thang điểm 0 – 100:
    $$\text{RiskScore} = 0.40 \times \text{FrequencyScore} + 0.35 \times \text{DepthScore} + 0.25 \times \text{DurationScore}$$
  - Phân loại ngưỡng:
    - $\ge 70$: Nguy cơ Cao (High)
    - $40 - 69$: Nguy cơ Trung bình (Medium)
    - $< 40$: Nguy cơ Thấp (Low)
    - Thiếu số liệu: Ghi nhận trạng thái "Chưa đủ dữ liệu".
- **FR-09: Phát hành & Quản lý Cảnh báo (Alerts Management):**
  - Quản trị viên tạo và ban hành cảnh báo cho từng điểm ngập hoặc khu vực: Mức cảnh báo, nội dung khuyến cáo, thời gian hiệu lực, nguồn phát hành.
  - Hệ thống tự động thu hồi/hết hạn cảnh báo khi quá thời gian `expires_at`.

### 3.4. Phân hệ Quản trị & Nhập/Xuất Dữ liệu
- **FR-10: Xác thực Quản trị viên (Authentication):**
  - Đăng nhập bảo mật qua Supabase Auth (Email & Password), cấp phát JWT token có chữ ký số.
  - Quản lý phiên đăng nhập và tự động đăng xuất khi hết hạn.
- **FR-11: Quản lý Điểm ngập (CRUD):**
  - Admin thêm điểm mới: Nhập tên, địa chỉ, chọn tọa độ trực tiếp bằng thao tác click trên bản đồ (Reverse-pinpoint), nhập số liệu lịch sử.
  - Chỉnh sửa thông tin, cập nhật mức nguy cơ, xóa điểm ngập (có hộp thoại cảnh báo xác nhận).
- **FR-12: Nhập/Xuất Dữ liệu Chuẩn GIS (GeoJSON / Shapefile):**
  - Xuất toàn bộ dữ liệu điểm ngập ra định dạng chuẩn `GeoJSON FeatureCollection` để sử dụng trong QGIS hoặc các phần mềm GIS khác.
  - Nhập dữ liệu không gian từ file GeoJSON chuẩn.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1. Hiệu năng & Khả năng Đáp ứng (Performance)
- **NFR-01 (Thời gian phản hồi):** Tốc độ phản hồi API truy vấn không gian (`ST_DWithin`, `ST_Distance`) trên tập 100+ điểm ngập < 300ms.
- **NFR-02 (Tối ưu tải bản đồ):** Dữ liệu Vector GeoJSON được nén và cache hợp lý, thời gian tải trang bản đồ ban đầu < 2.5 giây.
- **NFR-03 (Chỉ mục không gian):** Bắt buộc đánh chỉ mục `GiST (Generalized Search Tree)` trên toàn bộ cột tọa độ `location` kiểu `geometry(Point, 4326)`.

### 4.2. Bảo mật & Toàn vẹn Dữ liệu (Security)
- **NFR-04 (Mã hóa đường truyền):** 100% giao tiếp qua Internet trên Production bắt buộc sử dụng giao thức HTTPS/TLS.
- **NFR-05 (Bảo vệ Khóa bí mật):** Không lưu mật khẩu, Service Role Key, Database Password trong source code client hoặc commit lên Git.
- **NFR-06 (Kiểm soát truy cập - RLS):** Sử dụng Row Level Security trên PostgreSQL để ngăn chặn người dùng công cộng sửa/xóa dữ liệu trái phép.
- **NFR-07 (Chống tấn công Web):** Backend sử dụng Zod để validate input, bảo vệ chống SQL Injection (truy vấn tham số hóa 100%), CORS giới hạn tên miền, Rate Limiting chống spam request.

### 4.3. Tính Khả dụng & Trải nghiệm Người dùng (Usability & Accessibility)
- **NFR-08 (Giao diện Tiếng Việt):** 100% nhãn, thông báo, đơn vị đo (cm, mét, km, mm/h) và chú thích bằng Tiếng Việt chuẩn mực.
- **NFR-09 (Responsive):** Tương thích hoàn hảo từ màn hình máy tính (1920x1080, 1366x768) đến máy tính bảng và điện thoại di động (iPhone, Android).
