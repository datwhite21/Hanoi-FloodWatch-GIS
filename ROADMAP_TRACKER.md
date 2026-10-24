# SỔ TAY THEO DÕI TIẾN ĐỘ THỰC HIỆN DỰ ÁN (ROADMAP TRACKER)
## HỆ THỐNG WEBGIS THEO DÕI VÀ CẢNH BÁO NGUY CƠ NGẬP ÚNG TẠI HÀ NỘI
**Tên dự án:** Hanoi FloodWatch GIS  
**Tài liệu theo dõi chính:** `ROADMAP_TRACKER.md` (Luôn được cập nhật trạng thái sau mỗi bước)  
**Quy tắc bất di bất dịch:** Không nhảy cóc, không làm tắt, nghiệm thu từng bước có xác nhận từ người dùng.

---

## BẢNG TỔNG QUAN TIẾN ĐỘ 8 GIAI ĐOẠN

| Giai đoạn | Tên giai đoạn | Trạng thái | Ghi chú & Điểm dừng nghiệm thu |
| :---: | :--- | :---: | :--- |
| **Giai đoạn 1** | Phân tích yêu cầu & Thiết kế hệ thống | 🟢 **HOÀN THÀNH** | Đã hoàn thành 100% tài liệu thiết kế, sơ đồ Mermaid, cài Git & đẩy lên GitHub |
| **Giai đoạn 2** | Chuẩn bị CSDL Supabase Cloud & PostGIS | 🟢 **HOÀN THÀNH** | Đã tạo Supabase, bật PostGIS, chạy DDL Migration, nạp 27 điểm ngập, test kết nối OK |
| **Giai đoạn 3** | Xây dựng Backend REST API (Express + TS) | 🟢 **HOÀN THÀNH** | Đã hoàn thành toàn bộ API, PostGIS spatial queries, Zod, JWT Auth, 9/9 tests pass |
| **Giai đoạn 4** | Xây dựng Frontend WebGIS (React + Leaflet) | 🟡 **SẴN SÀNG** | Khởi tạo React Vite, Tailwind, Leaflet, Radius Tool, Dashboard, Admin |
| **Giai đoạn 5** | Tích hợp hệ thống toàn diện | ⚪ *Chưa bắt đầu* | Ghép nối Frontend ↔ Backend ↔ Supabase, kiểm tra luồng dữ liệu thật |
| **Giai đoạn 6** | Kiểm thử chuyên sâu (Testing) | ⚪ *Chưa bắt đầu* | Chạy test tự động API, test tính toán khoảng cách PostGIS, test responsive |
| **Giai đoạn 7** | Triển khai Internet (Cloud Deployment) | ⚪ *Chưa bắt đầu* | Deploy Render (Backend) + Cloudflare Pages (Frontend) + HTTPS |
| **Giai đoạn 8** | Hoàn thiện Báo cáo Đồ án & Slide Bảo vệ | ⚪ *Chưa bắt đầu* | Báo cáo 5 chương tiếng Việt, Slide 15-20 trang, Kịch bản demo hội đồng |

---

## CHI TIẾT TỪNG GIAI ĐOẠN & HẠNG MỤC CÔNG VIỆC CỤ THỂ

### 📍 GIAI ĐOẠN 1: PHÂN TÍCH YÊU CẦU & THIẾT KẾ HỆ THỐNG
- [x] **Bước 1.1:** Khảo sát thư mục dự án và kiểm tra công cụ máy trạm (Node.js, npm, Git).
  - *Kết quả:* Node.js v24.22.1 (OK), npm 11.19.1 (OK), Git (Chưa cài đặt).
