# CẨM NANG HƯỚNG DẪN THIẾT LẬP VÀ QUẢN TRỊ DỊCH VỤ NGOÀI
# (EXTERNAL SERVICES & MANUAL SETUP GUIDE)
## DỰ ÁN: VIETNAM FLOODWATCH GIS

> **NGUYÊN TẮC BẢO MẬT & QUYỀN TỰ CHỦ CỦA BẠN:**
> - Bạn là người sở hữu duy nhất có quyền quyết định kết nối các dịch vụ bên ngoài, tạo tài khoản và quản lý khóa bí mật (API Keys/Tokens).
> - Trợ lý Kỹ thuật **tuyệt đối không tự ý** tạo tài khoản, không tự sửa file `.env`, không in secret key ra màn hình và không bật dịch vụ có tính phí.
> - Bảng dưới đây liệt kê toàn diện tất cả các dịch vụ đang sử dụng và dự kiến bổ sung trong quá trình nâng cấp hệ thống.

---

## 1. BẢNG DANH MỤC CÁC DỊCH VỤ BÊN NGOÀI

| Tên Dịch vụ | Mục đích sử dụng | Tình trạng kết nối | Cần tài khoản? | Cần API Key/Token? | Cần sửa `.env`? | Cần cài phần mềm? | Chi phí | Ai thực hiện? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Open-Meteo Weather API** | Lấy dữ liệu mô hình thời tiết (nhiệt độ, độ ẩm, lượng mưa mm/h) theo tọa độ | **ĐÃ KẾT NỐI** | Không | Không (<10,000 req/ngày) | Không | Không | **0đ (Miễn phí)** | Hệ thống tự gọi API công khai |
| **Supabase Cloud** | CSDL PostgreSQL 15, PostGIS, Auth, Realtime WebSockets | **ĐÃ KẾT NỐI** | Đã có tài khoản | Đã cấu hình trong `.env` | Không cần đổi key | Không | **0đ (Free Tier)** | Bạn chạy script SQL trên web |
| **Render Web Service** | Máy chủ Node.js/Express REST API | **ĐÃ KẾT NỐI** | Đã có tài khoản | Không | Đã cấu hình trên Render | Không | **0đ (Free Tier)** | Bạn quản lý tài khoản Render |
| **Cloudflare Pages** | Mạng CDN phân phối giao diện Frontend React/Vite | **ĐÃ KẾT NỐI** | Đã có tài khoản | Không | Đã cấu hình `VITE_API_URL` | Không | **0đ (Free Tier)** | Bạn quản lý tài khoản Cloudflare |
| **GitHub Actions (Đề xuất)** | Bộ lập lịch Ingestion Cron độc lập thay thế cho Render sleep | *CHỜ PHÊ DUYỆT* | Đã có tài khoản GitHub | Dùng token mặc định GitHub | Không | Không | **0đ (Miễn phí 2000 phút/tháng)** | Trợ lý soạn file, bạn duyệt commit |
| **NASA Earthdata (IMERG)** | Lớp ảnh vệ tinh lượng mưa diện rộng toàn cầu | *CHỜ PHÊ DUYỆT* | Cần tài khoản NASA | Cần Earthdata Token | Cần thêm vào Render | Không | **0đ (Dữ liệu khoa học mở)** | Bạn tự đăng ký theo hướng dẫn |
| **Copernicus GloFAS** | Dự báo lưu lượng lũ và nguy cơ ngập lưu vực sông | *CHỜ PHÊ DUYỆT* | Cần tài khoản CDS | Cần CDS API Key | Cần thêm vào Render | Không | **0đ (Khoa học mở EU)** | Bạn tự đăng ký theo hướng dẫn |
| **Google Maps Platform** | Lớp bản đồ nền chính thức có bản quyền | *KHÔNG KHUYẾN NGHỊ* | Cần Google Cloud | Cần Maps API Key | Cần sửa `.env` | Không | Yêu cầu thẻ tín dụng (Free 200$/th) | Đề xuất dùng CartoDB/Esri thay thế |

---

## 2. HƯỚNG DẪN CHI TIẾT CÁC THAO TÁC BẠN CẦN TRỰC TIẾP THỰC HIỆN

