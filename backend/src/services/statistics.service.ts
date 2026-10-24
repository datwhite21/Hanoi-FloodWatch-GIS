import { statisticsRepository } from '../repositories/statistics.repository.js';

export const statisticsService = {
  async getOverview() {
    return statisticsRepository.getOverview();
  },
};
