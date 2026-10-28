# BÁO CÁO KIỂM TOÁN DỮ LIỆU THỰC TẾ & HIỆN TRẠNG HỆ THỐNG
# (REALTIME DATA & ARCHITECTURE AUDIT REPORT)
## DỰ ÁN: VIETNAM FLOODWATCH GIS

- **Ngày thực hiện kiểm toán:** 28/10/2026
- **Môi trường kiểm toán:** 
  - Local: Node.js v24, Windows PowerShell
  - Cloud Production: Render (`hanoi-floodwatch-gis-1.onrender.com`), Cloudflare Pages (`hanoi-floodwatch-gis.pages.dev`), Supabase Managed Cloud (`drcmvyuxrsvyisuzjrmk.supabase.co`)
- **Nguyên tắc kiểm toán:** Khách quan, độc lập, dựa trên bằng chứng kỹ thuật thực tế (code, database rows, network responses); không giả định; không sửa đổi production trong quá trình kiểm toán.

---

## 1. BẢNG KIỂM TOÁN CHI TIẾT TỪNG THÀNH PHẦN

| Chức năng | Mã nguồn liên quan | Nguồn dữ liệu thực tế | Tình trạng thực tế | Vấn đề phát hiện | Hướng xử lý đề xuất | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Truy vấn Thời tiết Hiện tại** | `backend/src/services/weather.service.ts` | Open-Meteo API (`api.open-meteo.com/v1/forecast`) | Đang hoạt động, phản hồi JSON ~250ms | 1. Dữ liệu là **mô hình số trị (NWP - ECMWF/GFS)** nội suy theo tọa độ, **KHÔNG PHẢI quan trắc mặt đất vật lý**.<br>2. Khi lỗi kết nối, code trả về **dữ liệu giả fallback cứng** (26°C, 85%, 0mm, 'Trời quang'). | 1. Đổi nhãn thành "Ước tính Mô hình Thời tiết ECMWF".<br>2. Xóa bỏ mock fallback; khi lỗi API, trả về mã lỗi rõ ràng và nhãn `Chưa có dữ liệu`. | `IMPLEMENTED` |
| **Tiến trình Ingestion Worker** | `backend/src/workers/ingestion.worker.ts` | Lặp qua 7 tọa độ `MONITORING_REGIONS` gọi Open-Meteo | Chạy được khi backend đang thức. Đã ghi nhận 6 bản ghi vào DB lúc 14:38 ngày 28/10 | 1. **Render Free sleep sau 15p idle**: Khi Render ngủ, `setInterval` bị dừng hoàn toàn, worker KHÔNG THỂ chạy 24/7.<br>2. **Bỏ qua lượng mưa 0.0 mm**: Code dùng `if (weather.precipitation_mm_h > 0)` nên ngày tạnh ráo không lưu bản ghi nào.<br>3. Timestamp `observed_at` dùng `new Date()` (giờ fetch) thay vì `current.time` từ Open-Meteo.<br>4. Thiếu unique constraint trên `(station_id, observed_at)` dẫn đến nguy cơ duplicate. | 1. Tách scheduler ra khỏi Render Web Service (dùng GitHub Actions Scheduled Workflow hoặc Supabase pg_cron).<br>2. Lưu cả giá trị 0.0 mm hợp lệ kèm nhãn `DRY`.<br>3. Dùng đúng `valid_at` từ nguồn.<br>4. Thêm constraint và upsert an toàn. | `FAILED` *(Về tính 24/7)* |
| **Các Trạm Quan trắc trên Bản đồ** | `backend/src/controllers/weather.controller.ts`, `frontend/src/components/map/LeafletMap.tsx` | Mảng 7 tọa độ cứng `MONITORING_REGIONS` | Hiển thị 7 icon vệ tinh 🛰️ trên bản đồ | 1. **Gán nhãn sai bản chất**: Gán nhãn "Trạm Viễn thám Vệ tinh 24/7" cho 7 điểm tọa độ nội suy mô hình.<br>2. Tạo 6 bản ghi trạm `[Vệ tinh] ...` trong bảng `rainfall_stations` gây hiểu nhầm là trạm đo vật lý. | Đổi biểu tượng và nhãn thành "Điểm Giám sát Khí tượng Mô hình Số trị" hoặc "Vị trí Tham chiếu Lưu vực". Phân biệt rạch ròi với trạm vật lý chính thức. | `IMPLEMENTED` |
| **Cơ chế Phát Cảnh báo Mưa Lũ** | `backend/src/workers/ingestion.worker.ts` (dòng 68) | Lượng mưa tính từ Open-Meteo | Tự động INSERT vào `flood_alerts` | **Ngưỡng cứng 20 mm/h**: Tự động phát sinh cảnh báo `ORANGE`/`RED` với thông điệp *"Nguy cơ dâng nước ngập úng cao"*. Đây là ngưỡng kỹ thuật thô, chưa qua mô hình thủy văn lưu vực, không tính đến triều cường hay thoát nước. | Chuyển cảnh báo này thành `Loại: Tham chiếu Kỹ thuật (Mưa lớn cục bộ)`, ghi rõ chưa qua kiểm chứng địa phương. Không gộp vào cảnh báo khẩn cấp chính thức. | `IMPLEMENTED` |
| **Mạng lưới Báo ngập Cộng đồng** | `backend/src/services/citizenReports.service.ts`, `frontend/src/components/citizen/CitizenReportModal.tsx` | Người dân gửi qua form web | Gửi được báo cáo, backend fallback vào `flood_points (UNVERIFIED)` | 1. **Bảng `citizen_reports` chưa tồn tại trên Supabase** (trả về HTTP 404).<br>2. Code fallback vào `flood_points` nhưng frontend `MapPage.tsx` lại chỉ lắng nghe Supabase Realtime trên bảng `citizen_reports` -> **Sự kiện Realtime KHÔNG hoạt động**! | Hướng dẫn Người dùng chạy migration `02_citizen_reports.sql` trên Supabase SQL Editor. Cập nhật frontend lắng nghe đồng bộ bảng thực tế. | `BLOCKED` |
| **Bản đồ Lớp nền (Basemap)** | `frontend/src/components/map/LeafletMap.tsx` (dòng 154) | Google Maps Tile Server (`mt{s}.google.com`) | Bản đồ Google Maps hiển thị mượt mà tại VN | **Vấn đề bản quyền / ToS**: URL `mt.google.com` là endpoint cũ không chính thức, không có API Key của Google Maps Platform, có nguy cơ bị Google chặn hoặc vi phạm điều khoản nếu kiểm toán gắt gao. | 1. Đưa CartoDB Voyager hoặc Esri Satellite làm lớp nền mặc định hợp pháp.<br>2. Hoặc hướng dẫn Người dùng đăng ký Google Maps Platform API Key chính thức nếu muốn giữ Google Maps. | `IMPLEMENTED` |
| **Phân tích Bán kính Không gian** | `backend/src/repositories/spatial.repository.ts` | PostGIS `ST_DWithin` hoặc Haversine fallback | Hoạt động bình thường qua API `/api/spatial/nearby` | Nếu biến `DATABASE_URL` trong `.env` chưa có mật khẩu kết nối trực tiếp pooler, hệ thống tự động fallback sang tính toán khoảng cách Haversine bằng JavaScript thay vì dùng chỉ mục không gian `GiST` của PostGIS. | Hướng dẫn cấu hình chuỗi kết nối an toàn hoặc sử dụng RPC function trên Supabase để thực thi PostGIS nguyên bản 100%. | `VERIFIED` *(qua Fallback)* |
| **Dashboard & Bảng Thống kê** | `frontend/src/pages/DashboardPage.tsx` | Supabase `/statistics/overview` | Hiển thị số liệu 0 điểm, 0 cảnh báo | 1. Lỗi `|| 27` và `|| 12` đã được khắc phục bằng `?? 0`.<br>2. Thẻ Card 4: "Độ chính xác không gian: 100% EPSG:4326 PostGIS" là chữ viết cứng (hardcode text), không phải chỉ số đo đạc nghiệp vụ. | Thay thế Card 4 bằng một chỉ số nghiệp vụ thực tế (ví dụ: "Số trạm mô hình đang kết nối" hoặc "Thời gian cập nhật nguồn cuối"). | `VERIFIED` |
| **Tính Đầy Đủ & Đồng Bộ Tài Liệu** | `README.md`, `docs/reports/PROJECT_REPORT.md` | Báo cáo đồ án | Đã có tài liệu 5 chương | Tài liệu hiện tại đang mô tả hệ thống như đã hoạt động hoàn hảo 100% 24/7 với dữ liệu vệ tinh, trong khi thực tế có các điểm gián đoạn (Render sleep, bảng chưa migrate, dữ liệu là mô hình chứ không phải trạm thực tế). | Cập nhật lại tài liệu trung thực với hiện trạng kỹ thuật sau kiểm toán. | `IMPLEMENTED` |

