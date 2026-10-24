import { floodPointsRepository } from '../repositories/floodPoints.repository.js';
import { pointsToGeoJSON } from './spatial.service.js';

export const floodPointsService = {
  async getAll(filters: any) {
    const { data, total } = await floodPointsRepository.findAll(filters);
    return {
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        total_pages: Math.ceil(total / (filters.limit || 50)),
      },
      geojson: pointsToGeoJSON(data),
      data,
    };
  },

  async getById(id: string) {
    const point = await floodPointsRepository.findById(id);
    if (!point) {
      const err: any = new Error('Không tìm thấy điểm ngập với mã ID đã cung cấp');
      err.statusCode = 404;
      throw err;
    }
    return point;
  },

  async create(payload: any) {
    return floodPointsRepository.create(payload);
  },

  async update(id: string, payload: any) {
    await this.getById(id); // Kiểm tra tồn tại
    return floodPointsRepository.update(id, payload);
  },

  async delete(id: string) {
    await this.getById(id); // Kiểm tra tồn tại
    return floodPointsRepository.delete(id);
  },
};
