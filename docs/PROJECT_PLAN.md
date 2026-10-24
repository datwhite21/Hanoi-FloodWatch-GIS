# HANOI FLOODWATCH GIS - KẾ HOẠCH DỰ ÁN (PROJECT PLAN)
**Dự án:** Hệ thống WebGIS theo dõi và cảnh báo nguy cơ ngập úng đô thị tại Hà Nội
**Cấp độ:** Đồ án Chuyên ngành Công nghệ Thông tin
**Công nghệ chính:** React, TypeScript, Leaflet, Node.js/Express, Supabase (PostgreSQL + PostGIS)
**Môi trường triển khai:** Cloudflare Pages (Frontend) + Render (Backend) + Supabase Cloud (Database)

---

## 1. MỤC TIÊU DỰ ÁN
1. Xây dựng nền tảng WebGIS trực tuyến chuyên sâu, ứng dụng công nghệ không gian mã nguồn mở để trực quan hóa và cảnh báo ngập úng đô thị tại thủ đô Hà Nội.
2. Chứng minh năng lực ứng dụng hệ quản trị CSDL quan hệ không gian **PostgreSQL/PostGIS** thực thụ (thông qua Supabase Cloud), không dùng giải pháp giả lập marker hay lưu file phẳng.
3. Triển khai hoàn chỉnh trên Internet, hoạt động thực tế 24/7 qua giao thức bảo mật HTTPS, tương thích máy tính và thiết bị di động.
4. Cung cấp đầy đủ hồ sơ thiết kế, tài liệu kỹ thuật và báo cáo chuyên đề phục vụ đánh giá, bảo vệ đồ án trước hội đồng chuyên môn.

---

## 2. PHÂN KỲ TIẾN ĐỘ THỰC HIỆN (ROADMAP)

### Giai đoạn 1: Khảo sát môi trường, Phân tích yêu cầu & Thiết kế hệ thống (HIỆN TẠI)
- **Mục tiêu:** Kiểm tra môi trường cục bộ, khảo sát phần mềm, phân tích yêu cầu (SRS), thiết kế kiến trúc 3 tầng, thiết kế CSDL PostGIS, thiết kế sơ đồ Use Case, ERD, Kiến trúc triển khai bằng Mermaid, chuẩn bị danh mục dữ liệu điểm ngập thực tế.
- **Sản phẩm bàn giao:**
  - `docs/PROJECT_PLAN.md`
  - `docs/SRS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DATABASE_SCHEMA.md`
  - `docs/DATA_SOURCES.md`
  - Báo cáo kết quả kiểm tra môi trường & hướng dẫn cài đặt phần mềm thiếu.
- **Tiêu chí hoàn thành:** Toàn bộ tài liệu được hoàn thành, sơ đồ Mermaid chuẩn cú pháp, dữ liệu điểm ngập có tọa độ xác thực.

### Giai đoạn 2: Thiết lập Cơ sở dữ liệu Cloud (Supabase + PostGIS)
- **Mục tiêu:** Khởi tạo dự án Supabase, kích hoạt Extension PostGIS, thực thi script Migration DDL, thiết lập RLS (Row Level Security), nạp Seed Data điểm ngập thực tế.
- **Sản phẩm bàn giao:**
  - `database/migrations/01_initial_schema.sql`
  - `database/seeds/01_seed_flood_data.sql`
  - Hướng dẫn cấu hình Supabase và tài khoản Admin.
- **Tiêu chí hoàn thành:** Kết nối thành công tới Supabase qua connection string, thực thi truy vấn không gian mẫu `ST_DWithin` trả về kết quả chính xác.

### Giai đoạn 3: Xây dựng Backend REST API (Node.js + Express + TypeScript)
- **Mục tiêu:** Lập trình Backend theo kiến trúc Controller-Service-Repository, kết nối PostgreSQL/PostGIS, triển khai các API quản lý điểm ngập, truy vấn không gian, quản lý quan trắc, cảnh báo và phân quyền JWT.
- **Sản phẩm bàn giao:**
  - Mã nguồn thư mục `backend/` hoàn chỉnh.
  - Bộ kiểm thử tự động (Unit & Integration tests) cho API không gian.
