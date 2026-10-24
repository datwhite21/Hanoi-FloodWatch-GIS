# TỔNG HỢP SƠ ĐỒ HỆ THỐNG (SYSTEM DIAGRAMS)
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. SƠ ĐỒ CA SỬ DỤNG (USE CASE DIAGRAM)

```mermaid
graph TD
    PublicUser((Người dùng công cộng\nCitizen/Public))
    AdminUser((Quản trị viên\nAdministrator))

    subgraph SystemBoundary ["HỆ THỐNG HANOI FLOODWATCH GIS"]
        UC1["UC-01: Xem bản đồ WebGIS trực quan"]
        UC2["UC-02: Lọc & Tìm kiếm điểm nguy cơ ngập"]
        UC3["UC-03: Xem chi tiết điểm ngập & lịch sử"]
        UC4["UC-04: Truy vấn điểm ngập theo bán kính"]
        UC5["UC-05: Tìm điểm ngập nguy cơ gần nhất"]
        UC6["UC-06: Xem Dashboard thống kê & cảnh báo"]
        UC7["UC-07: Xuất dữ liệu bản đồ GeoJSON"]
        
        UC8["UC-08: Đăng nhập quản trị (Supabase Auth)"]
        UC9["UC-09: Thêm/Sửa/Xóa điểm ngập (Click bản đồ)"]
        UC10["UC-10: Cập nhật quan trắc & độ sâu ngập"]
        UC11["UC-11: Phát hành & Hủy bỏ cảnh báo"]
        UC12["UC-12: Nhập dữ liệu không gian GeoJSON"]
    end

    PublicUser --> UC1
    PublicUser --> UC2
    PublicUser --> UC3
    PublicUser --> UC4
    PublicUser --> UC5
    PublicUser --> UC6
    PublicUser --> UC7

    AdminUser --> UC8
    AdminUser --> UC9
    AdminUser --> UC10
    AdminUser --> UC11
    AdminUser --> UC12
    AdminUser --> UC1
```

---

## 2. SƠ ĐỒ THỰC THỂ LIÊN KẾT TOÀN DIỆN (ERD DIAGRAM)

```mermaid
erDiagram
    PROFILES ||--o{ FLOOD_ALERTS : "ban hành"
    ADMINISTRATIVE_AREAS ||--o{ FLOOD_POINTS : "thuộc địa giới"
    DATA_SOURCES ||--o{ FLOOD_POINTS : "cung cấp tọa độ"
    DATA_SOURCES ||--o{ FLOOD_OBSERVATIONS : "nguồn quan trắc"
    DATA_SOURCES ||--o{ RAINFALL_STATIONS : "vận hành trạm"
    FLOOD_POINTS ||--o{ FLOOD_OBSERVATIONS : "lịch sử ngập"
    FLOOD_POINTS ||--o{ FLOOD_ALERTS : "có cảnh báo"
    RAINFALL_STATIONS ||--o{ RAINFALL_OBSERVATIONS : "đo lượng mưa"

    PROFILES {
        uuid id PK
        varchar display_name
        varchar role
        timestamptz created_at
    }

    ADMINISTRATIVE_AREAS {
        uuid id PK
        varchar name
        varchar administrative_code
        geometry boundary
    }

    DATA_SOURCES {
        uuid id PK
        varchar source_name
        varchar source_url
        varchar license
    }

    FLOOD_POINTS {
        uuid id PK
        varchar name
        varchar address
        geometry location "Point, 4326"
        varchar risk_level
        numeric risk_score
        boolean is_demo
    }

    FLOOD_OBSERVATIONS {
        uuid id PK
        uuid flood_point_id FK
        timestamptz observed_at
        numeric water_depth_cm
        integer duration_minutes
        varchar flood_status
    }

    RAINFALL_STATIONS {
        uuid id PK
        varchar station_name
        geometry location "Point, 4326"
    }

    RAINFALL_OBSERVATIONS {
        uuid id PK
        uuid station_id FK
        timestamptz observed_at
        numeric rainfall_mm
    }

    FLOOD_ALERTS {
        uuid id PK
        uuid flood_point_id FK
        varchar alert_level
        varchar title
        text message
        timestamptz started_at
        timestamptz expires_at
    }
```

---

## 3. SƠ ĐỒ TUẦN TỰ: TRUY VẤN BÁN KÍNH KHÔNG GIAN (SPATIAL RADIUS QUERY)

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Người dân (Mobile / Web)
    participant MapUI as Frontend Map (Leaflet)
    participant APIServer as Backend (Express + PostGIS)
    participant PostGIS as Supabase Cloud DB

    Citizen->>MapUI: Click chọn vị trí trên bản đồ & chọn bán kính 1000m
    MapUI->>MapUI: Vẽ Leaflet Circle 1000m quanh tọa độ tâm
    MapUI->>APIServer: GET /api/spatial/nearby?lat=21.0268&lng=105.7942&radius=1000
    
    APIServer->>APIServer: Kiểm tra tham số tọa độ (Lat: -90..90, Lng: -180..180, Radius: 500..5000)
    APIServer->>PostGIS: SELECT id, name, risk_level, ST_AsGeoJSON(location),<br/>ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(105.7942, 21.0268), 4326)::geography) AS dist<br/>FROM flood_points<br/>WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(105.7942, 21.0268), 4326)::geography, 1000)<br/>ORDER BY dist ASC;
    
    PostGIS-->>APIServer: Trả về các điểm ngập thỏa mãn + khoảng cách mét chính xác
    APIServer->>APIServer: Đóng gói thành GeoJSON FeatureCollection
    APIServer-->>MapUI: HTTP 200 OK (GeoJSON)
    MapUI->>MapUI: Đánh dấu Marker các điểm trong vùng & hiển thị danh sách bên Sidebar
    MapUI-->>Citizen: Hiển thị kết quả trực quan
```

---

## 4. SƠ ĐỒ TUẦN TỰ: ADMIN THÊM ĐIỂM NGẬP TỪ BẢN ĐỒ (ADMIN PINPOINT)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant AdminUI as Frontend Admin Panel
    participant APIServer as Backend Express
    participant SupaAuth as Supabase Auth
    participant PostGIS as Supabase DB

    Admin->>AdminUI: Đăng nhập Email/Password
    AdminUI->>SupaAuth: signInWithPassword()
    SupaAuth-->>AdminUI: Trả về JWT Access Token (role = admin)
    
    Admin->>AdminUI: Click trực tiếp lên bản đồ để chọn vị trí điểm ngập mới
    AdminUI->>AdminUI: Trích xuất tọa độ Lat, Lng và điền tự động vào Form
    Admin->>AdminUI: Nhập tên điểm, địa chỉ, độ sâu lịch sử & bấm "Lưu điểm ngập"
    
    AdminUI->>APIServer: POST /api/flood-points (Kèm Header Bearer JWT + Body JSON)
    APIServer->>APIServer: Verify JWT & kiểm tra role == 'admin'
    APIServer->>APIServer: Zod validation body
    APIServer->>PostGIS: INSERT INTO flood_points (name, address, location, risk_level, ...)<br/>VALUES ($1, $2, ST_SetSRID(ST_MakePoint($lng, $lat), 4326), $3, ...)
    PostGIS-->>APIServer: INSERT thành công (UUID mới)
    APIServer-->>AdminUI: HTTP 201 Created
    AdminUI-->>Admin: Hiển thị thông báo thành công & Marker mới xuất hiện trên bản đồ
```
