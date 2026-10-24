# HƯỚNG DẪN THIẾT LẬP SUPABASE CLOUD & POSTGIS (SUPABASE SETUP GUIDE)
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. GIỚI THIỆU
Hệ thống **Hanoi FloodWatch GIS** sử dụng CSDL đám mây **Supabase Managed PostgreSQL 15+** với phần mở rộng không gian **PostGIS 3.x**. 

Gói miễn phí (Free Tier) của Supabase cung cấp:
- 500 MB dung lượng Database (dự án của chúng ta với hàng nghìn điểm ngập chỉ tốn < 20 MB).
- Bật sẵn tiện ích không gian PostGIS mạnh mẽ nhất thế giới.
- Dịch vụ xác thực người dùng tích hợp (Supabase Auth).
- Hỗ trợ Connection Pooler (PgBouncer) tối ưu hóa kết nối từ xa.

---

## 2. CÁC BƯỚC KHỞI TẠO DỰ ÁN TRÊN SUPABASE (DÀNH CHO NGƯỜI DÙNG)

### Bước 1: Đăng ký / Đăng nhập Supabase
- Truy cập trang chủ: [https://supabase.com](https://supabase.com)
- Bấm **"Start your project"** hoặc **"Sign In"**.
- Khuyên dùng: Chọn **"Continue with GitHub"** để đăng nhập trực tiếp bằng tài khoản GitHub `datwhite21` đã tạo trước đó.

### Bước 2: Tạo Tổ chức & Dự án mới (New Project)
1. Trên giao diện Supabase Dashboard, bấm nút xanh **"New Project"**.
2. Điền các thông tin:
   - **Organization:** Chọn Organization mặc định của bạn (hoặc tạo mới nếu chưa có).
   - **Name:** Nhập `Hanoi-FloodWatch-GIS` (hoặc `hanoi-floodwatch-gis`).
   - **Database Password:** 
     - Tự đặt một mật khẩu an toàn (ví dụ bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).
     - ⚠️ **LƯU Ý CỰC KỲ QUAN TRỌNG:** Hãy lưu mật khẩu này vào ứng dụng ghi chú hoặc file `.env` cá nhân của bạn trên máy. **TUYỆT ĐỐI KHÔNG gửi mật khẩu này vào chat**.
   - **Region:** Chọn vùng **Southeast Asia (Singapore) - `ap-southeast-1`** (Vị trí địa lý gần nhất với Việt Nam, giúp giảm độ trễ truy vấn WebGIS xuống dưới 40ms).
   - **Pricing Plan:** Chọn **Free ($0/month)**.
3. Bấm **"Create new project"** và chờ khoảng 1 - 2 phút để Supabase cấp phát hạ tầng đám mây.

---

## 3. THỰC THI SCHEMA MIGRATION & SEED DATA (SQL EDITOR)

### Bước 3: Chạy Script Tạo Bảng & PostGIS (Migration)
1. Trong menu bên trái của Supabase Dashboard, chọn biểu tượng **SQL Editor** (icon `>_`).
2. Bấm nút **"New query"**.
3. Mở file [database/migrations/01_initial_schema.sql](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/database/migrations/01_initial_schema.sql) trên máy tính của bạn, sao chép toàn bộ nội dung và dán vào cửa sổ SQL Editor của Supabase.
4. Bấm nút **"Run"** (hoặc tổ hợp phím `Ctrl + Enter`).
5. Kết quả báo: *"Success. No rows returned"* là bạn đã kích hoạt PostGIS và tạo thành công toàn bộ 8 bảng dữ liệu, chỉ mục GiST và các chính sách bảo mật RLS!

### Bước 4: Chạy Script Nạp 27 Điểm Ngập Thực Tế (Seed Data)
1. Tiếp tục trong **SQL Editor**, bấm nút **"New query"** (hoặc xóa màn hình cũ).
2. Mở file [database/seeds/01_seed_flood_points.sql](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/database/seeds/01_seed_flood_points.sql), sao chép toàn bộ nội dung và dán vào SQL Editor.
3. Bấm nút **"Run"**.
4. Kết quả báo: *"Success. Contained 30 rows"* (gồm 27 điểm thực tế và 3 điểm mô phỏng kiểm thử).

### Bước 5: Kiểm tra Dữ liệu trên Table Editor
1. Trong menu bên trái, chọn **Table Editor** (icon bảng dữ liệu).
2. Chọn bảng `flood_points`: Bạn sẽ nhìn thấy 30 dòng dữ liệu điểm ngập với tên phố, địa chỉ, cấp độ nguy cơ và cột `location` chứa tọa độ không gian EPSG:4326.
3. Chọn bảng `flood_alerts`: Bạn sẽ thấy 3 bản tin cảnh báo ngập đang có hiệu lực.

---

## 4. LẤY THÔNG TIN CẤU HÌNH ĐỂ KẾT NỐI (CONNECTION STRINGS)

Sau khi tạo xong Database, bạn cần lấy các thông số kết nối để đưa vào file cấu hình cục bộ `.env`:

### 1. Connection String URI (Dành cho Backend Node.js)
- Vào menu **Project Settings** (icon bánh răng góc dưới bên trái) $\rightarrow$ **Database**.
- Kéo xuống mục **Connection string**, chọn tab **URI**.
- Bấm chọn chế độ **Transaction Pooler** (hoặc Session Pooler) trên Port `6543`.
- Chuỗi kết nối sẽ có dạng:
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
  ```
- *Thay `[YOUR-PASSWORD]` bằng mật khẩu Database bạn đã đặt ở Bước 2.*

### 2. Project URL & API Keys (Dành cho API & Frontend)
- Vào menu **Project Settings** $\rightarrow$ **API**.
- Tại đây bạn sẽ thấy:
  - **Project URL:** `https://[PROJECT-REF].supabase.co`
  - **anon / public key:** Chuỗi token JWT công khai (dùng cho Frontend).
  - **service_role key:** Chuỗi token bí mật có quyền tối cao (chỉ dùng cho Backend, KHÔNG ĐƯỢC LỘ).
