# KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. TỔNG QUAN KIẾN TRÚC 3 TẦNG (3-TIER ARCHITECTURE)

Hệ thống **Hanoi FloodWatch GIS** được thiết kế theo mô hình kiến trúc phân tầng hiện đại, phân tách độc lập giữa Giao diện người dùng (Presentation Tier), Tầng xử lý nghiệp vụ & GIS (Application/Logic Tier) và Tầng dữ liệu không gian đám mây (Data Tier).

```mermaid
graph TB
    subgraph ClientTier ["1. Presentation Tier (Tầng Giao diện)"]
        Browser["Trình duyệt Web (Desktop / Laptop)"]
        Mobile["Trình duyệt Di động (Smartphone / Tablet)"]
        CFPages["Cloudflare Pages CDN\n- Single Page Application (SPA)\n- React 18 + Vite + TypeScript\n- Leaflet + React-Leaflet (WebGIS)\n- Tailwind CSS + Recharts"]
    end

    subgraph LogicTier ["2. Application Tier (Tầng Xử lý & Nghiệp vụ GIS)"]
        Render["Render Web Service (Node.js LTS)\n- Express.js + TypeScript REST API\n- Zod Input Validation\n- Supabase JWT Verification Middleware\n- Spatial Query Builder (PostGIS)\n- Rate Limiting & CORS Guard"]
    end

    subgraph DataTier ["3. Data Tier (Tầng Dữ liệu Không gian Đám mây)"]
        SupaAuth["Supabase Auth Service\n- User Management\n- JWT Token Issuer"]
        SupaDB["Supabase Managed PostgreSQL 15+\n- PostGIS 3.x Spatial Extension\n- EPSG:4326 (WGS 84)\n- GiST Spatial Indexing\n- Row Level Security (RLS)"]
    end

    Browser -->|HTTPS / Port 443| CFPages
    Mobile -->|HTTPS / Port 443| CFPages
    CFPages -->|REST API Calls / JSON / GeoJSON| Render
    CFPages -->|Auth Flow / Login / Token| SupaAuth
    Render -->|Verify JWT Bearer Token| SupaAuth
    Render -->|Connection Pooling / Parameterized SQL| SupaDB
```

---

## 2. CHI TIẾT CÁC TẦNG CÔNG NGHỆ

### 2.1. Tầng Giao diện (Presentation Tier - Cloudflare Pages)
- **Công nghệ:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React (Icons), Recharts (Biểu đồ).
- **Thư viện GIS:** Leaflet 1.9+, React-Leaflet.
- **Nguồn bản đồ nền:** OpenStreetMap (OSM) Standard Tile Layer via HTTPS.
- **Tính năng nổi bật:**
  - Định dạng chuẩn dữ liệu bản đồ: `GeoJSON (RFC 7946)`.
  - Client-side Rendering (CSR) tối ưu, phản hồi tức thời.
  - Tự động thích ứng đa màn hình (Responsive Design).
  - Bản đồ tương tác hỗ trợ click chọn tọa độ, vẽ đường tròn bán kính, layer toggle.

### 2.2. Tầng Nghiệp vụ & GIS (Application Tier - Render)
- **Công nghệ:** Node.js LTS, Express.js, TypeScript.
- **Mô hình tổ chức mã nguồn:** Clean Layered Architecture:
  - `controllers/`: Tiếp nhận HTTP Request, trích xuất tham số, gọi Service, trả về HTTP Response chuẩn.
  - `services/`: Xử lý logic nghiệp vụ, tính toán điểm nguy cơ (RiskScore), điều phối truy vấn không gian.
  - `repositories/`: Tương tác trực tiếp với PostgreSQL/PostGIS thông qua SQL tham số hóa (Parameterized queries với `pg` pool).
  - `middlewares/`: Kiểm tra JWT, phân quyền Admin/Public, validate schema bằng Zod, bắt lỗi tập trung (Error Handler), giới hạn tần suất gọi (Rate Limiting).
- **Tính năng GIS chuyên sâu:**
  - Không tính khoảng cách Euclid thông thường trên độ (degree).
  - Ép kiểu không gian sang `geography` để tính toán chính xác theo đơn vị mét/kilômét trên bề mặt cầu elipsoid Trái Đất (WGS 84).

### 2.3. Tầng Dữ liệu Không gian (Data Tier - Supabase Cloud)
- **Hệ quản trị CSDL:** PostgreSQL 15+ tích hợp **PostGIS Extension**.
- **Hệ quy chiếu tọa độ:** WGS 84 (`SRID = 4326`), tương thích trực tiếp với GPS toàn cầu và bản đồ OpenStreetMap.
- **Cơ chế tối ưu hóa truy vấn:**
  - Đánh chỉ mục không gian `USING GIST (location)`.
  - Cơ chế Connection Pooling để tránh quá tải kết nối.
- **An ninh dữ liệu:**
  - Row Level Security (RLS) bảo vệ mức dòng dữ liệu.
  - Tách biệt schema public và bảo vệ bảng nhạy cảm.

---

## 3. LUỒNG XỬ LÝ TRUY VẤN KHÔNG GIAN (SPATIAL QUERY WORKFLOW)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Client)
    participant UI as WebGIS UI (Leaflet)
    participant API as Backend (Express API)
    participant DB as Supabase (PostGIS)

    User->>UI: Click chọn vị trí trên bản đồ & chọn bán kính 2km
    UI->>UI: Vẽ đường tròn bán kính 2000m (Leaflet Circle)
    UI->>API: GET /api/spatial/nearby?lat=21.0268&lng=105.7942&radius=2000
    
    Note over API: Middleware kiểm tra tham số: lat/lng hợp lệ, radius > 0
    API->>DB: Thực thi PostGIS Query:<br/>ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)<br/>kèm ST_Distance(...) AS distance_meters
    
    Note over DB: Sử dụng GiST Spatial Index quét nhanh các điểm trong phạm vi
    DB-->>API: Trả về tập bản ghi điểm ngập kèm khoảng cách (mét)
    API->>API: Chuẩn hóa dữ liệu sang cấu trúc GeoJSON FeatureCollection
    API-->>UI: Trả về HTTP 200 OK + GeoJSON Payload
    UI->>UI: Render các Marker kết quả lên bản đồ & cập nhật danh sách Sidebar
    UI-->>User: Hiển thị trực quan các điểm ngập trong bán kính 2km
```

---

## 4. CHIẾN LƯỢC TRIỂN KHAI & TỐI ƯU GÓI MIỄN PHÍ (FREE-TIER CLOUD)

1. **Khắc phục tình trạng "Ngủ đông" của Render (Cold Start):**
   - Bản miễn phí của Render sẽ tạm dừng dịch vụ sau 15 phút không có lượt truy cập (mất khoảng 30–50 giây để khởi động lại).
   - *Giải pháp:* Thiết lập endpoint `/api/health` trả về trạng thái máy chủ nhẹ nhất, đồng thời trên Frontend hiển thị thông báo trạng thái thân thiện khi máy chủ đang "thức dậy" lần đầu.
2. **Khắc phục giới hạn kết nối Supabase:**
   - Sử dụng Supabase Transaction Connection Pooler (Port 6543 hoặc Session Pooler) để quản lý kết nối hiệu quả từ Backend Node.js.
3. **CORS & Domain:**
   - Cấu hình whitelist tên miền nghiêm ngặt trên Render, chỉ cho phép origin từ Cloudflare Pages (`https://*.pages.dev`) và môi trường local development.
