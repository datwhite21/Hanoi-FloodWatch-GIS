# BỘ SLIDE THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN CHUYÊN NGÀNH
## PHÁT TRIỂN VÀ THIẾT KẾ PHẦN MỀM (PTTKPM) / GIS

---

# ĐỀ TÀI:
## HỆ THỐNG WEBGIS THEO DÕI THỜI GIAN THỰC, VIỄN THÁM VỆ TINH & CẢNH BÁO BÃO LŨ TOÀN QUỐC
### *(VIETNAM FLOODWATCH GIS – TRỌNG TÂM RỐN LŨ MIỀN TRUNG)*

**Nhóm thực hiện:** Nhóm 21 – Lớp N05  
**Hệ thống trực tuyến:** [https://hanoi-floodwatch-gis.pages.dev](https://hanoi-floodwatch-gis.pages.dev)  
**Mã nguồn GitHub:** [https://github.com/datwhite21/Hanoi-FloodWatch-GIS](https://github.com/datwhite21/Hanoi-FloodWatch-GIS)  

---

## SLIDE 1: GIỚI THIỆU & TÍNH CẤP THIẾT
- **Bài toán bão lũ Miền Trung:** Dải đất Miền Trung (Huế, Quảng Trị, Quảng Bình, Hà Tĩnh, Đà Nẵng) thường xuyên hứng chịu lượng mưa cực đoan 500 - 1.000mm, gây ngập lụt diện rộng, cô lập các huyện trũng thấp (Lệ Thủy, Hương Khê, Quảng Điền...).
- **Bài toán ngập úng đô thị lớn:** Hà Nội & TP.HCM đối mặt ngập úng cục bộ do mưa dông dồn dập và triều cường.
- **Hạn chế của ứng dụng hiện nay:** Thiếu cập nhật trực tiếp theo tọa độ GPS, phụ thuộc nhập liệu thủ công với độ trễ cao, CSDL thường là dữ liệu tĩnh mô phỏng.
- **Giải pháp của nhóm:** Hệ sinh thái WebGIS **Vietnam FloodWatch GIS** hoạt động trên Cloud 24/7 với dữ liệu thực tế 100%, tích hợp viễn thám vệ tinh khí tượng và mạng lưới báo ngập cộng đồng thời gian thực.

---

## SLIDE 2: NGUYÊN TẮC THIẾT KẾ DỮ LIỆU THỰC TẾ (CLEAN SLATE ARCHITECTURE)
- **Tuyệt đối KHÔNG sử dụng Mock/Seed Data cố định:** Cơ sở dữ liệu khởi đầu hoàn toàn sạch (0 bản ghi giả lập).
- **Dữ liệu phát sinh tự động từ thực tế:**
  1. *Vệ tinh viễn thám Open-Meteo:* Tự động quét theo GPS người dùng trên cả nước để lấy lượng mưa tức thời (mm/h).
  2. *Tiến trình ngầm (Background Worker 24/7):* Tự động quét định kỳ các trạm trọng điểm (Huế, Lệ Thủy, Đông Hà, Hương Khê, Hà Nội, TP.HCM), tự động ghi nhận số liệu đo mưa và phát sinh cảnh báo khi vượt ngưỡng.
  3. *Báo cáo cộng đồng (Citizen Crowdsourcing):* Người dân tại hiện trường gửi phản ánh ngập với độ sâu trực quan và GPS, đồng bộ ngay lập tức lên bản đồ bằng WebSockets.

---

## SLIDE 3: KIẾN TRÚC HỆ THỐNG 3 TẦNG (3-TIER DECOUPLED CLOUD)
- **Tầng Trình diễn (Frontend):** React 18, Vite, TypeScript, Leaflet GIS, Tailwind CSS, Recharts. Triển khai CDN toàn cầu trên **Cloudflare Pages**.
- **Tầng Ứng dụng (Backend API):** Node.js LTS, Express.js, TypeScript, Ingestion Background Worker, RESTful API, Zod Validation. Triển khai Web Service trên **Render**.
- **Tầng Dữ liệu Không gian (Database):** PostgreSQL 15 + PostGIS trên **Supabase Cloud**. Tọa độ WGS 84 (EPSG:4326), Chỉ mục không gian `GiST`, Bảo mật hàng `RLS`.

---

## SLIDE 4: CÁC TÍNH NĂNG ĐỘT PHÁ NỔI BẬT
1. **Lớp bản đồ số đa dạng không bị chặn tại Việt Nam:**
   - Google Maps đường phố (mặc định mượt mà).
   - Google Vệ tinh & Esri Vệ tinh (quan sát sông ngòi, địa hình thực địa).
   - CartoDB Đô thị tối giản.
2. **Bộ chuyển đổi vùng trọng điểm nhanh:**
   - 🇻🇳 Toàn quốc
   - 🔴 Rốn Lũ Miền Trung (Tâm điểm Thừa Thiên Huế & Quảng Trị)
   - 🏛️ Miền Bắc (Hà Nội)
   - 🏙️ Miền Nam (TP. Hồ Chí Minh)
3. **Phân tích không gian bán kính (Spatial Buffer Analysis):**
   - Lọc vùng ngập trong bán kính 500m - 5km quanh vị trí GPS bằng hàm `ST_DWithin` của PostGIS.
4. **Báo ngập cộng đồng với marker sóng radar nhấp nháy:**
   - Thang đo 3 mức trực quan: Mắt cá chân (~15cm), Nửa bánh xe (~35cm), Ngập lũ sâu (> 1m).

---

## SLIDE 5: KẾT QUẢ TRIỂN KHAI & BẢO VỆ
- **Hệ thống đã triển khai thực tế 100% trên Cloud Internet:**
  - Frontend: [https://hanoi-floodwatch-gis.pages.dev](https://hanoi-floodwatch-gis.pages.dev)
  - Backend API: [https://hanoi-floodwatch-gis-1.onrender.com](https://hanoi-floodwatch-gis-1.onrender.com)
  - Health check: `UPTIME OK, HEALTHY 100%`
- **Kết quả kiểm thử toàn trình:** 100% kịch bản kiểm thử PASS.
- **Khả năng mở rộng:** Sẵn sàng kết nối thêm các trạm đo mực nước sông tự động và mô hình học máy (AI/ML) dự báo ngập lụt sớm.
