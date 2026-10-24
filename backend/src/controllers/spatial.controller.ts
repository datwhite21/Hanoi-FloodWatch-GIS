import { Request, Response, NextFunction } from 'express';
import { spatialService } from '../services/spatial.service.js';

export const spatialController = {
  async getNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 2000;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await spatialService.getNearby(lat, lng, radius, limit);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getNearest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await spatialService.getNearest(lat, lng, limit);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
