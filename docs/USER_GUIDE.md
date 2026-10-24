# CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG
# VIETNAM FLOODWATCH GIS
### HỆ THỐNG WEBGIS THEO DÕI VÀ CẢNH BÁO BÃO LŨ & NGẬP ÚNG TOÀN QUỐC

---

## 1. GIỚI THIỆU CHUNG
**Vietnam FloodWatch GIS** là hệ thống WebGIS công khai được phát triển nhằm hỗ trợ cộng đồng, người dân và cơ quan quản lý theo dõi thời gian thực tình hình thời tiết, lượng mưa viễn thám vệ tinh và cảnh báo ngập lụt trên toàn lãnh thổ Việt Nam, đặc biệt tập trung vào **khu vực Rốn Lũ Miền Trung (Thừa Thiên Huế, Quảng Trị, Quảng Bình, Hà Tĩnh, Đà Nẵng, Quảng Nam)** cùng hai đô thị lớn là **Hà Nội** và **TP. Hồ Chí Minh**.

Hệ thống hoạt động trực tuyến 24/7 tại địa chỉ:  
👉 **[https://hanoi-floodwatch-gis.pages.dev](https://hanoi-floodwatch-gis.pages.dev)**

---

## 2. HƯỚNG DẪN DÀNH CHO CƯ DÂN & NGƯỜI ĐI ĐƯỜNG

### 2.1. Xem Thời Tiết Vệ Tinh Trực Tiếp Theo Vị Trí Hiện Tại (GPS)
1. Truy cập vào trang web trên trình duyệt điện thoại hoặc máy tính.
2. Khi trình duyệt xuất hiện thông báo: *"Trang web muốn biết vị trí của bạn"*, nhấn **Cho phép (Allow)**.
3. Ngay trên thanh điều hướng (Navbar), widget thời tiết sẽ hiển thị:
   - Biểu tượng thời tiết (Nắng, Nhiều mây, Mưa rào, Mưa giông...).
   - Nhiệt độ hiện tại (°C).
   - **Lượng mưa vệ tinh viễn thám thực tế (mm/h)** cập nhật liên tục từ Open-Meteo.
   - Nhãn rủi ro: **An toàn (Xanh)** nếu không mưa hoặc mưa nhỏ (< 5mm/h); **Cảnh giác (Cam)** nếu mưa vừa; **Nguy cơ cao (Đỏ nhấp nháy)** nếu mưa lớn dồn dập (≥ 20mm/h).
4. Bạn có thể nhấn vào nút xoay mũi tên tròn để làm mới dữ liệu vệ tinh ngay lập tức.

---

### 2.2. Khảo Sát Bản Đồ WebGIS & Chọn Vùng Trọng Điểm
1. Nhấp vào tab **Bản đồ (Map)** trên thanh Menu.
2. Mặc định hệ thống tự động đưa tiêu điểm vào **🔴 Rốn Lũ Miền Trung (Huế - Quảng Trị - Quảng Bình)**.
3. Sử dụng thanh chuyển đổi vùng miền nhanh ở góc trên bên trái bản đồ:
   - **🇻🇳 Toàn quốc:** Xem toàn cảnh Việt Nam từ Bắc vào Nam.
   - **🔴 Rốn Lũ Miền Trung:** Tập trung vào các huyện trũng thấp hay bị lũ ngập sâu như Lệ Thủy (Quảng Bình), Hương Khê (Hà Tĩnh), Phong Điền, Quảng Điền (Huế).
   - **🏛️ Miền Bắc (Hà Nội):** Xem các tuyến phố ngập úng nội đô (Cầu Giấy, Thanh Xuân, Ba Đình...).
   - **🏙️ Miền Nam (TP.HCM):** Xem các vùng ngập triều cường kết hợp mưa lớn (Quận 7, Nhà Bè, Thủ Đức...).

---

### 2.3. Chuyển Đổi Các Lớp Bản Đồ Nền (Layer Switcher)
Ở góc trên bên phải bản đồ, nhấn vào biểu tượng các lớp xếp chồng để chọn:
- **🗺️ Google Maps:** Bản đồ đường phố chi tiết, hiển thị rõ tên phố và ngõ ngách (chạy mượt mà, không bị chặn tại Việt Nam).
- **🎨 CartoDB Đô thị:** Bản đồ tối giản với màu sắc hiện đại, làm nổi bật các điểm cảnh báo ngập.
- **🛰️ Google Vệ tinh / 🌍 Esri Vệ tinh:** Bản đồ không ảnh chụp từ vệ tinh, giúp quan sát địa hình thực tế, sông ngòi, vùng trũng và khu dân cư ven sông.
- **📍 OpenStreetMap:** Bản đồ mã nguồn mở toàn cầu.

---

### 2.4. Gửi Báo Cáo Ngập Nước Tại Hiện Trường (Citizen Crowdsourcing)
Khi bạn đang di chuyển trên đường hoặc ở khu dân cư và gặp tuyến đường đang ngập úng:
1. Nhấn vào nút màu đỏ nổi bật **📢 Báo ngập** trên thanh điều hướng.
2. Modal báo ngập hiện ra với các trường thông tin:
   - **Vị trí & GPS:** Nhấn nút **📍 Lấy tọa độ GPS hiện tại** để hệ thống tự động bắt tọa độ chính xác của bạn.
   - **Địa chỉ / Tên tuyến đường:** Nhập tên đường, số nhà hoặc ngã tư (ví dụ: *Đường Hùng Vương, TP. Huế* hoặc *Ngã tư Phan Bội Châu*).
   - **Mức độ ngập (Bấm chọn trực quan):**
     - 🟢 **Mắt cá chân (~10 - 20 cm):** Xe cộ vẫn di chuyển chậm được.
     - 🟠 **Nửa bánh xe (~30 - 45 cm):** Xe máy chết máy hàng loạt, ngập sàn ô tô con.
     - 🔴 **Ngập lũ sâu (> 60 cm - 1m+):** Ngập sâu đặc trưng bão lũ Miền Trung, xe cộ cấm đi qua.
   - **Mô tả chi tiết & Link ảnh hiện trường:** Nhập thêm chi tiết tình hình thực tế (tùy chọn).
3. Nhấn **Xác nhận gửi báo cáo**.
4. Báo cáo của bạn sẽ ngay lập tức xuất hiện trên bản đồ dưới dạng **Marker sóng Radar nhấp nháy** để cảnh báo cho hàng triệu người đi đường khác tránh khu vực nguy hiểm!

---

### 2.5. Sử Dụng Công Cụ Phân Tích Bán Kính Không Gian (Radius Spatial Tool)
1. Nhấn vào nút **Công cụ đo bán kính** ở góc trên bên phải bản đồ.
2. Bạn có 2 cách chọn tâm đo:
   - Cách 1: Nhấn nút **📍 Vị trí của tôi** để lấy tâm là vị trí GPS hiện tại.
   - Cách 2: Nhấp chuột trực tiếp lên bất kỳ điểm nào trên mặt đường bản đồ.
3. Kéo thanh trượt để điều chỉnh bán kính khảo sát: **500m, 1km, 2km, 3km, 5km**.
4. Hệ thống sẽ vẽ vòng tròn bán kính màu xanh trong suốt và tự động sử dụng hàm không gian `ST_DWithin` của PostGIS để lọc ra tất cả các điểm ngập nằm trong phạm vi đó, thông báo bạn có nằm trong vùng an toàn hay không.

---

## 3. HƯỚNG DẪN DÀNH CHO CÁN BỘ QUẢN LÝ & ADMIN

### 3.1. Đăng Nhập Trang Quản Trị
1. Nhấn nút **Đăng nhập** ở góc trên bên phải.
2. Đăng nhập bằng tài khoản quản trị được cấp quyền trên Supabase Auth.
3. Sau khi xác thực thành công, menu **Quản trị (Admin)** sẽ hiển thị.

### 3.2. Quản Lý & Duyệt Báo Cáo Cộng Đồng
- Các điểm do người dân báo cáo ban đầu mang trạng thái `UNVERIFIED` (Chưa kiểm duyệt).
- Cán bộ quản lý có thể xem chi tiết hình ảnh, số lượt tán thành (upvotes) của người dân để bấm **Xác thực (Verify)** chuyển thành điểm ngập chính thức, hoặc **Đóng / Nước đã rút (Receded)** khi hiện trường đã tiêu thoát nước xong.

### 3.3. Xuất Dữ Liệu Không Gian Chuẩn GeoJSON
- Trong trang Quản trị hoặc thanh công cụ, cán bộ có thể nhấn nút **Xuất GeoJSON** để tải về toàn bộ dữ liệu không gian phục vụ báo cáo ban chỉ đạo PCTT hoặc tích hợp vào hệ thống QGIS chuyên nghiệp.
