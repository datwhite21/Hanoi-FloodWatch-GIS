import { Request, Response, NextFunction } from 'express';
import { geojsonService } from '../services/geojson.service.js';

export const geojsonController = {
  async exportPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geojson = await geojsonService.exportPoints();
      res.setHeader('Content-Type', 'application/geo+json');
      res.setHeader('Content-Disposition', 'attachment; filename="hanoi-flood-points.geojson"');
      res.status(200).json(geojson);
    } catch (error) {
      next(error);
    }
  },

  async importPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await geojsonService.importPoints(req.body);
      res.status(200).json({
        success: true,
        message: `Đã nhập thành công ${result.inserted} điểm ngập vào hệ thống`,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
