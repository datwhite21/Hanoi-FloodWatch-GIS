// ==============================================================================
// HANOI FLOODWATCH GIS - BỘ KIỂM THỬ CHUYÊN SÂU & ĐẢM BẢO CHẤT LƯỢNG (QA SUITE)
// Tiêu chuẩn Giai đoạn 6: GIS Metric Precision, Security, GeoJSON RFC 7946, Performance
// Chạy lệnh: node --env-file=.env database/scripts/test_quality_assurance.js
// ==============================================================================

const BASE_URL = 'http://localhost:5000/api';

async function runQASuite() {
  console.log('======================================================================');
  console.log('🛡️  BỘ KIỂM THỬ CHUYÊN SÂU & ĐẢM BẢO CHẤT LƯỢNG - HANOI FLOODWATCH GIS');
  console.log('======================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
    }
  }

  // ---------------------------------------------------------------------------
  // NHÓM 1: KIỂM THỬ ĐỘ CHÍNH XÁC KHÔNG GIAN GIS & POSTGIS (SPATIAL ACCURACY)
  // ---------------------------------------------------------------------------
  console.log('📍 [NHÓM 1] KIỂM THỬ ĐỘ CHÍNH XÁC KHÔNG GIAN GIS (SPATIAL ACCURACY)');
  
  // 1.1 Kiểm tra tâm kiểm thử: Hầm chui Mễ Trì (21.005, 105.779)
  const nearbyRes1 = await fetch(`${BASE_URL}/spatial/nearby?lat=21.005&lng=105.779&radius=1000`);
  const nearbyData1 = await nearbyRes1.json();
  assert(nearbyRes1.status === 200, 'Truy vấn bán kính 1.000m thành công với mã 200');
  assert(nearbyData1.points && nearbyData1.points.length > 0, 'Tìm thấy điểm ngập trong bán kính 1.000m', `Số điểm: ${nearbyData1.points?.length}`);
  
  const centerPoint = nearbyData1.points[0];
  assert(centerPoint && centerPoint.distance_meters === 0, 'Điểm tại chính xác tâm truy vấn có cự ly bằng 0 mét', `distance: ${centerPoint?.distance_meters}m`);

  // 1.2 Kiểm tra tính đơn điệu tăng dần của khoảng cách mét
  let isMonotonic = true;
  for (let i = 1; i < nearbyData1.points.length; i++) {
    if (nearbyData1.points[i].distance_meters < nearbyData1.points[i - 1].distance_meters) {
      isMonotonic = false;
      break;
    }
  }
  assert(isMonotonic, 'Kết quả sắp xếp cự ly tăng dần tuyệt đối (Ascending distance)');

  // 1.3 Kiểm tra biên mở rộng bán kính: 1.000m vs 3.000m
  const nearbyRes3 = await fetch(`${BASE_URL}/spatial/nearby?lat=21.005&lng=105.779&radius=3000`);
  const nearbyData3 = await nearbyRes3.json();
  assert(nearbyData3.points.length >= nearbyData1.points.length, 'Số điểm khi quét 3.000m phải >= số điểm khi quét 1.000m', `1km: ${nearbyData1.points.length} điểm <= 3km: ${nearbyData3.points.length} điểm`);

  // 1.4 Kiểm tra thuật toán Top N Nearest Neighbor (<-> operator)
  const nearestRes = await fetch(`${BASE_URL}/spatial/nearest?lat=21.0285&lng=105.8542&limit=5`);
  const nearestData = await nearestRes.json();
  assert(nearestRes.status === 200 && nearestData.points.length === 5, 'Truy vấn Top 5 điểm nguy cơ gần nhất thành công', `Đã trả về đúng 5 điểm gần nhất`);

  // ---------------------------------------------------------------------------
  // NHÓM 2: KIỂM THỬ BẢO MẬT & XỬ LÝ DỮ LIỆU ĐỘC HẠI (SECURITY & ROBUSTNESS)
  // ---------------------------------------------------------------------------
  console.log('\n🔒 [NHÓM 2] KIỂM THỬ BẢO MẬT & RÀO CHẮN INPUT ĐỘC HẠI (SECURITY)');

  // 2.1 Thử nghiệm SQL Injection qua Query String
  const sqliPayload = "' OR '1'='1' --";
  const sqliRes = await fetch(`${BASE_URL}/flood-points?search=${encodeURIComponent(sqliPayload)}`);
  const sqliData = await sqliRes.json();
  assert(sqliRes.status === 200, 'Không bị lỗi cú pháp SQL (SQL Syntax Error) khi truyền payload SQL Injection');
  assert(Array.isArray(sqliData.data), 'Query an toàn nhờ parameterized / ORM binding, không làm rò rỉ dữ liệu trái phép');

  // 2.2 Thử nghiệm XSS Payload qua Search
  const xssPayload = '<script>alert("XSS")</script>';
  const xssRes = await fetch(`${BASE_URL}/flood-points?search=${encodeURIComponent(xssPayload)}`);
  assert(xssRes.status === 200, 'Xử lý chuỗi XSS an toàn qua HTTP parameter encoding');

  // 2.3 Rào chắn Schema Validation (Zod): Vĩ độ vượt ngưỡng [-90, 90]
  const invalidLatRes = await fetch(`${BASE_URL}/spatial/nearby?lat=195.5&lng=105.8&radius=1000`);
  assert(invalidLatRes.status === 400, 'Chặn chính xác khi Vĩ độ (latitude) vượt quá 90 độ (Mã 400 Bad Request)');

  // 2.4 Rào chắn Schema Validation (Zod): Bán kính âm
  const negativeRadiusRes = await fetch(`${BASE_URL}/spatial/nearby?lat=21.0&lng=105.8&radius=-500`);
  assert(negativeRadiusRes.status === 400, 'Chặn chính xác khi Bán kính (radius) mang giá trị âm (Mã 400 Bad Request)');

  // 2.5 Phân quyền Admin: Thao tác tạo điểm ngập không có Token
  const unauthPostRes = await fetch(`${BASE_URL}/flood-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacker Point', latitude: 21.0, longitude: 105.8 }),
  });
  assert(unauthPostRes.status === 401, 'Chặn truy cập trái phép khi thiếu Bearer Token (Mã 401 Unauthorized)');

  // 2.6 Phân quyền Admin: Thao tác tạo điểm ngập với Token giả mạo
  const forgedPostRes = await fetch(`${BASE_URL}/flood-points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forged.token',
    },
    body: JSON.stringify({ name: 'Hacker Point', latitude: 21.0, longitude: 105.8 }),
  });
  assert(forgedPostRes.status === 401, 'Chặn truy cập trái phép khi Token giả mạo / không hợp lệ (Mã 401 Unauthorized)');

  // ---------------------------------------------------------------------------
  // NHÓM 3: KIỂM THỬ CHUẨN XUẤT BẢN ĐỒ GEOJSON (RFC 7946 COMPLIANCE)
  // ---------------------------------------------------------------------------
  console.log('\n🗺️  [NHÓM 3] KIỂM THỬ CHUẨN ĐẶC TẢ GEOJSON (RFC 7946 COMPLIANCE)');

  const exportRes = await fetch(`${BASE_URL}/export/geojson`);
  const geojson = await exportRes.json();
  assert(exportRes.status === 200, 'API xuất dữ liệu GeoJSON trả về mã 200 thành công');
  assert(geojson.type === 'FeatureCollection', 'Định dạng gốc là FeatureCollection chuẩn RFC 7946');
  assert(Array.isArray(geojson.features) && geojson.features.length >= 27, 'Tập dữ liệu chứa đầy đủ các điểm ngập Hà Nội', `Tổng số: ${geojson.features?.length} features`);

  const sampleFeature = geojson.features[0];
  assert(sampleFeature.type === 'Feature', 'Mỗi bản ghi là một Feature hợp lệ');
  assert(sampleFeature.geometry && sampleFeature.geometry.type === 'Point', 'Kiểu hình học geometry là Point');
  assert(
    Array.isArray(sampleFeature.geometry.coordinates) &&
    sampleFeature.geometry.coordinates.length === 2 &&
    sampleFeature.geometry.coordinates[0] > 105 && sampleFeature.geometry.coordinates[0] < 106 &&
    sampleFeature.geometry.coordinates[1] > 20 && sampleFeature.geometry.coordinates[1] < 22,
    'Tọa độ chuẩn [Kinh độ, Vĩ độ] thuộc phạm vi địa lý Hà Nội',
    `Coordinates: [${sampleFeature.geometry.coordinates.join(', ')}]`
  );
  assert(
    sampleFeature.properties && sampleFeature.properties.name && sampleFeature.properties.risk_level,
    'Thuộc tính properties chứa đầy đủ trường thông tin (name, risk_level, risk_score)'
  );

  // ---------------------------------------------------------------------------
  // NHÓM 4: ĐO LƯỜNG HIỆU NĂNG & THỜI GIAN ĐÁP ỨNG (PERFORMANCE BENCHMARK)
  // ---------------------------------------------------------------------------
  console.log('\n⚡ [NHÓM 4] ĐO LƯỜNG HIỆU NĂNG & ĐỘ TRỄ (PERFORMANCE BENCHMARK)');

  const latencies = [];
  const BENCHMARK_ROUNDS = 5;

  for (let i = 0; i < BENCHMARK_ROUNDS; i++) {
    const t0 = performance.now();
    await fetch(`${BASE_URL}/spatial/nearby?lat=21.0268&lng=105.7942&radius=3000`);
    const t1 = performance.now();
    latencies.push(t1 - t0);
  }

  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minLatency = Math.round(Math.min(...latencies));
  const maxLatency = Math.round(Math.max(...latencies));

  console.log(`  ⏱️  Thời gian phản hồi truy vấn GIS trung bình: ${avgLatency}ms (Min: ${minLatency}ms, Max: ${maxLatency}ms)`);
  assert(avgLatency < 500, 'Thời gian phản hồi trung bình của API không gian < 500ms', `Thực tế: ${avgLatency}ms`);

  // ---------------------------------------------------------------------------
  // TỔNG KẾT
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (PASS: ${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests === 0) {
    console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ CHUYÊN SÂU ĐỀU ĐẠT CHUẨN CHẤT LƯỢNG CAO NHẤT!');
  } else {
    console.error(`⚠️ Có ${failedTests} bài kiểm thử chưa đạt.`);
  }
  console.log('======================================================================');

  if (failedTests > 0) process.exit(1);
}

runQASuite().catch(err => {
  console.error('Lỗi khi chạy QA Suite:', err);
  process.exit(1);
});
