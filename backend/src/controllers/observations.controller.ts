import { Request, Response, NextFunction } from 'express';
import { observationsService } from '../services/observations.service.js';

export const observationsController = {
  async getByPoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pointId = req.params.pointId as string;
      const observations = await observationsService.getByPointId(pointId);
      res.status(200).json({
        success: true,
        count: observations.length,
        data: observations,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const observation = await observationsService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Đã thêm ghi nhận quan trắc ngập úng mới',
        data: observation,
      });
    } catch (error) {
      next(error);
    }
  },
};
