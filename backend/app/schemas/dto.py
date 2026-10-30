from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Weather Schemas ---
class WeatherCurrentResponse(BaseModel):
    latitude: float
    longitude: float
    city: str
    temperature_c: float
    relative_humidity: float
    current_precipitation_mm: float
    precipitation_probability: float
    rainfall_1h_mm: float
    rainfall_3h_mm: float
    rainfall_24h_mm: float
    rainfall_72h_mm: float
    forecast_6h_mm: float
    forecast_24h_mm: float
    observation_time: str
    retrieved_at: str
    source: str
    attribution: str
    is_live: bool

class HourlyRainfallPoint(BaseModel):
    time: str
    precipitation_mm: float
    precipitation_probability: float
    temperature_c: float
    is_forecast: bool

class WeatherForecastResponse(BaseModel):
    city: str
    hourly: List[HourlyRainfallPoint]
    forecast_6h_total_mm: float
    forecast_24h_total_mm: float
    source: str
    retrieved_at: str

# --- Drainage Schemas ---
class DrainageFeatureDTO(BaseModel):
    id: int
    osm_id: str
    feature_type: str
    name: Optional[str]
    geometry_type: str
    coordinates: Any
    tags: Optional[Dict[str, Any]]
    length_m: float
    source: str

class DrainageSummaryDTO(BaseModel):
    total_features: int
    total_length_km: float
    feature_type_counts: Dict[str, int]
    coverage_label: str
    limitations: str
    retrieved_at: str
    is_live: bool

# --- Terrain Schemas ---
class TerrainSampleDTO(BaseModel):
    latitude: float
    longitude: float
    elevation_m: float
    zone_code: Optional[str] = None
    resolution: str

class TerrainSummaryDTO(BaseModel):
    mean_elevation_m: float
    min_elevation_m: float
    max_elevation_m: float
    samples_count: int
    source_resolution: str
    limitations: str

# --- Zone Schemas ---
class ZoneDTO(BaseModel):
    id: int
    zone_code: str
    zone_name: str
    district: str
    category: str
    representative_latitude: float
    representative_longitude: float
    elevation_m: float
    relative_elevation_diff_m: float
    boundary_geojson: Optional[str] = None
    is_illustrative_boundary: bool = True

class ZoneIntelligenceDTO(BaseModel):
    zone: ZoneDTO
    current_risk_score: float
    risk_category: str
    confidence_level: str
    confidence_explanation: str
    rainfall_indicator: float
    drainage_indicator: float
    terrain_indicator: float
    explanation: str
    top_factors: List[str]
    recommended_action: str
    mapped_drainage_count: int
    mapped_drainage_length_m: float
    citizen_reports_count: int
    verified_incidents_count: int
    last_assessed: str

# --- Risk Engine Schemas ---
class RiskAssessmentDTO(BaseModel):
    zone_id: int
    zone_code: str
    zone_name: str
    overall_risk_score: float
    risk_category: str
    confidence_level: str
    confidence_explanation: str
    rainfall_score: float
    drainage_indicator: float
    terrain_indicator: float
    explanation: str
    top_factors: List[str]
    recommended_action: str
    created_at: str

class RiskCalculationRequest(BaseModel):
    rainfall_mm_24h: float
    forecast_6h_mm: float
    relative_elevation_diff_m: float
    mapped_drainage_density: float # 0 to 1
    has_citizen_incidents: bool = False

# --- Citizen Report Schemas ---
class CitizenReportCreate(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    description: str
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_contact: Optional[str] = None
    severity: str = "Medium" # Low, Medium, High, Severe
    water_depth_cm: Optional[float] = None
    image_url: Optional[str] = None

class CitizenReportUpdateStatus(BaseModel):
    verification_status: str # Submitted, Under Review, Verified, Rejected, Resolved
    operator_notes: Optional[str] = None

class CitizenReportDTO(BaseModel):
    id: int
    report_number: str
    location_name: str
    latitude: float
    longitude: float
    description: str
    reporter_name: str
    reporter_contact: Optional[str]
    severity: str
    water_depth_cm: Optional[float]
    image_url: Optional[str]
    verification_status: str
    operator_notes: Optional[str]
    is_potential_duplicate: bool
    reported_at: str
    created_at: str

# --- Action Schemas ---
class ActionCreate(BaseModel):
    zone_id: int
    action_type: str
    description: str
    priority: str = "High"
    assigned_team: Optional[str] = "MCC Stormwater Rapid Response Team"
    operator_notes: Optional[str] = None

class ActionUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_team: Optional[str] = None
    operator_notes: Optional[str] = None

class ActionDTO(BaseModel):
    id: int
    action_code: str
    zone_id: int
    zone_code: str
    zone_name: str
    action_type: str
    description: str
    priority: str
    assigned_team: str
    status: str
    operator_notes: Optional[str]
    created_at: str
    updated_at: str

# --- Scenario Simulation Schemas ---
class ScenarioSimulateRequest(BaseModel):
    scenario_name: str = "Custom Scenario"
    rainfall_modifier: float = 1.0 # 0.0 to 3.0
    drainage_stress_modifier: float = 1.0 # 0.5 to 2.0 (higher means worse drainage)
    terrain_vulnerability_modifier: float = 1.0 # 0.8 to 1.5

class ScenarioZoneResult(BaseModel):
    zone_code: str
    zone_name: str
    baseline_score: float
    baseline_category: str
    simulated_score: float
    simulated_category: str
    delta: float
    priority_rank_simulated: int
    recommended_action: str

class ScenarioSimulateResponse(BaseModel):
    scenario_name: str
    inputs: ScenarioSimulateRequest
    results: List[ScenarioZoneResult]
    city_average_baseline: float
    city_average_simulated: float
    critical_zones_count: int
    high_zones_count: int

# --- Data Trust Schemas ---
class DataSourceStatusDTO(BaseModel):
    provider: str
    dataset: str
    endpoint: str
    status: str # LIVE / RECENT, HISTORICAL, ESTIMATED, SYNTHETIC, MISSING, STALE, ERROR
    status_code: Optional[int]
    response_time_ms: Optional[float]
    last_success: Optional[str]
    last_error: Optional[str]
    spatial_resolution: Optional[str]
    geographic_coverage: Optional[str]
    limitations: Optional[str]
    units: str
    retrieved_at: str