---

## 2. KẾT QUẢ KIỂM TOÁN 10 CÂU HỎI ĐẶC BIỆT CỦA MASTER PROMPT

### 1. Open-Meteo đang lấy dữ liệu loại gì?
- **Sự thật kỹ thuật:** Open-Meteo API endpoint `https://api.open-meteo.com/v1/forecast` trả về dữ liệu nội suy không gian từ các **Mô hình Dự báo Số trị (NWP - Numerical Weather Prediction)** của các trung tâm khí tượng lớn (ECMWF IFS, GFS NOAA, DWD ICON). 
- **Kết luận:** Đây là **dữ liệu mô hình/dự báo khí tượng**, KHÔNG PHẢI số liệu quan trắc thực địa mặt đất (in-situ observation) từ các trạm vật lý của Việt Nam.

### 2. Bảy vị trí thời tiết có phải trạm quan trắc vật lý không?
- **Sự thật kỹ thuật:** Trong file `backend/src/workers/ingestion.worker.ts`, mảng `MONITORING_REGIONS` chỉ là **7 cặp tọa độ danh nghĩa** đại diện cho trung tâm các tỉnh/thị trấn (ví dụ: Huế là `16.4637, 107.5909`, Lệ Thủy là `17.2167, 106.7833`).
- **Kết luận:** **KHÔNG PHẢI trạm vật lý**. Không có thiết bị đo mưa vật lý nào tại đó gửi dữ liệu về hệ thống.

