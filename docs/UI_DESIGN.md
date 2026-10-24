# ĐỀ XUẤT THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM (UI/UX DESIGN SPECIFICATION)
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM) & BẢNG MÀU CHỦ ĐẠO

Giao diện được thiết kế theo phong cách hiện đại, chuyên nghiệp dành cho hệ thống giám sát và cảnh báo khẩn cấp đô thị, đảm bảo tính thẩm mỹ cao, độ tương phản trực quan và chuẩn mực trải nghiệm người dùng (UX).

### 1.1. Bảng màu Chuẩn mực (Curated Color Palette)
- **Màu sắc Nhận diện Chủ đạo (Primary Brand):**
  - Xanh dương đậm (`Deep Ocean Blue` - `#1E3A8A` / `#2563EB`): Tượng trưng cho hệ thống giám sát tài nguyên nước, thủy văn, tạo cảm giác tin cậy và chính quy.
  - Xanh lam nhạt (`Sky Highlight` - `#38BDF8`): Tạo điểm nhấn cho thanh tiêu đề, nút bấm tương tác và biểu tượng đang kích hoạt.
- **Màu sắc Phân cấp Nguy cơ Ngập (Risk Levels):**
  - 🔴 **Mức Cao (High Risk - `#DC2626`):** Màu đỏ cảnh báo mạnh mẽ cho các điểm ngập sâu > 40cm, gây tê liệt giao thông.
  - 🟠 **Mức Trung bình (Medium Risk - `#F59E0B`):** Màu cam hổ phách cho các điểm ngập 20cm – 40cm, di chuyển khó khăn.
  - 🟢 **Mức Thấp (Low Risk - `#10B981`):** Màu xanh ngọc lục bảo cho các điểm ngập nông < 20cm, nước rút nhanh.
  - ⚪ **Chưa đủ dữ liệu (Unknown / Unverified - `#6B7280`):** Màu xám trung tính cho điểm mới phản ánh cần thẩm định.
- **Màu nền & Giao diện (Neutral & Glassmorphism):**
  - Nền trang: Xám phấn siêu nhẹ (`#F8FAFC`) kết hợp thẻ Card trắng tinh (`#FFFFFF`) có đổ bóng mềm (`shadow-sm`, `shadow-md`) và viền mảnh thanh lịch (`border-slate-200`).
  - Hỗ trợ giao diện tối (Dark Mode) cho bản đồ giám sát ca đêm khi cần thiết.

### 1.2. Kiểu chữ & Biểu tượng (Typography & Icons)
- **Font chữ:** Phông chữ không chân hiện đại `Inter` hoặc `Roboto` hỗ trợ hoàn hảo bảng mã tiếng Việt.
- **Biểu tượng:** Bộ biểu tượng vector nhất quán `Lucide React` (Waves, CloudRain, AlertTriangle, MapPin, Navigation, ShieldCheck, Filter, Search, Layers).

---

## 2. BỐ CỤC CÁC TRANG CHÍNH (PAGE-BY-PAGE LAYOUT)

### 2.1. Trang Chủ / Dashboard Giám sát (`/`)
- **Header Thanh điều hướng:**
  - Logo giọt nước kết hợp sóng ngập Hà Nội + Tên hệ thống **Hanoi FloodWatch GIS**.
  - Menu điều hướng: *Tổng quan, Bản đồ WebGIS, Thống kê, Giới thiệu*.
  - Huy hiệu cảnh báo động (Live Alert Ticker): Chạy chữ cảnh báo các điểm đang ngập trong đợt mưa hiện tại.
  - Nút *Đăng nhập Quản trị* (chuyển sang Portal Admin nếu có quyền).
- **Khu vực Thống kê Nhanh (Metric Stat Cards):**
  - Card 1: Tổng số điểm nguy cơ ngập được theo dõi (27 điểm).
  - Card 2: Số điểm nguy cơ Cao (Màu đỏ nổi bật).
  - Card 3: Số cảnh báo đang có hiệu lực.
  - Card 4: Tình trạng kết nối trạm quan trắc khí tượng.
- **Biểu đồ Trực quan hóa (Recharts):**
  - Biểu đồ cột: Phân bổ số lượng điểm ngập theo từng quận trọng điểm (Cầu Giấy, Thanh Xuân, Hà Đông...).
  - Biểu đồ tròn: Tỷ lệ phân cấp nguy cơ (Cao / Trung bình / Thấp).
- **Bản đồ Thu nhỏ Tổng quan (Mini Overview Map):**
  - Xem nhanh phân bố điểm ngập trên toàn thành phố kèm nút "Mở bản đồ toàn màn hình".

---

### 2.2. Trang Bản đồ Trực tuyến WebGIS (`/map`)
Đây là trang trọng tâm của toàn bộ hệ thống, chiếm trọn 100% chiều cao màn hình (Full viewport):