- [x] **Bước 1.2:** Soạn thảo hồ sơ tài liệu đặc tả và kế hoạch:
  - [x] `PROJECT_PLAN.md` (Kế hoạch phân kỳ và ma trận trách nhiệm).
  - [x] `SRS.md` (Đặc tả 12 yêu cầu chức năng, 9 phi chức năng, phân loại dữ liệu).
  - [x] `ARCHITECTURE.md` (Kiến trúc 3 tầng, luồng xử lý không gian PostGIS).
  - [x] `DATABASE_SCHEMA.md` (Thiết kế 8 bảng, kiểu geometry EPSG:4326, chỉ mục GiST, RLS).
  - [x] `DATA_SOURCES.md` (Danh mục 27 điểm ngập thực tế Hà Nội kèm tọa độ xác thực).
  - [x] `docs/diagrams/SYSTEM_DIAGRAMS.md` (Use Case, ERD, Sequence Diagram Mermaid).
  - [x] `docs/UI_DESIGN.md` (Bảng màu, wireframe Dashboard, Map, Detail, Admin).
  - [x] `.env.example` & `.gitignore` & `README.md`.
- [x] **Bước 1.3:** Người dùng cài đặt xong Git for Windows theo hướng dẫn (Đã xác minh: `git version 2.56.0.windows.3`, user: `datwhite21`).
- [x] **Bước 1.4:** Khởi tạo local Git repository và commit ban đầu toàn bộ tài liệu thiết kế.
- [x] **Bước 1.5:** Liên kết remote origin và đẩy code thành công lên GitHub: `https://github.com/datwhite21/Hanoi-FloodWatch-GIS`.
- 🛑 **Nghiệm thu Giai đoạn 1:** ĐÃ HOÀN THÀNH TOÀN DIỆN (100%). Sẵn sàng chuyển sang Giai đoạn 2.

### 📍 GIAI ĐOẠN 2: CHUẨN BỊ SUPABASE CLOUD & POSTGIS
- [x] **Bước 2.1:** Người dùng tạo Supabase Project thành công (`Hanoi-FloodWatch-GIS` tại region Singapore).
- [x] **Bước 2.2:** Soạn và thực thi Migration `database/migrations/01_initial_schema.sql` (bật PostGIS, tạo 8 bảng, constraints, GiST indexes, trigger tính RiskScore tự động).
- [x] **Bước 2.3:** Soạn và thực thi Seed Data `database/seeds/01_seed_flood_points.sql` (nạp 27 điểm ngập thực tế Hà Nội + 3 kịch bản demo + trạm đo mưa + cảnh báo).
- [x] **Bước 2.4:** Cấu hình biến môi trường bí mật trong file cục bộ `.env`.
- [x] **Bước 2.5:** Viết và chạy script kiểm tra kết nối từ xa `database/scripts/test_supabase.js` (Kết quả: Truy vấn thành công 100% dữ liệu không gian).
- 🛑 **Nghiệm thu Giai đoạn 2:** ĐÃ HOÀN THÀNH TOÀN DIỆN (100%). Sẵn sàng chuyển sang Giai đoạn 3.

---

### 📍 GIAI ĐOẠN 3: XÂY DỰNG BACKEND REST API (NODE.JS + EXPRESS + TYPESCRIPT)
- [x] **Bước 3.1:** Khởi tạo dự án backend TypeScript, cấu hình `tsconfig.json`, `package.json`, Zod, Dotenv, CORS, Logger.
- [x] **Bước 3.2:** Xây dựng module kết nối CSDL PostgreSQL (`pg` pool) & Supabase Client an toàn.
- [x] **Bước 3.3:** Xây dựng Middleware xác thực JWT từ Supabase Auth và phân quyền bảo mật (Admin vs Public).
- [x] **Bước 3.4:** Xây dựng Module Spatial Services (Cốt lõi GIS):
  - API tìm kiếm điểm ngập trong bán kính (`ST_DWithin`, `ST_Distance`).
  - API tìm kiếm điểm nguy cơ gần nhất (`<->` operator).
  - API chuyển đổi sang chuẩn `GeoJSON FeatureCollection` (RFC 7946).
- [x] **Bước 3.5:** Xây dựng các API nghiệp vụ:
  - Flood Points CRUD (Thêm, sửa, xóa, lấy danh sách, chi tiết).
  - Observations API (Lịch sử quan trắc ngập và độ sâu ngập).
  - Alerts API (Quản lý và ban hành cảnh báo theo thời gian thực).
  - Statistics API (Thống kê theo quận, theo mức độ nguy cơ cho Dashboard).
  - Import / Export GeoJSON chuẩn GIS.
