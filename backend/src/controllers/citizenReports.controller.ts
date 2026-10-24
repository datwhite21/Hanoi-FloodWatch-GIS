import { Request, Response, NextFunction } from 'express';
import { citizenReportsService } from '../services/citizenReports.service.js';

export const citizenReportsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await citizenReportsService.createReport(req.body);
      res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn! Báo cáo ngập úng đã được gửi lên hệ thống và hiển thị thời gian thực.',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await citizenReportsService.getActiveReports();
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  },

  async upvote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await citizenReportsService.upvoteReport(id);
      res.status(200).json({
        success: true,
        message: 'Đã xác thực (+1) cho báo cáo ngập úng này',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
