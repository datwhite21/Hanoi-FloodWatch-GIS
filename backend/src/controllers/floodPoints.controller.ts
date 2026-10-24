import { Request, Response, NextFunction } from 'express';
import { floodPointsService } from '../services/floodPoints.service.js';

export const floodPointsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string,
        district: req.query.district as string,
        risk_level: req.query.risk_level as string,
        is_demo: req.query.is_demo !== undefined ? req.query.is_demo === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      };

      const result = await floodPointsService.getAll(filters);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const point = await floodPointsService.getById(id);
      res.status(200).json({
        success: true,
        data: point,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newPoint = await floodPointsService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Đã thêm điểm nguy cơ ngập mới thành công',
        data: newPoint,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await floodPointsService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Đã cập nhật thông tin điểm ngập',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await floodPointsService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Đã xóa điểm ngập thành công',
      });
    } catch (error) {
      next(error);
    }
  },
};