- [x] **Bước 3.6:** Viết bộ Unit/Integration tests cho API bằng Vitest & Supertest (**Kết quả: 9/9 tests PASS 100%**).
- [x] **Bước 3.7:** Biên soạn tài liệu đặc tả API chi tiết [docs/api/API_DOCUMENTATION.md](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/docs/api/API_DOCUMENTATION.md).
- 🛑 **Nghiệm thu Giai đoạn 3:** ĐÃ HOÀN THÀNH TOÀN DIỆN (100%). Sẵn sàng chuyển sang Giai đoạn 4.

---

### 📍 GIAI ĐOẠN 4: XÂY DỰNG FRONTEND WEBGIS (REACT + VITE + TAILWIND + LEAFLET)
- [ ] **Bước 4.1:** Khởi tạo dự án Vite + React + TypeScript + Tailwind CSS + Lucide Icons + React Router.
- [ ] **Bước 4.2:** Xây dựng Bản đồ trung tâm Leaflet & Custom Markers phân màu theo mức nguy cơ (Đỏ/Cam/Xanh lá/Xám) kèm Popup.
- [ ] **Bước 4.3:** Xây dựng Sidebar điều khiển GIS:
  - Thanh tìm kiếm địa điểm, bộ lọc theo Quận và Mức nguy cơ.
  - Công cụ quét bán kính: Chọn tâm trực tiếp trên map, chọn bán kính 500m - 5km, vẽ đường tròn bán kính (Circle), hiển thị danh sách kết quả.
- [ ] **Bước 4.4:** Xây dựng Dashboard giám sát: Thẻ KPI, biểu đồ phân bố Recharts, bản tin cảnh báo chạy chữ.
- [ ] **Bước 4.5:** Xây dựng Modal / Trang chi tiết điểm ngập: Lịch sử quan trắc, biểu đồ độ sâu, nguồn kiểm chứng.
- [ ] **Bước 4.6:** Xây dựng Phân hệ Quản trị (Admin Panel):
  - Form thêm/sửa điểm ngập có tính năng Click chọn tọa độ trực tiếp trên bản đồ (Pinpoint).
  - Quản lý cảnh báo và xuất/nhập GeoJSON.
- [ ] **Bước 4.7:** Tối ưu hóa UI/UX: Loading skeleton, Empty states, Toast notifications, Responsive trên điện thoại.
- 🛑 **Nghiệm thu Giai đoạn 4:** Giao diện chạy mượt mà trên trình duyệt máy tính và di động ở môi trường dev.

---

### 📍 GIAI ĐOẠN 5: TÍCH HỢP HỆ THỐNG TOÀN DIỆN
- [ ] **Bước 5.1:** Kết nối Frontend ↔ Backend thông qua biến môi trường `VITE_API_URL`.
- [ ] **Bước 5.2:** Kiểm thử tương tác dữ liệu thật:
  - Thêm điểm ngập mới từ giao diện Admin $\rightarrow$ Lưu vào Supabase $\rightarrow$ Hiển thị ngay trên Bản đồ Public.
  - Kiểm thử chức năng quét bán kính với dữ liệu tọa độ thật của Hà Nội.
- [ ] **Bước 5.3:** Kiểm tra xử lý lỗi mạng, thông báo thân thiện khi Backend đang khởi động từ trạng thái ngủ.
- 🛑 **Nghiệm thu Giai đoạn 5:** Mọi luồng tương tác hoạt động trơn tru không lỗi phát sinh.

---

