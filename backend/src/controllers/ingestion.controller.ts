import { Request, Response, NextFunction } from 'express';
import { ingestionWorker } from '../workers/ingestion.worker.js';
import { supabaseAdmin } from '../config/supabase.js';

export const ingestionController = {
  /**
   * Kích hoạt chu kỳ thu thập dữ liệu tự động (Dùng cho GitHub Actions Scheduler hoặc Admin)
   */
  async triggerIngestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const secretToken = process.env.INGESTION_SECRET_TOKEN;
      const authHeader = req.headers.authorization;

      // Kiểm tra bảo mật nếu biến môi trường INGESTION_SECRET_TOKEN được thiết lập
      if (secretToken) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED: Thiếu Bearer Token bảo vệ endpoint ingestion.',
          });
          return;
        }

        const providedToken = authHeader.split(' ')[1];
        if (providedToken !== secretToken) {
          res.status(403).json({
            success: false,
            error: 'FORBIDDEN: Ingestion token không chính xác.',
          });
          return;
        }
      }

      console.log('[IngestionController] Nhận tín hiệu kích hoạt chu kỳ Ingestion từ client...');
      const result = await ingestionWorker.runIngestionCycle();

      res.status(200).json({
        success: true,
        message: 'Hoàn tất chu kỳ thu thập dữ liệu khí tượng số trị ECMWF',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy lịch sử các chu kỳ thu thập dữ liệu gần nhất từ bảng ingestion_logs
   */
  async getIngestionLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const { data, error } = await supabaseAdmin
        .from('ingestion_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Nếu bảng chưa được tạo, trả về mảng rỗng thay vì ném lỗi 500
        res.status(200).json({
          success: true,
          count: 0,
          data: [],
          note: 'Bảng ingestion_logs chưa tồn tại hoặc chưa có nhật ký.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        count: data?.length || 0,
        data: data || [],
      });
    } catch (error) {
      next(error);
    }
  },
};
