import { 
  CityOverview, 
  WeatherCurrent, 
  ZoneItem, 
  ZoneIntelligence, 
  CitizenReport, 
  ActionOrder, 
  ScenarioPreset, 
  ScenarioResponse, 
  DataSourceStatus,
  HourlyChartPoint
} from '../types';

const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const isPlaceholder = !envUrl || envUrl.includes('your-backend-url') || envUrl === '';
const rawUrl = isPlaceholder ? (import.meta.env.PROD ? '' : 'http://127.0.0.1:8001') : envUrl;
const API_BASE_URL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`) : '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error [${res.status}]: ${err || res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Fetch failure for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Overview
  getOverview: () => request<CityOverview>('/analytics/overview'),
  getRiskDistribution: () => request<Array<{ name: string; count: number; fill: string }>>('/analytics/risk-distribution'),
  getRainfallTrend: () => request<HourlyChartPoint[]>('/analytics/rainfall-trend'),
  getExportCsvUrl: () => `${API_BASE_URL}/analytics/export-csv`,

  // Weather
  getWeatherCurrent: () => request<WeatherCurrent>('/weather/current'),
  getWeatherForecast: () => request<{ city: string; hourly_forecast: HourlyChartPoint[]; forecast_6h_total_mm: number; forecast_24h_total_mm: number; source: string }>('/weather/forecast'),
  getWeatherHistory: () => request<{ city: string; hourly_history: HourlyChartPoint[]; rainfall_24h_mm: number; rainfall_72h_mm: number; source: string }>('/weather/history'),

  // Drainage
  getDrainageFeatures: () => request<any>('/drainage/features'),
  getDrainageSummary: () => request<{ total_features: number; total_length_km: number; feature_type_counts: Record<string, number>; coverage_label: string; limitations: string; retrieved_at: string; is_live: boolean }>('/drainage/summary'),

  // Zones & Intelligence
  getZones: () => request<ZoneItem[]>('/zones'),
  getZoneIntelligence: (zoneId: number) => request<ZoneIntelligence>(`/zones/${zoneId}/intelligence`),

  // Risk assessments
  getRiskAssessments: () => request<Array<any>>('/risk/assessments'),
  calculateCustomRisk: (payload: { rainfall_mm_24h: number; forecast_6h_mm: number; relative_elevation_diff_m: number; mapped_drainage_density: number; has_citizen_incidents: boolean }) =>
    request<any>('/risk/assess', { method: 'POST', body: JSON.stringify(payload) }),

  // Citizen reports
  getReports: () => request<CitizenReport[]>('/reports'),
  submitReport: (payload: { location_name: string; latitude: number; longitude: number; description: string; reporter_name?: string; reporter_contact?: string; severity?: string; water_depth_cm?: number; image_url?: string }) =>
    request<{ message: string; report_number: string; id: number; is_potential_duplicate: boolean; status: string }>('/reports', { method: 'POST', body: JSON.stringify(payload) }),
  updateReportStatus: (reportId: number, status: string, notes?: string) =>
    request<{ message: string; id: number; verification_status: string }>(`/reports/${reportId}/status`, { method: 'PATCH', body: JSON.stringify({ verification_status: status, operator_notes: notes }) }),

  // Actions
  getActions: () => request<ActionOrder[]>('/actions'),
  createAction: (payload: { zone_id: number; action_type: string; description: string; priority?: string; assigned_team?: string; operator_notes?: string }) =>
    request<{ message: string; id: number; action_code: string; status: string }>('/actions', { method: 'POST', body: JSON.stringify(payload) }),
  updateAction: (actionId: number, payload: { status?: string; priority?: string; assigned_team?: string; operator_notes?: string }) =>
    request<{ message: string; id: number; action_code: string; status: string }>(`/actions/${actionId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Decision Lab
  getScenarioPresets: () => request<ScenarioPreset[]>('/scenarios/presets'),
  simulateScenario: (payload: { scenario_name: string; rainfall_modifier: number; drainage_stress_modifier: number; terrain_vulnerability_modifier: number }) =>
    request<ScenarioResponse>('/scenarios/simulate', { method: 'POST', body: JSON.stringify(payload) }),

  // Data Trust
  getDataSourcesStatus: () => request<DataSourceStatus[]>('/data-sources/status'),
  refreshDataSources: () => request<any>('/data-sources/refresh', { method: 'POST' })
};

