import { Router } from 'express';
import { ingestionController } from '../controllers/ingestion.controller.js';

const router = Router();

// Endpoint kích hoạt chu kỳ thu thập (GitHub Actions cron hoặc Admin)
router.post('/trigger', ingestionController.triggerIngestion);

// Endpoint xem nhật ký các chu kỳ thu thập
router.get('/logs', ingestionController.getIngestionLogs);

export default router;
