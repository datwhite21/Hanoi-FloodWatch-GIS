import { floodPointsRepository } from '../repositories/floodPoints.repository.js';
import { pointsToGeoJSON } from './spatial.service.js';
import { GeoJSONFeatureCollection } from '../types/index.js';

export const geojsonService = {
  async exportPoints(): Promise<GeoJSONFeatureCollection> {
    const { data } = await floodPointsRepository.findAll({ limit: 1000 });
    return pointsToGeoJSON(data);
  },

  async importPoints(geojson: any): Promise<{ inserted: number; errors: string[] }> {
    if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
      throw new Error('Định dạng GeoJSON không hợp lệ. Yêu cầu FeatureCollection');
    }

    let inserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < geojson.features.length; i++) {
      const feat = geojson.features[i];
      try {
        if (!feat.geometry || feat.geometry.type !== 'Point' || !Array.isArray(feat.geometry.coordinates)) {
          errors.push(`Feature #${i}: Tọa độ không hợp lệ hoặc không phải kiểu Point`);
          continue;
        }

        const [lng, lat] = feat.geometry.coordinates;
        const props = feat.properties || {};

        if (!props.name || !props.address) {
          errors.push(`Feature #${i}: Thiếu trường bắt buộc name hoặc address`);
          continue;
        }

        await floodPointsRepository.create({
          name: props.name,
          description: props.description || null,
          address: props.address,
          latitude: lat,
          longitude: lng,
          frequency_score: props.frequency_score || 50,
          depth_score: props.depth_score || 50,
          duration_score: props.duration_score || 50,
          verification_status: props.verification_status || 'VERIFIED',
          is_demo: props.is_demo || false,
        });

        inserted++;
      } catch (err: any) {
        errors.push(`Feature #${i}: Lỗi khi lưu (${err.message})`);
      }
    }

    return { inserted, errors };
  },
};
