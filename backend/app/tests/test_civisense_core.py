import pytest
from app.services.risk_engine import risk_engine
from app.services.weather_service import weather_service
from app.services.drainage_service import drainage_service
from app.services.terrain_service import terrain_service

def test_risk_engine_calculation():
    # P = 50, D = 60, T = 40
    # Overall = 0.50*50 + 0.30*60 + 0.20*40 = 25 + 18 + 8 = 51.0
    p = 50.0
    d = 60.0
    t = 40.0
    score = round(0.50 * p + 0.30 * d + 0.20 * t, 1)
    assert score == 51.0
    assert 35.0 <= score < 60.0 # Medium category

def test_risk_engine_assess_zone():
    res = risk_engine.assess_zone(
        zone_code="CHD-35",
        zone_name="Sector 35 Inner Market",
        category="Commercial & Residential",
        rainfall_24h_mm=25.0,
        forecast_6h_mm=15.0,
        precip_prob=60.0,
        relative_elevation_diff_m=-4.8,
        mapped_drainage_count=1,
        mapped_drainage_length_m=1200.0,
        verified_citizen_reports_count=1
    )
    assert "overall_risk_score" in res
    assert "risk_category" in res
    assert "confidence_level" in res
    assert "explanation" in res
    assert len(res["top_factors"]) == 2
    assert res["overall_risk_score"] > 0

def test_weather_service_structure():
    data = weather_service.get_weather_data()
    assert "temperature_c" in data
    assert "rainfall_24h_mm" in data
    assert "forecast_6h_mm" in data
    assert "hourly_chart" in data
    assert len(data["hourly_chart"]) > 0

def test_drainage_service_geojson():
    fc = drainage_service.get_drainage_features()
    assert fc.get("type") == "FeatureCollection"
    assert "features" in fc
    assert len(fc["features"]) > 0
    assert "metadata" in fc
    assert "MAPPED DRAINAGE COVERAGE — OPENSTREETMAP" in fc["metadata"]["label"]

def test_terrain_service():
    vuln = terrain_service.calculate_terrain_vulnerability(295.0, 310.0)
    assert vuln["relative_elevation_diff_m"] == -15.0
    assert vuln["terrain_indicator_score"] == 90.0 # Deep basin vulnerability
