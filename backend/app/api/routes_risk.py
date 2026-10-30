from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.entities import Zone, CitizenReport, RiskAssessment
from app.services.zone_service import zone_service
from app.services.risk_engine import risk_engine
from app.services.weather_service import weather_service
from app.schemas.dto import RiskCalculationRequest

router = APIRouter(prefix="/risk", tags=["Risk Engine & Intelligence"])

@router.get("/assessments")
def get_all_assessments(db: Session = Depends(get_db)):
    """
    Returns ranked risk assessments for all 34 pilot zones for the Prevention Priority Centre.
    """
    zones = zone_service.get_all_zones(db)
    weather = weather_service.get_weather_data()
    r24 = weather.get("rainfall_24h_mm", 14.5)
    f6 = weather.get("forecast_6h_mm", 8.4)
    prob = weather.get("precipitation_probability", 35.0)

    # Pre-aggregate verified reports
    reports = db.query(CitizenReport).all()
    verified_counts = {}
    for r in reports:
        if r.verification_status == "Verified" and r.zone_id:
            verified_counts[r.zone_id] = verified_counts.get(r.zone_id, 0) + 1

    assessments = []
    for z in zones:
        res = risk_engine.assess_zone(
            zone_code=z.zone_code,
            zone_name=z.zone_name,
            category=z.category,
            rainfall_24h_mm=r24,
            forecast_6h_mm=f6,
            precip_prob=prob,
            relative_elevation_diff_m=z.relative_elevation_diff_m,
            mapped_drainage_count=1 if z.category in ["Commercial Core", "Wholesale Market"] else 0,
            mapped_drainage_length_m=1200.0,
            verified_citizen_reports_count=verified_counts.get(z.id, 0)
        )

        assessments.append({
            "zone_id": z.id,
            "zone_code": z.zone_code,
            "zone_name": z.zone_name,
            "district": z.district,
            "category": z.category,
            "overall_risk_score": res["overall_risk_score"],
            "risk_category": res["risk_category"],
            "confidence_level": res["confidence_level"],
            "confidence_explanation": res["confidence_explanation"],
            "rainfall_score": res["rainfall_score"],
            "drainage_indicator": res["drainage_indicator"],
            "terrain_indicator": res["terrain_indicator"],
            "explanation": res["explanation"],
            "top_factors": res["top_factors"],
            "recommended_action": res["recommended_action"],
            "created_at": datetime.utcnow().isoformat()
        })

    # Sort descending by risk score
    assessments.sort(key=lambda x: x["overall_risk_score"], reverse=True)
    
    # Assign ranks
    for rank, a in enumerate(assessments, start=1):
        a["priority_rank"] = rank

    return assessments

@router.post("/assess")
def calculate_custom_risk(req: RiskCalculationRequest):
    """
    Transparent rule-based risk calculation using arbitrary parameters:
    Risk Score = 0.50 * P + 0.30 * D + 0.20 * T
    """
    p = risk_engine.calculate_rainfall_score(req.rainfall_mm_24h, req.forecast_6h_mm)
    # Estimate drainage vulnerability from density
    d = max(20.0, min(90.0, 85.0 - req.mapped_drainage_density * 50.0))
    t = risk_engine.calculate_terrain_indicator(req.relative_elevation_diff_m)

    overall = round(0.50 * p + 0.30 * d + 0.20 * t, 1)
    if req.has_citizen_incidents:
        overall = min(100.0, overall + 5.0)

    category = "Critical" if overall >= 80 else "High" if overall >= 60 else "Medium" if overall >= 35 else "Low"

    return {
        "overall_risk_score": overall,
        "risk_category": category,
        "rainfall_score": p,
        "drainage_indicator": round(d, 1),
        "terrain_indicator": t,
        "formula": "Risk Score = 0.50 * Rainfall + 0.30 * Drainage + 0.20 * Terrain",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/zones/{zone_id}")
def get_zone_risk(zone_id: int, db: Session = Depends(get_db)):
    zone = zone_service.get_zone_by_id(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    weather = weather_service.get_weather_data()
    res = risk_engine.assess_zone(
        zone_code=zone.zone_code,
        zone_name=zone.zone_name,
        category=zone.category,
        rainfall_24h_mm=weather.get("rainfall_24h_mm", 14.5),
        forecast_6h_mm=weather.get("forecast_6h_mm", 8.4),
        precip_prob=weather.get("precipitation_probability", 35.0),
        relative_elevation_diff_m=zone.relative_elevation_diff_m,
        mapped_drainage_count=1,
        mapped_drainage_length_m=1200.0
    )
    return res

