import { Router } from 'express';
import floodPointsRouter from './floodPoints.routes.js';
import spatialRouter from './spatial.routes.js';
import alertsRouter from './alerts.routes.js';
import observationsRouter from './observations.routes.js';
import statisticsRouter from './statistics.routes.js';
import geojsonRouter from './geojson.routes.js';
import authRouter from './auth.routes.js';
import weatherRouter from './weather.routes.js';
import citizenReportsRouter from './citizenReports.routes.js';
import ingestionRouter from './ingestion.routes.js';
import { ingestionWorker } from '../workers/ingestion.worker.js';

const apiRouter = Router();

// Định tuyến các module chức năng
apiRouter.use('/flood-points', floodPointsRouter);
apiRouter.use('/spatial', spatialRouter);
apiRouter.use('/alerts', alertsRouter);
apiRouter.use('/observations', observationsRouter);
apiRouter.use('/statistics', statisticsRouter);
apiRouter.use('/geojson', geojsonRouter);
apiRouter.use('/export', geojsonRouter);
apiRouter.use('/import', geojsonRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/weather', weatherRouter);
apiRouter.use('/citizen-reports', citizenReportsRouter);
apiRouter.use('/ingestion', ingestionRouter);

// Kích hoạt đồng bộ thời tiết vệ tinh thủ công
apiRouter.post('/weather/sync', async (req, res) => {
  try {
    const result = await ingestionWorker.runIngestionCycle();
    res.status(200).json({ success: true, message: 'Đã hoàn tất chu kỳ quét vệ tinh tự động', data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint phục vụ Render và giám sát
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Hanoi FloodWatch GIS API',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
  });
});

export default apiRouter;
