# TÀI LIỆU ĐẶC TẢ REST API & DỊCH VỤ KHÔNG GIAN (API DOCUMENTATION)
## HỆ THỐNG HANOI FLOODWATCH GIS
**Phiên bản API:** `v1.0.0`  
**Giao thức:** RESTful API over HTTPS / HTTP  
**Định dạng dữ liệu:** `application/json` & `application/geo+json (RFC 7946)`  
**Xác thực:** Bearer Token (Supabase Auth JWT)  

---

## 1. MÃ LỖI HTTP CHUẨN (HTTP STATUS CODES)
- `200 OK`: Yêu cầu xử lý thành công.
- `201 Created`: Tạo mới tài nguyên thành công.
- `400 Bad Request`: Dữ liệu đầu vào sai định dạng (kiểm tra bởi Zod Validation).
- `401 Unauthorized`: Chưa đăng nhập hoặc Token JWT không hợp lệ/hết hạn.
- `403 Forbidden`: Quyền truy cập bị từ chối (yêu cầu role = `admin`).
- `404 Not Found`: Không tìm thấy tài nguyên với ID đã chỉ định.
- `429 Too Many Requests`: Vượt quá tần suất gửi yêu cầu cho phép (Rate Limiting).
- `500 Internal Server Error`: Lỗi máy chủ nội bộ.

---

## 2. DANH MỤC ENDPOINTS

### 2.1. Phân hệ Không gian GIS (Spatial Engine)

#### 📍 `GET /api/spatial/nearby`
Truy vấn toàn bộ các điểm nguy cơ ngập úng nằm trong bán kính $R$ mét quanh một tọa độ tâm (sử dụng PostGIS `ST_DWithin` và `ST_Distance`).
- **Quyền hạn:** Công khai (Public).
- **Query Parameters:**
  | Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
  | :--- | :---: | :---: | :---: | :--- |
  | `lat` | number | **Có** | - | Vĩ độ điểm tâm (-90 đến 90) |
  | `lng` | number | **Có** | - | Kinh độ điểm tâm (-180 đến 180) |
  | `radius` | number | Không | `2000` | Bán kính quét (đơn vị: mét, từ 100 đến 20000m) |
  | `limit` | number | Không | `50` | Số lượng điểm tối đa trả về |
- **Ví dụ Response (200 OK):**
```json
{
  "success": true,
  "query": {
    "center": { "latitude": 21.0268, "longitude": 105.7942 },
    "radius_meters": 2000,
    "total_found": 3
  },
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [105.7942, 21.0268]
        },
        "properties": {
          "id": "c1f7a8b2-...",
          "name": "Phố Hoa Bằng (Yên Hòa)",
          "address": "Phố Hoa Bằng, Phường Yên Hòa, Cầu Giấy",
          "risk_level": "HIGH",
          "risk_score": 85.75,
          "distance_meters": 0.0
        }
      }
    ]
  },
  "points": [ ... ]
}
```

#### 📍 `GET /api/spatial/nearest`
Tìm Top N điểm nguy cơ ngập gần nhất bằng toán tử k-NN (`<->`) của PostGIS.
- **Quyền hạn:** Công khai.
- **Query Parameters:** `lat` (bắt buộc), `lng` (bắt buộc), `limit` (mặc định 10).

---

### 2.2. Phân hệ Quản lý Điểm ngập (Flood Points CRUD)

#### 📍 `GET /api/flood-points`
Lấy danh sách điểm ngập kết hợp bộ lọc tìm kiếm và phân trang.
- **Quyền hạn:** Công khai.
- **Query Parameters:** `search` (tìm tên/địa chỉ), `district` (tên quận), `risk_level` (HIGH/MEDIUM/LOW), `is_demo` (true/false), `page` (trang), `limit` (số dòng/trang).

#### 📍 `GET /api/flood-points/:id`
Lấy thông tin chi tiết toàn diện của 1 điểm ngập, bao gồm tọa độ, hồ sơ lịch sử đo độ sâu ngập và các cảnh báo đang áp dụng.
- **Quyền hạn:** Công khai.