```
+-----------------------------------------------------------------------------------+
|  HEADER: [Logo] Hanoi FloodWatch GIS  |  [Dashboard] [Bản đồ] [Thống kê]  | [Login] |
+------------------------------------+----------------------------------------------+
|  SIDEBAR ĐIỀU KHIỂN & TRA CỨU      |  BẢN ĐỒ KHÔNG GIAN LEAFLET (OPENSTREETMAP)   |
|  - Thanh tìm kiếm tên đường        |                                              |
|  - Bộ lọc Quận: [Cầu Giấy v]       |  [Layer Control] (OSM / Vệ tinh / Ranh giới) |
|  - Bộ lọc Nguy cơ: [x]Cao [x]TB    |                                              |
|                                    |               (Marker Đỏ) Hoa Bằng           |
|  [CÔNG CỤ PHÂN TÍCH BÁN KÍNH]      |                \                             |
|  - Tâm: Click chọn trên bản đồ     |                 +-- [Popup Thông tin]        |
|  - Bán kính: [500m][1km][2km][5km] |                     - Mức: Cao (45cm)        |
|  - Nút: [Quét điểm ngập]           |                     - [Xem chi tiết]         |
|                                    |                                              |
|  [DANH SÁCH ĐIỂM TRONG VÙNG QUÉT]  |        (Vòng tròn bán kính 2000m vẽ mờ)      |
|  1. Hoa Bằng (Cách 350m)           |                                              |
|  2. Phan Văn Trường (Cách 820m)    |  [CHÚ GIẢI BẢN ĐỒ] (Đỏ: Cao | Cam: TB | ...) |
|  3. Dương Đình Nghệ (Cách 1.4km)   |  [Thước tỷ lệ Scale: 500m]                   |
+------------------------------------+----------------------------------------------+
```

---

### 2.3. Modal / Trang Hồ sơ Điểm Ngập (`/points/:id`)
- **Tiêu đề & Huy hiệu:** Tên điểm ngập (VD: *Phố Hoa Bằng, Phường Yên Hòa, Quận Cầu Giấy*) kèm Badge đỏ `NGUY CƠ CAO`.
- **Thông số kỹ thuật:**
  - Tọa độ địa lý: `21.0268° N, 105.7942° E` (nút bấm copy tọa độ hoặc mở trên Google Maps).
  - Điểm nguy cơ chuẩn hóa: `82.5 / 100`.
  - Độ sâu ngập lịch sử lớn nhất: `50 cm`.
  - Thời gian thoát nước trung bình: `60 - 90 phút`.
  - Nguồn dữ liệu kiểm chứng: *Công ty Thoát nước Hà Nội (HSDC)*.
- **Biểu đồ Lịch sử Quan trắc:** Biểu đồ đường thể hiện mực nước qua các cơn bão gần nhất.
- **Hiện trường & Ảnh minh chứng:** Hiển thị ảnh chụp ngập úng thực tế nếu có.

---

### 2.4. Phân hệ Quản trị Viên (`/admin`)
- **Quản lý Danh mục Điểm ngập:**
  - Bảng danh sách có phân trang, tìm kiếm, lọc theo quận và mức độ nguy cơ.
  - Nút "Thêm điểm ngập mới": Mở Form nhập liệu kết hợp Bản đồ con (Mini Map Pinpointer). Quản trị viên chỉ cần click vào mặt đường trên bản đồ con, tọa độ Kinh độ/Vĩ độ tự động điền vào Form mà không cần nhập số thủ công.
  - Nút Sửa / Xóa (Có modal xác nhận màu đỏ cảnh báo trước khi xóa vĩnh viễn).
- **Quản lý Cảnh báo Thời gian thực:**
  - Form phát hành cảnh báo: Chọn phạm vi (Quận hoặc Điểm cụ thể), chọn mức cảnh báo (Đỏ/Cam/Vàng), nhập nội dung khuyến cáo và thời gian hiệu lực (VD: Hết hạn sau 4 tiếng).
- **Công cụ Dữ liệu GIS:**
  - Nút xuất file `GeoJSON` tải về máy để phục vụ mở trên QGIS.
  - Nút nạp dữ liệu từ file `GeoJSON`.

---

## 3. TRẢI NGHIỆM NGƯỜI DÙNG & XỬ LÝ TRẠNG THÁI (UX STATES)
- **Trạng thái Đang tải (Loading State):** Hiển thị khung xương xám nhấp nháy (Skeleton Loading) cho danh sách thẻ và spinner đồng bộ màu xanh nước biển cho bản đồ.
- **Trạng thái Trống (Empty State):** Khi tìm kiếm không có kết quả hoặc trong bán kính quét không có điểm ngập nào, hiển thị hình minh họa thân thiện kèm thông điệp: *"Khu vực bạn chọn hiện an toàn, không nằm trong vùng nguy cơ ngập úng"*.
- **Thông báo Phản hồi (Toast Notifications):** Thông báo xanh lá khi thêm/sửa thành công, thông báo đỏ khi có lỗi mạng hoặc API quá tải.
- **Khả năng Truy cập Di động:** Trên smartphone, Sidebar tự động thu gọn thành bảng điều khiển trượt từ dưới lên (Bottom Sheet) để ưu tiên tối đa diện tích hiển thị bản đồ.
