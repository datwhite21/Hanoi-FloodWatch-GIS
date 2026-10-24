import { alertsRepository } from '../repositories/alerts.repository.js';

export const alertsService = {
  async getActive() {
    return alertsRepository.findActive();
  },

  async getAll() {
    return alertsRepository.findAll();
  },

  async create(payload: any, userId?: string) {
    const alertData = {
      ...payload,
      created_by: userId || null,
    };
    return alertsRepository.create(alertData);
  },

  async update(id: string, payload: any) {
    return alertsRepository.update(id, payload);
  },

  async delete(id: string) {
    return alertsRepository.delete(id);
  },
};
