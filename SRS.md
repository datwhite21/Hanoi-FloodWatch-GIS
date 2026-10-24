# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS - SOFTWARE REQUIREMENTS SPECIFICATION)
*Chi tiết đầy đủ: xem tại [docs/SRS.md](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/docs/SRS.md)*

## TÓM TẮT YÊU CẦU HỆ THỐNG
- **Khu vực nghiên cứu:** Hà Nội (Trọng tâm Cầu Giấy, Thanh Xuân, Hà Đông).
- **Phân loại dữ liệu:** Dữ liệu nguy cơ lịch sử, Dữ liệu ghi nhận hiện trường, Dữ liệu quan trắc mưa, Dữ liệu cảnh báo, Dữ liệu mô phỏng [DEMO].
- **Các tác nhân:** Người dùng công cộng (Public User), Quản trị viên (Administrator).
- **Chức năng chính:**
  - FR-01: Bản đồ nền OpenStreetMap + Marker phân màu (Đỏ/Cam/Xanh lá/Xám).
  - FR-02: Popup & Trang chi tiết hồ sơ điểm ngập.
  - FR-03: Điều khiển lớp bản đồ (Layer controls).
  - FR-04: Phân tích không gian bán kính (ST_DWithin, ST_Distance: 500m - 5km).
  - FR-05: Tìm điểm ngập gần nhất (Nearest Neighbor).
  - FR-06: Tìm kiếm & Lọc đa tiêu chí.
  - FR-07: Dashboard tổng quan giám sát & Biểu đồ thống kê.
  - FR-08: Mô hình chấm điểm nguy cơ RiskScore chuẩn hóa (0-100).
  - FR-09: Phát hành & Quản lý cảnh báo ngập.
  - FR-10: Xác thực quản trị viên Supabase Auth JWT.
  - FR-11: Quản lý điểm ngập CRUD (Click chọn tọa độ trên bản đồ).
  - FR-12: Nhập/Xuất chuẩn dữ liệu GIS (GeoJSON).
