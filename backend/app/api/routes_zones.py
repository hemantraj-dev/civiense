from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.session import get_db
from app.models.entities import Zone, CitizenReport
from app.services.zone_service import zone_service
from app.services.risk_engine import risk_engine
from app.services.weather_service import weather_service
from app.services.drainage_service import drainage_service
from app.services.terrain_service import terrain_service

router = APIRouter(prefix="/zones", tags=["Zones & Zone Intelligence"])

@router.get("")
def get_zones(db: Session = Depends(get_db)):
    """Returns all 34 pilot study zones in Chandigarh, Mohali, Kharar, CU Gharuan, and Zirakpur."""
    zones = zone_service.get_all_zones(db)
    weather = weather_service.get_weather_data()
    r24 = weather.get("rainfall_24h_mm", 14.5)
    f6 = weather.get("forecast_6h_mm", 8.4)
    prob = weather.get("precipitation_probability", 35.0)

    # Attach live calculated risk summary for GIS map rendering
    reports = db.query(CitizenReport).all()
    v_map = {}
    for r in reports:
        if r.verification_status == "Verified" and r.zone_id:
            v_map[r.zone_id] = v_map.get(r.zone_id, 0) + 1

    results = []
    for z in zones:
        assessment = risk_engine.assess_zone(
            zone_code=z.zone_code,
            zone_name=z.zone_name,
            category=z.category,
            rainfall_24h_mm=r24,
            forecast_6h_mm=f6,
            precip_prob=prob,
            relative_elevation_diff_m=z.relative_elevation_diff_m,
            mapped_drainage_count=1 if z.category in ["Commercial Core", "Wholesale Market"] else 0,
            mapped_drainage_length_m=1200.0,
            verified_citizen_reports_count=v_map.get(z.id, 0)
        )

        results.append({
            "id": z.id,
            "zone_code": z.zone_code,
            "zone_name": z.zone_name,
            "district": z.district,
            "category": z.category,
            "representative_latitude": z.representative_latitude,
            "representative_longitude": z.representative_longitude,
            "elevation_m": z.elevation_m,
            "relative_elevation_diff_m": z.relative_elevation_diff_m,
            "boundary_geojson": z.boundary_geojson,
            "is_illustrative_boundary": z.is_illustrative_boundary,
            "current_risk_score": assessment["overall_risk_score"],
            "risk_category": assessment["risk_category"],
            "confidence_level": assessment["confidence_level"],
            "recommended_action": assessment["recommended_action"]
        })
    return results

@router.get("/{zone_id}")
def get_zone_by_id(zone_id: int, db: Session = Depends(get_db)):
    zone = zone_service.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {
        "id": zone.id,
        "zone_code": zone.zone_code,
        "zone_name": zone.zone_name,
        "district": zone.district,
        "category": zone.category,
        "representative_latitude": zone.representative_latitude,
        "representative_longitude": zone.representative_longitude,
        "elevation_m": zone.elevation_m,
        "relative_elevation_diff_m": zone.relative_elevation_diff_m,
        "boundary_geojson": zone.boundary_geojson,
        "is_illustrative_boundary": zone.is_illustrative_boundary
    }

@router.get("/{zone_id}/intelligence")
def get_zone_intelligence(zone_id: int, db: Session = Depends(get_db)):
    zone = zone_service.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    weather = weather_service.get_weather_data()
    r24 = weather.get("rainfall_24h_mm", 14.5)
    f6 = weather.get("forecast_6h_mm", 8.4)
    prob = weather.get("precipitation_probability", 35.0)

    # Citizen reports in this zone
    reports = db.query(CitizenReport).filter(CitizenReport.zone_id == zone.id).all()
    verified_count = sum(1 for r in reports if r.verification_status == "Verified")
    unverified_count = sum(1 for r in reports if r.verification_status != "Verified")

    assessment = risk_engine.assess_zone(
        zone_code=zone.zone_code,
        zone_name=zone.zone_name,
        category=zone.category,
        rainfall_24h_mm=r24,
        forecast_6h_mm=f6,
        precip_prob=prob,
        relative_elevation_diff_m=zone.relative_elevation_diff_m,
        mapped_drainage_count=1 if zone.category in ["Commercial Core", "Wholesale Market"] else 0,
        mapped_drainage_length_m=1200.0,
        verified_citizen_reports_count=verified_count,
        unverified_reports_count=unverified_count,
        is_weather_live=weather.get("is_live", True),
        is_elevation_live=terrain_service._last_live_success is not None,
        is_drainage_live=drainage_service._is_live
    )

    return {
        "zone": {
            "id": zone.id,
            "zone_code": zone.zone_code,
            "zone_name": zone.zone_name,
            "district": zone.district,
            "category": zone.category,
            "representative_latitude": zone.representative_latitude,
            "representative_longitude": zone.representative_longitude,
            "elevation_m": zone.elevation_m,
            "relative_elevation_diff_m": zone.relative_elevation_diff_m,
            "boundary_geojson": zone.boundary_geojson,
            "is_illustrative_boundary": zone.is_illustrative_boundary
        },
        "current_risk_score": assessment["overall_risk_score"],
        "risk_category": assessment["risk_category"],
        "confidence_level": assessment["confidence_level"],
        "confidence_explanation": assessment["confidence_explanation"],
        "rainfall_indicator": assessment["rainfall_score"],
        "drainage_indicator": assessment["drainage_indicator"],
        "terrain_indicator": assessment["terrain_indicator"],
        "explanation": assessment["explanation"],
        "top_factors": assessment["top_factors"],
        "recommended_action": assessment["recommended_action"],
        "mapped_drainage_count": 2 if "Commercial" in zone.category or "Industrial" in zone.category else 1,
        "mapped_drainage_length_m": 1450.0,
        "citizen_reports_count": len(reports),
        "verified_incidents_count": verified_count,
        "last_assessed": datetime.utcnow().isoformat()
    }