### 📍 GIAI ĐOẠN 6: KIỂM THỬ CHUYÊN SÂU (TESTING & QUALITY ASSURANCE)
- [ ] **Bước 6.1:** Kiểm thử Frontend: Kiểm tra hiển thị bản đồ, bộ lọc, popup, form CRUD, responsive trên nhiều kích cỡ màn hình.
- [ ] **Bước 6.2:** Kiểm thử Backend & API: Kiểm thử xác thực token, kiểm thử phân quyền, kiểm tra xử lý input độc hại.
- [ ] **Bước 6.3:** Kiểm thử GIS & PostGIS: Xác thực tính chính xác của khoảng cách mét (so sánh với thực địa), kiểm tra độ phủ của chỉ mục GiST.
- [ ] **Bước 6.4:** Lập biên bản kiểm thử `docs/testing/TEST_PLAN.md` và `docs/testing/TEST_RESULTS.md`.
- 🛑 **Nghiệm thu Giai đoạn 6:** Báo cáo kiểm thử đạt chuẩn, không còn lỗi TypeScript hoặc lỗi logic.

---

### 📍 GIAI ĐOẠN 7: TRIỂN KHAI LÊN INTERNET (PRODUCTION CLOUD DEPLOYMENT)
- [ ] **Bước 7.1:** Thông báo mẫu `CẦN NGƯỜI DÙNG THỰC HIỆN` để chuẩn bị tài khoản Render & Cloudflare (miễn phí).
- [ ] **Bước 7.2:** Triển khai Backend Express lên **Render Web Service**:
  - Cấu hình Build/Start command, biến môi trường bí mật trên Dashboard Render.
  - Kiểm tra Health check và cấu hình CORS theo domain chính thức.
- [ ] **Bước 7.3:** Triển khai Frontend React lên **Cloudflare Pages**:
  - Cấu hình build Vite, cấu hình SPA routing (`_redirects`), nạp biến môi trường.
  - Kích hoạt HTTPS và kiểm tra domain miễn phí `*.pages.dev`.
- [ ] **Bước 7.4:** Kiểm thử liên mạng từ thiết bị độc lập (điện thoại 4G/5G, mạng khác).
- 🛑 **Nghiệm thu Giai đoạn 7:** Bàn giao đường link truy cập công khai 24/7 trên Internet.

---

### 📍 GIAI ĐOẠN 8: HOÀN THIỆN HỒ SƠ ĐỒ ÁN & CHUẨN BỊ BẢO VỆ
- [ ] **Bước 8.1:** Hoàn thiện bộ tài liệu hướng dẫn kỹ thuật (`API_DOCUMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `USER_GUIDE.md`).
- [ ] **Bước 8.2:** Biên soạn nội dung Báo cáo Đồ án chuyên ngành chuẩn 5 chương bằng Tiếng Việt:
  - *Chương 1: Tổng quan đề tài & Ý nghĩa thực tiễn.*
  - *Chương 2: Cơ sở lý thuyết về GIS, WebGIS, Leaflet, PostgreSQL/PostGIS, Supabase.*
  - *Chương 3: Phân tích & Thiết kế hệ thống (Use Case, ERD, Kiến trúc, Giao diện).*
  - *Chương 4: Xây dựng & Cài đặt hệ thống (Triển khai kỹ thuật chi tiết).*
  - *Chương 5: Kiểm thử, Đánh giá kết quả & Hướng phát triển.*
- [ ] **Bước 8.3:** Soạn thảo dàn ý Slide thuyết trình bảo vệ (15 - 20 slide) và kịch bản demo trực tiếp cho hội đồng.
- 🛑 **Nghiệm thu Toàn diện:** Sẵn sàng cho buổi bảo vệ đồ án tốt nghiệp/chuyên ngành.

---

## NGUYÊN TẮC BẢO TRÌ VÀ CẬP NHẬT FILE NÀY
1. File `ROADMAP_TRACKER.md` được lưu trữ tại thư mục gốc của dự án.
2. AI Agent và Người dùng sẽ sử dụng file này làm **"kim chỉ nam"** duy nhất xuyên suốt quá trình thực hiện.
3. Mỗi khi hoàn thành một bước, AI Agent có nhiệm vụ đánh dấu `[x]` vào ô tương ứng và cập nhật trạng thái trong bảng tổng quan.
4. Tuyệt đối không tự ý nhảy cóc sang giai đoạn tiếp theo nếu chưa có lệnh xác nhận từ người dùng.
