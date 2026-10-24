import { FloodPoint, FloodAlert, StatisticsOverview } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJSON<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errMessage = `Lỗi HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch {
      // Bỏ qua nếu response không phải JSON
    }
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Điểm ngập
  async getFloodPoints(params: {
    search?: string;
    district?: string;
    risk_level?: string;
    is_demo?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: FloodPoint[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.district && params.district !== 'all') query.append('district', params.district);
    if (params.risk_level && params.risk_level !== 'all') query.append('risk_level', params.risk_level);
    if (params.is_demo !== undefined) query.append('is_demo', String(params.is_demo));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON(`/flood-points${qs}`);
  },

  async getFloodPointById(id: string): Promise<{ data: FloodPoint }> {
    return fetchJSON(`/flood-points/${id}`);
  },

  async createFloodPoint(payload: Partial<FloodPoint>, token?: string): Promise<{ data: FloodPoint }> {
    return fetchJSON('/flood-points', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  },

  async updateFloodPoint(id: string, payload: Partial<FloodPoint>, token?: string): Promise<{ data: FloodPoint }> {
    return fetchJSON(`/flood-points/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  },

  async deleteFloodPoint(id: string, token?: string): Promise<{ success: boolean }> {
    return fetchJSON(`/flood-points/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // Truy vấn không gian GIS
  async getNearby(lat: number, lng: number, radiusMeters: number): Promise<{
    points: FloodPoint[];
    geojson: any;
    query: { center: { latitude: number; longitude: number }; radius_meters: number; total_found: number };
  }> {
    return fetchJSON(`/spatial/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`);
  },

  async getNearest(lat: number, lng: number, limit: number = 5): Promise<{
    points: FloodPoint[];
    geojson: any;
  }> {
    return fetchJSON(`/spatial/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
  },

  // Cảnh báo
  async getActiveAlerts(): Promise<{ data: FloodAlert[] }> {
    return fetchJSON('/alerts');
  },

  async getAllAlerts(): Promise<{ data: FloodAlert[] }> {
    return fetchJSON('/alerts?all=true');
  },

  async createAlert(payload: Partial<FloodAlert>, token?: string): Promise<{ data: FloodAlert }> {
    return fetchJSON('/alerts', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  },

  async deleteAlert(id: string, token?: string): Promise<{ success: boolean }> {
    return fetchJSON(`/alerts/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // Thống kê Dashboard
  async getStatistics(): Promise<{ data: StatisticsOverview }> {
    return fetchJSON('/statistics/overview');
  },

  // Xuất GeoJSON
  getExportGeoJSONUrl(): string {
    return `${API_BASE_URL}/export/geojson`;
  },

  async importGeoJSON(geojsonData: any, token?: string): Promise<{ inserted: number; errors: string[] }> {
    return fetchJSON('/import/geojson', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(geojsonData),
    });
  },
};
