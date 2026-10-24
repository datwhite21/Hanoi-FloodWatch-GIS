import { observationsRepository } from '../repositories/observations.repository.js';
import { floodPointsRepository } from '../repositories/floodPoints.repository.js';

export const observationsService = {
  async getByPointId(pointId: string) {
    return observationsRepository.findByPointId(pointId);
  },

  async create(payload: any) {
    // Kiểm tra điểm ngập tồn tại
    const point = await floodPointsRepository.findById(payload.flood_point_id);
    if (!point) {
      const err: any = new Error('Điểm ngập không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const obs = await observationsRepository.create(payload);

    // Cập nhật lại depth_score của điểm ngập nếu cần
    if (payload.water_depth_cm > 0) {
      const currentDepthScore = point.depth_score || 50;
      const newScore = Math.min(100, Math.max(currentDepthScore, payload.water_depth_cm * 1.5));
      await floodPointsRepository.update(point.id, { depth_score: newScore });
    }

    return obs;
  },

  async update(id: string, payload: any) {
    return observationsRepository.update(id, payload);
  },
};
