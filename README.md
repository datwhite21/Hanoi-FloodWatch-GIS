# HANOI FLOODWATCH GIS
### HỆ THỐNG WEBGIS THEO DÕI VÀ CẢNH BÁO NGUY CƠ NGẬP ÚNG ĐÔ THỊ TẠI HÀ NỘI

**Cấp độ đề tài:** Đồ án Chuyên ngành Công nghệ Thông tin  
**Công nghệ:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Node.js, Express, PostgreSQL/PostGIS (Supabase Cloud)  
**Triển khai:** Cloudflare Pages (Frontend) + Render (Backend) + Supabase Cloud (PostGIS Database)  

---

## 1. GIỚI THIỆU ĐỀ TÀI
Hà Nội là đô thị đặc biệt với tốc độ đô thị hóa nhanh, mật độ dân cư cao và thường xuyên đối mặt với các đợt ngập úng cục bộ nghiêm trọng mỗi khi có mưa lớn tập trung hoặc bão đổ bộ. Hệ thống **Hanoi FloodWatch GIS** được nghiên cứu và xây dựng nhằm cung cấp một giải pháp bản đồ trực tuyến (WebGIS) trực quan, hỗ trợ người dân và cơ quan quản lý:
- Giám sát trực quan các điểm đen có nguy cơ ngập úng trên nền bản đồ số thủ đô Hà Nội.
- Phân loại nguy cơ ngập khoa học (Cao, Trung bình, Thấp) dựa trên mô hình chấm điểm tần suất, độ sâu và thời gian rút nước.
- Thực hiện các phép phân tích không gian chuyên sâu thông qua hệ quản trị CSDL không gian **PostgreSQL/PostGIS**:
  - Truy vấn điểm ngập trong bán kính tùy chọn (500m, 1km, 2km, 3km, 5km) quanh vị trí người dùng.
  - Tìm kiếm điểm nguy cơ ngập gần nhất bằng thuật toán k-Nearest Neighbors (`<->`).
- Tiếp nhận và theo dõi các bản tin cảnh báo ngập úng theo thời gian thực.
- Cung cấp cổng quản trị dữ liệu không gian cho phép cán bộ cập nhật số liệu hiện trường và xuất/nhập chuẩn định dạng `GeoJSON`.

---

## 2. KIẾN TRÚC HỆ THỐNG
Dự án được xây dựng theo mô hình phân tầng độc lập (3-Tier Decoupled Architecture):
1. **Frontend (Presentation Tier):** Xây dựng bằng React 18, Vite, TypeScript, Leaflet, React-Leaflet, Tailwind CSS và Recharts. Triển khai CDN toàn cầu trên **Cloudflare Pages**.
2. **Backend (Application/Logic Tier):** Xây dựng bằng Node.js LTS, Express.js, TypeScript, REST API, Zod Validation, Supabase JWT Auth Middleware. Triển khai Web Service trên **Render**.
3. **Database (Data Tier):** CSDL đám mây PostgreSQL 15+ tích hợp **PostGIS Spatial Extension** trên **Supabase Cloud**, hỗ trợ chỉ mục không gian `GiST` và chính sách bảo mật hàng `Row Level Security (RLS)`.

---

## 3. DANH MỤC TÀI LIỆU HỒ SƠ DỰ ÁN
Bộ tài liệu kỹ thuật và thiết kế hoàn chỉnh được lưu trữ trong thư mục `docs/`:

| Tài liệu | Mô tả nội dung | Đường dẫn |
| :--- | :--- | :--- |
| **Kế hoạch Dự án** | Tiến độ 7 giai đoạn, các mốc bàn giao và ma trận trách nhiệm | [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) |
| **Đặc tả Yêu cầu (SRS)** | Yêu cầu chức năng, phi chức năng, phân loại dữ liệu, tác nhân | [docs/SRS.md](docs/SRS.md) |
| **Kiến trúc Hệ thống** | Thiết kế 3 tầng, luồng xử lý không gian PostGIS, chiến lược Cloud | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Thiết kế CSDL** | Cấu trúc bảng, kiểu dữ liệu hình học EPSG:4326, chỉ mục GiST, RLS | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) |
| **Nguồn Dữ liệu & Tọa độ** | Bảng 27 điểm ngập thực tế Cầu Giấy, Thanh Xuân, Hà Đông kèm tọa độ | [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) |
| **Sơ đồ Hệ thống** | Use Case, ERD, Sequence Diagram bằng chuẩn Mermaid | [docs/diagrams/SYSTEM_DIAGRAMS.md](docs/diagrams/SYSTEM_DIAGRAMS.md) |
| **Thiết kế Giao diện (UI)** | Bảng màu chuyên nghiệp, Wireframe Dashboard, WebGIS Map, Admin | [docs/UI_DESIGN.md](docs/UI_DESIGN.md) |

---

## 4. BẢNG MÀU PHÂN LOẠI NGUY CƠ TRÊN BẢN ĐỒ
- 🔴 **Mức Cao (High Risk):** Ngập sâu > 40cm, giao thông tê liệt hoàn toàn (Phố Hoa Bằng, Phan Văn Trường, Nguyễn Trãi, Ba La, Hầm chui Thăng Long...).
- 🟠 **Mức Trung bình (Medium Risk):** Ngập từ 20cm – 40cm, xe máy và ô tô gầm thấp di chuyển khó khăn (Trần Bình, Bùi Xương Trạch, Thái Hà, Tô Hiệu...).
- 🟢 **Mức Thấp (Low Risk):** Ngập nhẹ < 20cm, nước rút nhanh dưới 30 phút (Đường Cầu Giấy, Lê Văn Lương, Bến xe Yên Nghĩa...).
- ⚪ **Chưa đủ dữ liệu (Unknown / Demo):** Dữ liệu phản ánh mới hoặc kịch bản mô phỏng kiểm thử.

---

## 5. TÌNH TRẠNG HIỆN TẠI & BƯỚC TIẾP THEO
- **Hiện tại:** Đã hoàn thành toàn diện **Giai đoạn 1: Khảo sát môi trường, Phân tích & Thiết kế hệ thống**.
- **Bước tiếp theo:** Chờ người dùng cài đặt Git, sau đó bước vào **Giai đoạn 2: Thiết lập CSDL Supabase & PostGIS**.
