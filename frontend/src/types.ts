export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type AlertLevel = 'RED' | 'ORANGE' | 'YELLOW';
export type AlertType = 'RAINFALL_THRESHOLD' | 'URGENT' | 'ADVISORY' | 'DEMO';
export type FloodStatus = 'PEAK' | 'ACTIVE' | 'RECEDED';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'REJECTED';

export interface FloodPoint {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  administrative_area_id?: string | null;
  area_name?: string | null;
  latitude: number;
  longitude: number;
  risk_level: RiskLevel;
  risk_score: number;
  frequency_score: number;
  depth_score: number;
  duration_score: number;
  verification_status: VerificationStatus;
  is_demo: boolean;
  data_source_id?: string | null;
  source_name?: string | null;
  created_at: string;
  updated_at: string;
  distance_meters?: number;
  observations?: FloodObservation[];
  active_alerts?: FloodAlert[];
}

export interface FloodObservation {
  id: string;
  flood_point_id: string;
  point_name?: string;
  observed_at: string;
  water_depth_cm: number;
  duration_minutes?: number | null;
  flood_status: FloodStatus;
  notes?: string | null;
  image_url?: string | null;
  verification_status: VerificationStatus;
}

export interface FloodAlert {
  id: string;
  flood_point_id?: string | null;
  point_name?: string | null;
  administrative_area_id?: string | null;
  area_name?: string | null;
  alert_level: AlertLevel;
  title: string;
  message: string;
  alert_type: AlertType;
  verification_status: VerificationStatus;
  started_at: string;
  expires_at: string;
}

export interface StatisticsOverview {
  total_points: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  unknown_risk_count: number;
  active_alerts_count: number;
  demo_points_count: number;
  verified_points_count: number;
  points_by_area: Array<{
    area_name: string;
    area_code: string;
    point_count: number;
    high_risk_count: number;
  }>;
}

export interface UserProfile {
  id: string;
  email?: string;
  role: 'admin' | 'user';
  display_name?: string;
}
