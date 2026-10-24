// ==============================================================================
// HANOI FLOODWATCH GIS - TEST TÍCH HỢP TOÀN TRÌNH (ZERO-DEPENDENCY)
// Sử dụng Fetch API & --env-file có sẵn trong Node.js 24
// Chạy lệnh: node --env-file=.env database/scripts/test_integration.js
// ==============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Lỗi: Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env');
  process.exit(1);
}

async function runIntegrationTest() {
  console.log('=================================================================');
  console.log('🧪 KIỂM THỬ TÍCH HỢP TOÀN TRÌNH (FRONTEND ↔ BACKEND ↔ SUPABASE)');
  console.log('=================================================================');

  // 1. Thêm điểm ngập thử nghiệm trực tiếp qua Supabase REST API
  console.log('\n[BƯỚC 1] Nạp điểm ngập kiểm thử vào CSDL Supabase...');
  const newPointPayload = {
    name: '[KIỂM-THỬ-E2E] Ngã tư Phố Huế - Trần Khát Chân',
    description: 'Điểm kiểm thử tích hợp toàn trình Giai đoạn 5',
    address: 'Ngã tư Phố Huế - Trần Khát Chân, Hai Bà Trưng, Hà Nội',
    administrative_area_id: 'a8888888-8888-8888-8888-888888888888',
    location: 'POINT(105.854 21.012)',
    risk_level: 'HIGH',
    risk_score: 88,
    frequency_score: 85,
    depth_score: 90,
    duration_score: 90,
    verification_status: 'VERIFIED',
    is_demo: true,
  };

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/flood_points`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(newPointPayload),
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    throw new Error(`Thêm điểm ngập thất bại: ${errText}`);
  }

  const [inserted] = await insertRes.json();
  console.log(`✅ Đã thêm điểm ngập ID: ${inserted.id}`);

  try {
    // 2. Kiểm tra truy vấn danh sách qua Backend API
    console.log('\n[BƯỚC 2] Truy vấn điểm ngập qua Backend REST API (http://localhost:5000/api/flood-points)...');
    const apiRes = await fetch('http://localhost:5000/api/flood-points?search=Tr%E1%BA%A7n%20Kh%C3%A1t%20Ch%C3%A2n');
    const apiData = await apiRes.json();
    console.log(`✅ API trả về ${apiData.data.length} kết quả khớp.`);
    const foundPoint = apiData.data.find(p => p.id === inserted.id);
    if (!foundPoint) {
      throw new Error('Không tìm thấy điểm ngập vừa tạo qua Backend API!');
    }
    console.log(`✅ Điểm ngập: "${foundPoint.name}", Tọa độ trích xuất: [${foundPoint.latitude}, ${foundPoint.longitude}]`);

    // 3. Kiểm tra tính năng Quét Bán kính PostGIS qua API
    console.log('\n[BƯỚC 3] Kiểm tra Quét bán kính GIS 1.500m xung quanh (21.012, 105.854)...');
    const spatialRes = await fetch('http://localhost:5000/api/spatial/nearby?lat=21.012&lng=105.854&radius=1500');
    const spatialData = await spatialRes.json();
    console.log(`✅ Tìm thấy ${spatialData.points.length} điểm trong bán kính 1.500m.`);
    const spatialPoint = spatialData.points.find(p => p.id === inserted.id);
    if (!spatialPoint) {
      throw new Error('Điểm ngập không xuất hiện trong bán kính 1.500m!');
    }
    console.log(`✅ Xác nhận điểm ngập nằm trong bán kính! Cự ly: ${spatialPoint.distance_meters}m`);

    // 4. Kiểm tra qua Vite Dev Proxy (http://localhost:5173/api/...)
    console.log('\n[BƯỚC 4] Kiểm tra truy vấn xuyên suốt qua Vite Frontend Proxy (http://localhost:5173/api/health)...');
    const proxyRes = await fetch('http://localhost:5173/api/health');
    const proxyData = await proxyRes.json();
    console.log(`✅ Vite Proxy chuyển tiếp thành công: status = "${proxyData.status}"`);

    // 5. Kiểm tra thống kê Dashboard
    console.log('\n[BƯỚC 5] Kiểm tra tổng hợp thống kê Dashboard (/api/statistics/overview)...');
    const statsRes = await fetch('http://localhost:5000/api/statistics/overview');
    const statsData = await statsRes.json();
    console.log(`✅ Tổng số điểm ngập: ${statsData.data.total_points}, Số cảnh báo đang hoạt động: ${statsData.data.active_alerts_count}`);

    console.log('\n=================================================================');
    console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ TÍCH HỢP TOÀN TRÌNH ĐỀU THÀNH CÔNG 100%!');
    console.log('=================================================================');
  } finally {
    // 6. Dọn dẹp dữ liệu kiểm thử
    console.log('\n[BƯỚC 6] Dọn dẹp điểm ngập thử nghiệm khỏi CSDL Supabase...');
    await fetch(`${supabaseUrl}/rest/v1/flood_points?id=eq.${inserted.id}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    console.log('✅ Đã dọn dẹp điểm thử nghiệm sạch sẽ.');
  }
}

runIntegrationTest().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
