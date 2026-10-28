import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Hanoi FloodWatch GIS - API Test Suite', () => {
  // Test 1: Kiểm tra Root Endpoint
  it('GET / - Trả về thông tin hệ thống trực tuyến', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ONLINE');
    expect(res.body).toHaveProperty('name', 'Hanoi FloodWatch GIS API');
  });

  // Test 2: Kiểm tra Health Check
  it('GET /api/health - Trả về trạng thái lành mạnh (healthy)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('system');
  });

  // Test 3: Lấy danh sách điểm ngập
  it('GET /api/flood-points - Trả về danh sách điểm ngập và phân trang', async () => {
    const res = await request(app).get('/api/flood-points?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body).toHaveProperty('geojson');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
  });

  // Test 4: Truy vấn không gian theo bán kính (Hoa Bằng, Cầu Giấy: lat 21.0268, lng 105.7942)
  it('GET /api/spatial/nearby - Truy vấn điểm ngập trong bán kính 2000m', async () => {
    const res = await request(app)
      .get('/api/spatial/nearby')
      .query({ lat: 21.0268, lng: 105.7942, radius: 2000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.geojson.type).toBe('FeatureCollection');
    expect(Array.isArray(res.body.points)).toBe(true);

    // Điểm đầu tiên phải là gần nhất và có khoảng cách mét
    if (res.body.points.length > 0) {
      expect(res.body.points[0]).toHaveProperty('distance_meters');
      expect(res.body.points[0].distance_meters).toBeLessThanOrEqual(2000);
    }
  });

  // Test 5: Tìm Top N điểm nguy cơ gần nhất
  it('GET /api/spatial/nearest - Tìm Top 5 điểm nguy cơ gần nhất', async () => {
    const res = await request(app)
      .get('/api/spatial/nearest')
      .query({ lat: 21.0268, lng: 105.7942, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.points.length).toBeLessThanOrEqual(5);
  });

  // Test 6: Kiểm tra validation tọa độ không hợp lệ
  it('GET /api/spatial/nearby - Báo lỗi 400 khi vĩ độ vượt quá khoảng [-90, 90]', async () => {
    const res = await request(app)
      .get('/api/spatial/nearby')
      .query({ lat: 999.0, lng: 105.7942, radius: 2000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('details');
  });

  // Test 7: Danh sách cảnh báo đang có hiệu lực
  it('GET /api/alerts - Lấy các cảnh báo ngập đang có hiệu lực', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Test 8: Thống kê tổng hợp Dashboard
  it('GET /api/statistics/overview - Thống kê số lượng điểm ngập và phân bổ theo quận', async () => {
    const res = await request(app).get('/api/statistics/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total_points');
    expect(res.body.data).toHaveProperty('high_risk_count');
    expect(Array.isArray(res.body.data.points_by_area)).toBe(true);
  });

  // Test 9: Kiểm tra bảo mật - Chặn thêm điểm ngập nếu không có Bearer Token
  it('POST /api/flood-points - Bị từ chối 401 khi không có JWT token', async () => {
    const res = await request(app)
      .post('/api/flood-points')
      .send({
        name: 'Điểm test không quyền',
        address: 'Hà Nội',
        latitude: 21.0,
        longitude: 105.8,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 10: Kiểm tra API Thời tiết thực tế (ECMWF / Open-Meteo)
  it('GET /api/weather/current - Trả về dữ liệu thời tiết mô hình số trị có nguồn gốc kiểm chứng', async () => {
    const res = await request(app)
      .get('/api/weather/current')
      .query({ lat: 21.0285, lng: 105.8542 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('temperature_c');
    expect(res.body.data).toHaveProperty('precipitation_mm_h');
    expect(res.body.data).toHaveProperty('valid_at');
    expect(res.body.data).toHaveProperty('data_source');
    expect(res.body.data.data_source).toContain('ECMWF');
  });

  // Test 11: Kiểm tra Trigger Ingestion (Kích hoạt chu kỳ thu thập dữ liệu)
  it(
    'POST /api/ingestion/trigger - Cho phép kích hoạt chu kỳ thu thập dữ liệu an toàn',
    async () => {
      const res = await request(app).post('/api/ingestion/trigger');
      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('checked');
      }
    },
    30000
  );

  // Test 12: Kiểm tra Nhật ký Ingestion Logs
  it('GET /api/ingestion/logs - Lấy danh sách nhật ký các chu kỳ nạp dữ liệu', async () => {
    const res = await request(app).get('/api/ingestion/logs?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