- **Tiêu chí hoàn thành:** 100% API chạy pass bộ test, không lỗi TypeScript, trả về chuẩn GeoJSON cho dữ liệu không gian.

### Giai đoạn 4: Xây dựng Frontend WebGIS (React + Vite + Leaflet + Tailwind CSS)
- **Mục tiêu:** Phát triển giao diện người dùng hiện đại, thẩm mỹ, trực quan hóa bản đồ ngập lụt Leaflet, bộ lọc không gian, phân tích bán kính, Dashboard thống kê và trang Quản trị.
- **Sản phẩm bàn giao:**
  - Mã nguồn thư mục `frontend/` hoàn chỉnh, responsive trên Mobile & Desktop.
- **Tiêu chí hoàn thành:** Bản đồ hiển thị marker phân màu theo mức nguy cơ, chức năng click chọn bán kính vẽ đường tròn chính xác, form CRUD tương tác trực tiếp API.

### Giai đoạn 5: Tích hợp Hệ thống & Kiểm thử Chuyên sâu
- **Mục tiêu:** Ghép nối Frontend ↔ Backend ↔ Supabase, kiểm thử toàn trình (End-to-End), kiểm tra hiệu năng, bảo mật và khả năng phục hồi lỗi.
- **Sản phẩm bàn giao:**
  - Báo cáo kiểm thử `docs/testing/TEST_PLAN.md` và `docs/testing/TEST_RESULTS.md`.
- **Tiêu chí hoàn thành:** Hệ thống hoạt động trơn tru không lỗi phát sinh, thời gian phản hồi truy vấn không gian dưới 500ms.

### Giai đoạn 6: Triển khai Internet (Production Cloud Deployment)
- **Mục tiêu:** Triển khai Backend lên Render Web Service, Frontend lên Cloudflare Pages, kết nối Domain phụ miễn phí, kích hoạt HTTPS.
- **Sản phẩm bàn giao:**
  - Đường link công khai truy cập website qua Internet.
  - Tài liệu `docs/DEPLOYMENT_GUIDE.md`.
- **Tiêu chí hoàn thành:** Truy cập ổn định từ máy tính ngoài mạng và smartphone (4G/WiFi), không còn dấu vết của localhost trong production build.

### Giai đoạn 7: Hoàn thiện Hồ sơ Đồ án & Chuẩn bị Bảo vệ
- **Mục tiêu:** Biên soạn báo cáo đồ án 5 chương bằng Tiếng Việt, soạn Slide thuyết trình (15–20 slide) và kịch bản demo hội đồng.
- **Sản phẩm bàn giao:**
  - Bản thảo Báo cáo đồ án đầy đủ.
  - Slide thuyết trình & Kịch bản bảo vệ.
- **Tiêu chí hoàn thành:** Sẵn sàng cho buổi bảo vệ đồ án tốt nghiệp/chuyên ngành.

---

## 3. MA TRẬN PHÂN BỔ TRÁCH NHIỆM & NGUYÊN TẮC PHỐI HỢP
| Hạng mục công việc | Trách nhiệm AI Agent | Trách nhiệm Người dùng |
| :--- | :--- | :--- |
| **Phân tích & Thiết kế** | Soạn thảo tài liệu, vẽ sơ đồ, đề xuất giải pháp kỹ thuật | Đọc, phản hồi, duyệt kế hoạch và kiến trúc |
| **Cài đặt phần mềm máy trạm** | Kiểm tra phiên bản, phát hiện phần mềm thiếu, soạn hướng dẫn | Tải và cài đặt phần mềm theo hướng dẫn chuẩn |
| **Đăng ký dịch vụ Cloud** | Lập hướng dẫn chi tiết từng bước, cung cấp cấu hình mẫu | Đăng ký tài khoản (Supabase, Render, Cloudflare), lưu trữ an toàn bí mật |
| **Lập trình & Viết mã** | Viết code chuẩn TypeScript, Clean Architecture, test đầy đủ | Theo dõi tiến độ, phản hồi trải nghiệm giao diện |
| **Triển khai & Vận hành** | Viết file cấu hình, hướng dẫn deploy, verify domain & SSL | Nhập biến môi trường vào Dashboard Cloud theo hướng dẫn |
