from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_code = Column(String(50), unique=True, index=True, nullable=False)
    zone_name = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False) # Chandigarh, SAS Nagar Mohali, Rupnagar/CU Gharuan, Panchkula
    category = Column(String(100), default="Urban Mixed") # Commercial, Residential, Transit, University, Industrial
    representative_latitude = Column(Float, nullable=False)
    representative_longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=310.0)
    relative_elevation_diff_m = Column(Float, default=0.0)
    boundary_geojson = Column(Text, nullable=True) # GeoJSON polygon geometry
    is_illustrative_boundary = Column(Boolean, default=True) # Honest disclosure
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    terrain_samples = relationship("TerrainSample", back_populates="zone", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="zone", cascade="all, delete-orphan")
    action_recommendations = relationship("ActionRecommendation", back_populates="zone", cascade="all, delete-orphan")
    citizen_reports = relationship("CitizenReport", back_populates="zone")

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=True)
    relative_humidity = Column(Float, nullable=True)
    precipitation_mm = Column(Float, default=0.0)
    precipitation_probability = Column(Float, default=0.0)
    rainfall_1h_mm = Column(Float, default=0.0)
    rainfall_3h_mm = Column(Float, default=0.0)
    rainfall_24h_mm = Column(Float, default=0.0)
    rainfall_72h_mm = Column(Float, default=0.0)
    forecast_6h_mm = Column(Float, default=0.0)
    forecast_24h_mm = Column(Float, default=0.0)
    observation_time = Column(DateTime, nullable=False)
    source = Column(String(100), default="Open-Meteo Forecast & Archive APIs")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

class DrainageFeature(Base):
    __tablename__ = "drainage_features"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String(100), index=True)
    feature_type = Column(String(100), nullable=False) # drain, ditch, canal, stream, river, riverbank, water
    name = Column(String(200), nullable=True)
    geometry_type = Column(String(50), default="LineString")
    coordinates_json = Column(Text, nullable=False) # GeoJSON coordinates
    available_tags_json = Column(Text, nullable=True)
    length_m = Column(Float, default=0.0)
    source = Column(String(100), default="OpenStreetMap Overpass API")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

class TerrainSample(Base):
    __tablename__ = "terrain_samples"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    resolution_label = Column(String(100), default="Copernicus DEM 90m (Open-Meteo)")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="terrain_samples")

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    location_name = Column(String(250), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    reporter_name = Column(String(100), nullable=True, default="Anonymous Citizen")
    reporter_contact = Column(String(100), nullable=True)
    severity = Column(String(50), default="Medium") # Low, Medium, High, Severe
    water_depth_cm = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    verification_status = Column(String(50), default="Submitted") # Submitted, Under Review, Verified, Rejected, Resolved
    operator_notes = Column(Text, nullable=True)
    is_potential_duplicate = Column(Boolean, default=False)
    reported_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="citizen_reports")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    rainfall_score = Column(Float, nullable=False) # 0 - 100
    drainage_indicator = Column(Float, nullable=False) # 0 - 100
    terrain_indicator = Column(Float, nullable=False) # 0 - 100
    overall_risk_score = Column(Float, nullable=False) # 0 - 100
    risk_category = Column(String(50), nullable=False) # Critical, High, Medium, Low
    confidence_level = Column(String(50), default="Medium") # High, Medium, Low
    confidence_explanation = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    top_factors_json = Column(Text, nullable=True) # JSON array of top contributing factors
    is_scenario_simulation = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="risk_assessments")

class ActionRecommendation(Base):
    __tablename__ = "action_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    action_code = Column(String(50), unique=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("risk_assessments.id"), nullable=True)
    action_type = Column(String(100), nullable=False) # Drainage inspection, Drain cleaning review, Waterlogging site verification, Road safety review, Traffic diversion assessment, Preventive maintenance
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="High") # Critical, High, Medium, Low
    assigned_team = Column(String(100), default="MCC Stormwater Maintenance Team A")
    status = Column(String(50), default="Pending Review") # Pending Review, Approved, Assigned, Inspection in Progress, Completed, Rejected
    operator_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="action_recommendations")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    input_rainfall_modifier = Column(Float, default=1.0) # multiplier
    input_drainage_modifier = Column(Float, default=1.0)
    input_terrain_modifier = Column(Float, default=1.0)
    results_json = Column(Text, nullable=True) # JSON comparison results
    created_at = Column(DateTime, default=datetime.utcnow)

class DataSourceLog(Base):
    __tablename__ = "data_source_logs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(100), nullable=False)
    dataset = Column(String(150), nullable=False)
    endpoint = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False) # LIVE / RECENT, HISTORICAL, ESTIMATED, SYNTHETIC, MISSING, STALE, ERROR
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    last_success = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    spatial_resolution = Column(String(100), nullable=True)
    geographic_coverage = Column(String(200), nullable=True)
    limitations = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)

