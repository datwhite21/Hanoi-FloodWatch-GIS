import { Request, Response, NextFunction } from 'express';
import { alertsService } from '../services/alerts.service.js';

export const alertsController = {
  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await alertsService.getActive();
      res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await alertsService.getAll();
      res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await alertsService.create(req.body, req.user?.id);
      res.status(201).json({
        success: true,
        message: 'Đã phát hành bản tin cảnh báo thành công',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await alertsService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Đã cập nhật bản tin cảnh báo',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await alertsService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Đã hủy bỏ cảnh báo thành công',
      });
    } catch (error) {
      next(error);
    }
  },
};
