export interface WeatherCurrent {
  latitude: number;
  longitude: number;
  city: string;
  temperature_c: number;
  relative_humidity: number;
  current_precipitation_mm: number;
  precipitation_probability: number;
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_24h_mm: number;
  rainfall_72h_mm: number;
  forecast_6h_mm: number;
  forecast_24h_mm: number;
  observation_time: string;
  retrieved_at: string;
  source: string;
  attribution: string;
  is_live: boolean;
}

export interface HourlyChartPoint {
  time: string;
  precipitation_mm: number;
  precipitation_probability: number;
  temperature_c: number;
  is_forecast: boolean;
}

export interface ZoneItem {
  id: number;
  zone_code: string;
  zone_name: string;
  district: string;
  category: string;
  representative_latitude: number;
  representative_longitude: number;
  elevation_m: number;
  relative_elevation_diff_m: number;
  boundary_geojson: string;
  is_illustrative_boundary: boolean;
  current_risk_score: number;
  risk_category: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence_level: 'High' | 'Medium' | 'Low';
  recommended_action: string;
}

export interface ZoneIntelligence {
  zone: ZoneItem;
  current_risk_score: number;
  risk_category: string;
  confidence_level: string;
  confidence_explanation: string;
  rainfall_indicator: number;
  drainage_indicator: number;
  terrain_indicator: number;
  explanation: string;
  top_factors: string[];
  recommended_action: string;
  mapped_drainage_count: number;
  mapped_drainage_length_m: number;
  citizen_reports_count: number;
  verified_incidents_count: number;
  last_assessed: string;
}

export interface CitizenReport {
  id: number;
  report_number: string;
  zone_id?: number;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  reporter_name: string;
  reporter_contact?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  water_depth_cm?: number;
  image_url?: string;
  verification_status: 'Submitted' | 'Under Review' | 'Verified' | 'Rejected' | 'Resolved';
  operator_notes?: string;
  is_potential_duplicate: boolean;
  reported_at: string;
}

export interface ActionOrder {
  id: number;
  action_code: string;
  zone_id: number;
  zone_code: string;
  zone_name: string;
  action_type: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assigned_team: string;
  status: 'Pending Review' | 'Approved' | 'Assigned' | 'Inspection in Progress' | 'Completed' | 'Rejected';
  operator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  rainfall_modifier: number;
  drainage_stress_modifier: number;
  terrain_vulnerability_modifier: number;
}

export interface ScenarioZoneResult {
  zone_code: string;
  zone_name: string;
  baseline_score: number;
  baseline_category: string;
  simulated_score: number;
  simulated_category: string;
  delta: number;
  priority_rank_simulated: number;
  recommended_action: string;
}

export interface ScenarioResponse {
  scenario_name: string;
  inputs: {
    rainfall_modifier: number;
    drainage_stress_modifier: number;
    terrain_vulnerability_modifier: number;
  };
  results: ScenarioZoneResult[];
  city_average_baseline: number;
  city_average_simulated: number;
  critical_zones_count: number;
  high_zones_count: number;
}

export interface DataSourceStatus {
  provider: string;
  dataset: string;
  endpoint: string;
  status: string;
  status_code: number;
  response_time_ms: number;
  last_success: string;
  last_error?: string;
  spatial_resolution: string;
  geographic_coverage: string;
  units: string;
  limitations: string;
  retrieved_at: string;
}

export interface CityOverview {
  pilot_region: string;
  total_zones: number;
  critical_zones: number;
  high_priority_zones: number;
  medium_priority_zones: number;
  low_priority_zones: number;
  average_city_risk_score: number;
  current_weather: {
    temperature_c: number;
    relative_humidity: number;
    rainfall_1h_mm: number;
    rainfall_3h_mm: number;
    rainfall_24h_mm: number;
    rainfall_72h_mm: number;
    forecast_6h_mm: number;
    forecast_24h_mm: number;
    is_live: boolean;
  };
  citizen_reports_total: number;
  verified_incidents: number;
  pending_inspections: number;
  active_action_orders: number;
  data_health_summary: {
    weather_live: boolean;
    drainage_live: boolean;
    providers_tracked: number;
  };
  top_vulnerable_zones: Array<{
    zone_id: number;
    zone_code: string;
    zone_name: string;
    district: string;
    category: string;
    risk_score: number;
    risk_category: string;
    confidence_level: string;
    recommended_action: string;
  }>;
}

