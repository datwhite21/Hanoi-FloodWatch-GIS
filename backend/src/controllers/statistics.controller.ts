import { Request, Response, NextFunction } from 'express';
import { statisticsService } from '../services/statistics.service.js';

export const statisticsController = {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statisticsService.getOverview();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
