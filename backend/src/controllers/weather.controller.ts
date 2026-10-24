import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service.js';

export const weatherController = {
  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Mặc định là tọa độ trung tâm Hà Nội nếu người dùng không truyền GPS
      const lat = parseFloat(req.query.lat as string) || 21.0285;
      const lng = parseFloat(req.query.lng as string) || 105.8542;

      const weather = await weatherService.getCurrentWeather(lat, lng);
      res.status(200).json({
        success: true,
        data: weather,
      });
    } catch (error) {
      next(error);
    }
  },
};