### 🔹 THAO TÁC 1: KÍCH HOẠT BẢNG BÁO NGẬP CỘNG ĐỒNG TRÊN SUPABASE (ƯU TIÊN 1)
- **Mục đích:** Khắc phục lỗi HTTP 404 của bảng `citizen_reports` và giúp tính năng Supabase Realtime hoạt động đồng bộ tức thời giữa các thiết bị.
- **Thời gian thực hiện:** Khoảng 1 phút trên trình duyệt web.
- **Các bước thực hiện:**
  1. Mở trình duyệt và truy cập trang quản trị dự án Supabase của bạn tại:  
     👉 **[https://supabase.com/dashboard/project/drcmvyuxrsvyisuzjrmk](https://supabase.com/dashboard/project/drcmvyuxrsvyisuzjrmk)**
  2. Ở thanh menu màu xám bên trái, nhấp vào biểu tượng **`SQL` (SQL Editor)**.
  3. Nhấn vào nút xanh lá **New query** (hoặc dấu `+`).
  4. Mở file [database/migrations/02_citizen_reports.sql](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/database/migrations/02_citizen_reports.sql), copy toàn bộ đoạn mã SQL trong đó và dán vào khung soạn thảo.
  5. Nhấn nút xanh lá cây **Run** (hoặc bấm `Ctrl + Enter`).
  6. Khi màn hình xuất hiện thông báo `Success. No rows returned` là bạn đã kích hoạt bảng và kênh Realtime thành công 100%!

---

### 🔹 THAO TÁC 2: QUYẾT ĐỊNH GIẢI PHÁP LẬP LỊCH CRON CHO INGESTION WORKER (ƯU TIÊN 2)
- **Vấn đề kỹ thuật:** Render Web Service miễn phí sẽ tự động ngủ sau 15 phút không có người truy cập, khiến tiến trình quét dữ liệu thời tiết bị dừng.
- **Giải pháp đề xuất (Bạn lựa chọn):**
  - **Phương án A (Khuyến nghị): Sử dụng GitHub Actions Scheduled Workflow.**
    - *Ưu điểm:* 100% miễn phí, chạy hoàn toàn độc lập với Render, cứ mỗi 30 hoặc 60 phút sẽ tự động kích hoạt một request gửi tới endpoint `/api/ingestion/run` để đánh thức Render và nạp dữ liệu.
    - *Cách thực hiện:* Trợ lý sẽ chuẩn bị sẵn file `.github/workflows/ingestion-cron.yml`. Bạn chỉ cần duyệt mã và đẩy lên GitHub.
  - **Phương án B: Sử dụng dịch vụ cron web miễn phí bên ngoài (như Cron-Job.org).**
    - *Cách thực hiện:* Bạn đăng ký tài khoản miễn phí trên `cron-job.org`, tạo 1 job định kỳ ping tới URL `https://hanoi-floodwatch-gis-1.onrender.com/api/health`.

---

### 🔹 THAO TÁC 3: ĐĂNG KÝ TÀI KHOẢN NASA EARTHDATA (NẾU BẠN CHỌN TÍCH HỢP GPM/IMERG)
- **Mục đích:** Nhận dữ liệu ước tính lượng mưa viễn thám từ chùm vệ tinh NASA GPM (Global Precipitation Measurement).
- **Trạng thái hiện tại:** Đang ở mức nghiên cứu thiết kế, CHƯA BẮT BUỘC.
- **Quy trình khi bạn đồng ý kích hoạt:**
  1. Bạn truy cập cổng đăng ký chính thức của NASA: `https://urs.earthdata.nasa.gov/users/new`.
  2. Điền thông tin cá nhân (Username, Password, Email học thuật hoặc cá nhân).
  3. Mở email xác minh tài khoản từ NASA.
  4. Vào mục `Generate Token` để lấy chuỗi Token cá nhân của bạn.
  5. Bạn tự mở Render Dashboard -> Environment Variables -> Điền biến `NASA_EARTHDATA_TOKEN`. (Tuyệt đối không gửi token này vào cuộc trò chuyện).

---

### 🔹 THAO TÁC 4: LỰA CHỌN LỚP BẢN ĐỒ NỀN HỢP PHÁP (BASEMAP)
- **Vấn đề kỹ thuật:** Lớp bản đồ Google Maps hiện tại đang dùng link `mt.google.com` (chưa có API Key chính thức).
- **Giải pháp đề xuất (Bạn lựa chọn):**
  - **Phương án A (Khuyến nghị số 1 - An toàn, Miễn phí 100%):** Đặt **CartoDB Voyager** hoặc **Esri World Imagery** làm lớp bản đồ hiển thị mặc định. Cả 2 nhà cung cấp này đều cấp phép sử dụng miễn phí cho mục đích học thuật và giáo dục.
  - **Phương án B (Nếu bạn muốn giữ Google Maps chính thức):** Bạn cần vào Google Cloud Console, tạo Project, bật Maps JavaScript API, tạo API Key và đặt hạn mức bảo vệ để không phát sinh chi phí.