### 3. Worker có thật sự chạy khi Render sleep không?
- **Sự thật kỹ thuật:** Render Web Service gói miễn phí (Free Tier) có chính sách tự động chuyển sang chế độ ngủ (spin-down/sleep) sau 15 phút không có request HTTP gửi đến. Khi instance sleep, tiến trình Node.js bị tạm ngưng, toàn bộ bộ nhớ và bộ đếm thời gian `setInterval` đều ngưng hoạt động.
- **Kết luận:** Worker **KHÔNG CHẠY 24/7** trên Render Free. Nó chỉ chạy khi có người đang duyệt web hoặc có request đánh thức máy chủ.

### 4. Dữ liệu lượng mưa bằng 0 mm có được xử lý đúng không?
- **Sự thật kỹ thuật:** Trong `ingestion.worker.ts` dòng 27:
  ```typescript
  if (weather.precipitation_mm_h > 0) { ... }
  ```
  Nếu thời tiết tạnh ráo (`precipitation_mm_h === 0`), worker bỏ qua hoàn toàn, không lưu bản ghi nào vào `rainfall_observations`.
- **Kết luận:** **XỬ LÝ CHƯA ĐÚNG**. Lượng mưa bằng 0.0 mm là dữ liệu quan sát hợp lệ (thời tiết khô ráo), việc bỏ qua dẫn đến CSDL bị trống rỗng khi trời nắng.

### 5. Cảnh báo 20 mm/h có đang phát sai không?
- **Sự thật kỹ thuật:** Worker tự động sinh cảnh báo đỏ/cam trong `flood_alerts` khi `precipitation_mm_h >= 20`. Ngưỡng này là một con số cứng đặt theo suy đoán kỹ thuật, chưa được đối chiếu với hệ thống tiêu thoát nước thực tế, lưu vực sông hay cảnh báo chính thức từ Trung tâm Dự báo KTTV Quốc gia.
- **Kết luận:** **CÓ NGUY CƠ PHÁT CẢNH BÁO SAI**. Cần gán nhãn rõ đây là "Chỉ số kích hoạt theo dõi mưa lớn thử nghiệm", không được công bố như cảnh báo ngập lụt chính thức.

### 6. Dashboard có còn hardcode không?
- **Sự thật kỹ thuật:** Lỗi `|| 27` và `|| 12` đã được sửa thành `?? 0`. Khi CSDL có 0 điểm, Dashboard hiển thị đúng 0. Tuy nhiên:
  - Thẻ KPI 4 vẫn ghi cứng chuỗi văn bản `"100% EPSG:4326 PostGIS"`.
  - Cần chuyển thành chỉ số giám sát nguồn động thực tế.

