import { spatialRepository } from '../repositories/spatial.repository.js';
import { FloodPoint, GeoJSONFeatureCollection } from '../types/index.js';

export function pointsToGeoJSON(points: FloodPoint[]): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        name: p.name,
        description: p.description,
        address: p.address,
        area_name: p.area_name,
        risk_level: p.risk_level,
        risk_score: p.risk_score,
        frequency_score: p.frequency_score,
        depth_score: p.depth_score,
        duration_score: p.duration_score,
        verification_status: p.verification_status,
        is_demo: p.is_demo,
        distance_meters: p.distance_meters,
        created_at: p.created_at,
      },
    })),
  };
}

export const spatialService = {
  async getNearby(lat: number, lng: number, radiusMeters: number, limit: number = 50) {
    const points = await spatialRepository.findNearby(lat, lng, radiusMeters, limit);
    return {
      query: { center: { latitude: lat, longitude: lng }, radius_meters: radiusMeters, total_found: points.length },
      geojson: pointsToGeoJSON(points),
      points,
    };
  },

  async getNearest(lat: number, lng: number, limit: number = 10) {
    const points = await spatialRepository.findNearest(lat, lng, limit);
    return {
      query: { center: { latitude: lat, longitude: lng }, limit, total_found: points.length },
      geojson: pointsToGeoJSON(points),
      points,
    };
  },
};
