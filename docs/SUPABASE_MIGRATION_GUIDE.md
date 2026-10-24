# HƯỚNG DẪN THIẾT LẬP CƠ SỞ DỮ LIỆU TRÊN SUPABASE (DÀNH CHO BẠN)
# VIETNAM FLOODWATCH GIS

> **LƯU Ý QUAN TRỌNG:**
> Bạn **KHÔNG CẦN CÀI ĐẶT THÊM BẤT KỲ PHẦN MỀM NÀO** vào máy tính cá nhân. Tất cả thao tác đều thực hiện trực tiếp trên trình duyệt web thông qua bảng điều khiển của Supabase.
> Hệ thống hiện tại đã có cơ chế tự động dự phòng (Auto-fallback) ghi nhận điểm báo ngập vào bảng `flood_points`. Hướng dẫn dưới đây giúp bạn tạo thêm bảng chuyên biệt `citizen_reports` để hỗ trợ tính năng bình chọn (upvote) và theo dõi báo cáo cộng đồng tối ưu nhất.

---

## CÁC BƯỚC THỰC HIỆN (CHỈ MẤT 1 PHÚT)

### Bước 1: Mở Bảng Điều Khiển Supabase
1. Mở trình duyệt web và truy cập vào dự án Supabase của bạn tại:  
   👉 **[https://supabase.com/dashboard/project/drcmvyuxrsvyisuzjrmk](https://supabase.com/dashboard/project/drcmvyuxrsvyisuzjrmk)**
2. Đăng nhập vào tài khoản Supabase của bạn nếu được yêu cầu.

---

### Bước 2: Mở Công Cụ "SQL Editor"
1. Nhìn vào thanh menu màu đen bên tay trái màn hình.
2. Tìm và nhấp vào biểu tượng có hình **`SQL`** (hoặc chữ **SQL Editor**).
3. Nhấn vào nút xanh lá cây **"New query"** (hoặc dấu cộng `+`) ở góc trên để mở một trình soạn thảo mã mới.

---

### Bước 3: Dán Đoạn Mã SQL Sau Vào Trình Soạn Thảo

Bạn chỉ cần sao chép toàn bộ đoạn mã SQL bên dưới và dán vào ô soạn thảo:

```sql
-- ==============================================================================
-- BẢNG CHUYÊN BIỆT BÁO CÁO NGẬP CỘNG ĐỒNG TOÀN QUỐC (CITIZEN REPORTS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name VARCHAR(150) DEFAULT 'Người dân',
    reporter_phone VARCHAR(20),
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city_province VARCHAR(100) DEFAULT 'Toàn quốc',
    water_depth_level VARCHAR(30) NOT NULL CHECK (water_depth_level IN ('ANKLE', 'HALF_WHEEL', 'FLOOD_DEEP')),
    estimated_depth_cm NUMERIC(5, 1) DEFAULT 30.0,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED')),
    upvotes INTEGER NOT NULL DEFAULT 1 CHECK (upvotes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Tạo chỉ mục không gian PostGIS phục vụ tìm kiếm siêu tốc
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports (status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON citizen_reports (created_at DESC);

-- Bật bảo mật hàng RLS
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;

-- Cấp quyền xem cho cộng đồng
CREATE POLICY "Public Read Active Citizen Reports" 
ON citizen_reports FOR SELECT 
USING (status IN ('ACTIVE', 'VERIFIED'));

-- Cấp quyền gửi báo cáo công khai
CREATE POLICY "Public Insert Citizen Reports" 
ON citizen_reports FOR INSERT 
WITH CHECK (true);

-- Cấp quyền tăng lượt tán thành (upvote)
CREATE POLICY "Public Update Upvotes" 
ON citizen_reports FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Đưa bảng vào danh sách đồng bộ thời gian thực WebSockets
ALTER PUBLICATION supabase_realtime ADD TABLE citizen_reports;
```

---

### Bước 4: Nhấn Nút Chạy ("Run")
1. Nhấn nút xanh lá cây **"Run"** (hoặc phím tắt `Ctrl + Enter` trên Windows).
2. Khi phía dưới xuất hiện thông báo: **`Success. No rows returned`** màu xanh lá cây nghĩa là bảng `citizen_reports` đã được kích hoạt thành công 100%!

---

## TỔNG KẾT
Sau khi hoàn tất:
- Cơ sở dữ liệu của bạn đã có bảng chuyên biệt đón nhận trực tiếp mọi phản ánh ngập từ điện thoại của người dân trên toàn quốc.
- Marker sóng radar nhấp nháy sẽ tự động đồng bộ theo thời gian thực qua WebSockets.
- Bạn hoàn toàn không phải can thiệp hay cấu hình thêm biến môi trường `.env` nào khác vì backend đã tự động nhận diện sẵn.