### 7. Supabase có còn mock data không?
- **Sự thật kỹ thuật (Kiểm toán qua Service Role REST API lúc 14:50 28/10/2026):**
  - `flood_points`: **0 bản ghi** (Sạch 100%).
  - `flood_alerts`: **0 bản ghi** (Sạch 100%).
  - `flood_observations`: **0 bản ghi** (Sạch 100%).
  - `rainfall_observations`: **6 bản ghi** (Do worker chạy thử nghiệm lúc 14:38 ghi nhận lượng mưa thực tế 0.1 - 0.8 mm từ Open-Meteo).
  - `rainfall_stations`: **9 bản ghi** (3 trạm mẫu từ file schema cũ + 6 bản ghi do worker tự tạo `[Vệ tinh] ...`).
- **Kết luận:** Bảng điểm ngập và cảnh báo đã sạch 100%. Bảng `rainfall_stations` cần chuẩn hóa để không lẫn lộn giữa trạm vật lý và tọa độ mô hình.

### 8. Báo ngập cộng đồng có thực sự Realtime không?
- **Sự thật kỹ thuật:**
  - Bảng `citizen_reports` chưa được tạo trong CSDL Supabase (API trả về HTTP 404 `PGRST205`).
  - Khi gửi báo cáo, code backend fallback ghi vào `flood_points`.
  - Nhưng kênh Supabase Realtime trên frontend lại đang đăng ký lắng nghe trên bảng `citizen_reports`!
- **Kết luận:** **CHƯA REALTIME THỰC SỰ**. Báo cáo gửi đi phải F5 lại trang mới thấy (vì lưu vào `flood_points` nhưng listener lại chờ ở `citizen_reports`).

### 9. Google Maps có sử dụng API hợp lệ không?
- **Sự thật kỹ thuật:** `LeafletMap.tsx` đang dùng URL tile: `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`.
- **Kết luận:** Đây là endpoint lậu/không chính thức (unofficial direct tile access). Mặc dù Leaflet hiển thị được, nhưng **không có API Key chính thức của Google Maps Platform**, vi phạm điều khoản dịch vụ của Google nếu đưa vào nghiệm thu chính thức.

### 10. Các tài liệu có phản ánh đúng mã nguồn không?
- **Sự thật kỹ thuật:**
  - Các tài liệu `README.md`, `PROJECT_REPORT.md` tuyên bố hệ thống vận hành 24/7 với vệ tinh viễn thám và 100% kiểm thử PASS.
  - Thực tế hệ thống đang phụ thuộc Render Free (có sleep), bảng `citizen_reports` chưa migrate, và dữ liệu thời tiết là mô hình Open-Meteo chứ chưa có radar/vệ tinh ảnh trực tiếp.
- **Kết luận:** **TÀI LIỆU CẦN ĐƯỢC ĐIỀU CHỈNH TRUNG THỰC** để bảo đảm tính liêm chính học thuật trong đồ án đại học.

---

## 3. TỔNG KẾT PHÂN LOẠI TRẠNG THÁI HỆ THỐNG

| Trạng thái | Số lượng | Chi tiết |
| :--- | :---: | :--- |
| **VERIFIED (Đã kiểm chứng thật)** | 4 | REST API Core (Node.js/Express), CSDL Supabase PostGIS kết nối thành công, Giao diện Dashboard React 18, Khắc phục lỗi hardcode số 27. |
| **IMPLEMENTED (Đã viết mã nhưng cần tinh chỉnh)** | 4 | Tích hợp Open-Meteo API, Modal Báo ngập cộng đồng, Bộ chọn vùng miền, Bộ lọc bán kính không gian. |
| **BLOCKED (Đang chờ Người dùng cấu hình / cấp quyền)** | 3 | Bảng `citizen_reports` (chờ chạy SQL trên Supabase), API Key chính thức Google Maps (nếu dùng), Dữ liệu trắc địa/lưu vực sông. |
| **NOT IMPLEMENTED (Chưa triển khai)** | 3 | Lớp mưa vệ tinh diện rộng NASA GPM/IMERG, Dữ liệu dự báo lũ lưu vực sông Copernicus GloFAS, Lập lịch cron độc lập ngoài Render. |
| **FAILED (Thử nghiệm chưa đạt yêu cầu)** | 1 | Cam kết "Ingestion Worker chạy 24/7 ngầm trên Render Free" (thất bại do Render sleep). |
