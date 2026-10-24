import { app } from './app.js';
import { env } from './config/env.js';
import { ingestionWorker } from './workers/ingestion.worker.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===============================================================');
  console.log(`🌊 VIETNAM FLOODWATCH GIS - BACKEND REST API IS RUNNING`);
  console.log(`🌐 Cổng lắng nghe: http://localhost:${PORT}`);
  console.log(`📡 Môi trường:    ${env.NODE_ENV}`);
  console.log(`🗺️ Health check:  http://localhost:${PORT}/api/health`);
  console.log(`📍 Điểm ngập:    http://localhost:${PORT}/api/flood-points`);
  console.log(`🧭 Truy vấn GIS:  http://localhost:${PORT}/api/spatial/nearby?lat=21.0268&lng=105.7942&radius=2000`);
  console.log(`🚨 Cảnh báo:     http://localhost:${PORT}/api/alerts`);
  console.log(`📊 Thống kê:     http://localhost:${PORT}/api/statistics/overview`);
  console.log(`🌦️ Thời tiết:    http://localhost:${PORT}/api/weather/current?lat=21.0285&lng=105.8542`);
  console.log(`📢 Báo cộng đồng: http://localhost:${PORT}/api/citizen-reports/active`);
  console.log('===============================================================');

  // Khởi chạy worker quan trắc vệ tinh tự động
  ingestionWorker.start();
});