#### 📍 `POST /api/flood-points`
Thêm mới điểm nguy cơ ngập vào CSDL PostGIS (kèm chuyển đổi tọa độ WGS84).
- **Quyền hạn:** Yêu cầu quyền **Quản trị viên (Admin)** + Bearer Token.
- **Request Body (JSON):**
```json
{
  "name": "Nút giao Phạm Hùng - Mễ Trì",
  "description": "Vùng trũng chân cầu cạn, nước dồn nhanh",
  "address": "Đường Phạm Hùng, Phường Mễ Trì, Nam Từ Liêm",
  "latitude": 21.0150,
  "longitude": 105.7820,
  "frequency_score": 80,
  "depth_score": 75,
  "duration_score": 70,
  "is_demo": false
}
```

#### 📍 `PUT /api/flood-points/:id`
Cập nhật thông tin điểm ngập.
- **Quyền hạn:** Quản trị viên (Admin).

#### 📍 `DELETE /api/flood-points/:id`
Xóa điểm ngập khỏi hệ thống.
- **Quyền hạn:** Quản trị viên (Admin).

---

### 2.3. Phân hệ Cảnh báo Ngập úng (Flood Alerts)

#### 📍 `GET /api/alerts`
Lấy danh sách các cảnh báo ngập đang có hiệu lực (`expires_at > NOW()`). Nếu truyền `?all=true` sẽ lấy toàn bộ lịch sử cảnh báo.
- **Quyền hạn:** Công khai.

#### 📍 `POST /api/alerts`
Phát hành bản tin cảnh báo ngập mới.
- **Quyền hạn:** Quản trị viên (Admin).
- **Request Body:**
```json
{
  "flood_point_id": "c1f7a8b2-...",
  "alert_level": "RED",
  "title": "CẢNH BÁO KHẨN: Ngập sâu trên 50cm tại Hoa Bằng",
  "message": "Nước dồn nhanh vào ngõ trũng, các phương tiện không nên di chuyển vào khu vực này.",
  "alert_type": "URGENT",
  "expires_at": "2026-10-25T02:00:00Z"
}
```

#### 📍 `DELETE /api/alerts/:id`
Hủy bỏ / thu hồi bản tin cảnh báo trước thời hạn.
- **Quyền hạn:** Quản trị viên (Admin).

---

### 2.4. Phân hệ Quan trắc & Lịch sử Ngập (Observations)

#### 📍 `GET /api/observations/:pointId`
Lấy lịch sử các lần xảy ra ngập thực tế tại một điểm (độ sâu cm, thời gian rút nước, ảnh hiện trường).
- **Quyền hạn:** Công khai.

#### 📍 `POST /api/observations`
Ghi nhận dữ liệu đo ngập mới sau cơn mưa.
- **Quyền hạn:** Người dùng đã đăng nhập (User / Admin).

---

### 2.5. Phân hệ Thống kê Dashboard & Xuất/Nhập GeoJSON

#### 📍 `GET /api/statistics/overview`
Cung cấp toàn bộ số liệu thống kê tổng hợp phục vụ hiển thị các biểu đồ và thẻ chỉ số KPI trên Dashboard:
- Tổng số điểm theo dõi, số điểm nguy cơ Cao/Trung bình/Thấp.
- Số lượng cảnh báo đang kích hoạt.
- Phân bổ chi tiết số điểm ngập theo từng quận trọng điểm (Cầu Giấy, Thanh Xuân, Hà Đông...).

#### 📍 `GET /api/export/geojson`
Xuất toàn bộ cơ sở dữ liệu điểm ngập ra file chuẩn `hanoi-flood-points.geojson` tương thích QGIS và ArcGIS.

#### 📍 `POST /api/import/geojson`
Nhập hàng loạt điểm ngập từ file GeoJSON FeatureCollection vào CSDL.
- **Quyền hạn:** Quản trị viên (Admin).

#### 📍 `GET /api/health`
Endpoint kiểm tra sức khỏe hệ thống (Health Check) phục vụ dịch vụ Render Cloud giám sát thời gian chạy (Uptime).
