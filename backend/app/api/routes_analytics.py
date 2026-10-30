import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.entities import Zone, CitizenReport, ActionRecommendation
from app.services.zone_service import zone_service
from app.services.risk_engine import risk_engine
from app.services.weather_service import weather_service
from app.services.drainage_service import drainage_service
from app.services.data_trust_service import data_trust_service

router = APIRouter(prefix="/analytics", tags=["Reports & Analytics"])

@router.get("/overview")
def get_city_overview(db: Session = Depends(get_db)):
    zones = zone_service.get_all_zones(db)
    weather = weather_service.get_weather_data()
    r24 = weather.get("rainfall_24h_mm", 14.5)
    f6 = weather.get("forecast_6h_mm", 8.4)
    prob = weather.get("precipitation_probability", 35.0)

    reports = db.query(CitizenReport).all()
    actions = db.query(ActionRecommendation).all()

    verified_reports_count = sum(1 for r in reports if r.verification_status == "Verified")
    pending_reports_count = sum(1 for r in reports if r.verification_status in ["Submitted", "Under Review"])
    active_actions_count = sum(1 for a in actions if a.status in ["Pending Review", "Approved", "Assigned", "Inspection in Progress"])

    # Score zones
    critical_zones = 0
    high_zones = 0
    medium_zones = 0
    low_zones = 0
    scores = []

    v_map = {}
    for r in reports:
        if r.verification_status == "Verified" and r.zone_id:
            v_map[r.zone_id] = v_map.get(r.zone_id, 0) + 1

    ranked_zones = []
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
            verified_citizen_reports_count=v_map.get(z.id, 0)
        )
        s = res["overall_risk_score"]
        scores.append(s)
        cat = res["risk_category"]
        if cat == "Critical":
            critical_zones += 1
        elif cat == "High":
            high_zones += 1
        elif cat == "Medium":
            medium_zones += 1
        else:
            low_zones += 1

        ranked_zones.append({
            "zone_id": z.id,
            "zone_code": z.zone_code,
            "zone_name": z.zone_name,
            "district": z.district,
            "category": z.category,
            "risk_score": s,
            "risk_category": cat,
            "confidence_level": res["confidence_level"],
            "recommended_action": res["recommended_action"]
        })

    ranked_zones.sort(key=lambda x: x["risk_score"], reverse=True)
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    return {
        "pilot_region": "Chandigarh & Punjab Tri-City Region",
        "total_zones": len(zones),
        "critical_zones": critical_zones,
        "high_priority_zones": high_zones,
        "medium_priority_zones": medium_zones,
        "low_priority_zones": low_zones,
        "average_city_risk_score": avg_score,
        "current_weather": {
            "temperature_c": weather.get("temperature_c"),
            "relative_humidity": weather.get("relative_humidity"),
            "rainfall_1h_mm": weather.get("rainfall_1h_mm"),
            "rainfall_3h_mm": weather.get("rainfall_3h_mm"),
            "rainfall_24h_mm": r24,
            "rainfall_72h_mm": weather.get("rainfall_72h_mm"),
            "forecast_6h_mm": f6,
            "forecast_24h_mm": weather.get("forecast_24h_mm"),
            "is_live": weather.get("is_live", True)
        },
        "citizen_reports_total": len(reports),
        "verified_incidents": verified_reports_count,
        "pending_inspections": pending_reports_count,
        "active_action_orders": active_actions_count,
        "data_health_summary": {
            "weather_live": weather_service._last_live_success is not None,
            "drainage_live": drainage_service._is_live,
            "providers_tracked": 5
        },
        "top_vulnerable_zones": ranked_zones[:5]
    }

@router.get("/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    overview = get_city_overview(db)
    return [
        {"name": "Critical (80-100)", "count": overview["critical_zones"], "fill": "#B94B48"},
        {"name": "High (60-79)", "count": overview["high_priority_zones"], "fill": "#D18A35"},
        {"name": "Medium (35-59)", "count": overview["medium_priority_zones"], "fill": "#D2B64B"},
        {"name": "Low (0-34)", "count": overview["low_priority_zones"], "fill": "#438A69"}
    ]

@router.get("/rainfall-trend")
def get_rainfall_trend():
    weather = weather_service.get_weather_data()
    return weather.get("hourly_chart", [])

@router.get("/export-csv")
def export_zones_csv(db: Session = Depends(get_db)):
    """Exports all 34 pilot zones, telemetry, indicators, and risk scores to CSV."""
    zones = zone_service.get_all_zones(db)
    weather = weather_service.get_weather_data()
    r24 = weather.get("rainfall_24h_mm", 14.5)
    f6 = weather.get("forecast_6h_mm", 8.4)
    prob = weather.get("precipitation_probability", 35.0)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Priority Rank", "Zone Code", "Zone Name", "District", "Category",
        "Latitude", "Longitude", "Elevation (m AMSL)", "Rel Elevation Diff (m)",
        "Rainfall Score (P)", "Drainage Indicator (D)", "Terrain Indicator (T)",
        "Overall Risk Score (0-100)", "Risk Category", "Data Confidence",
        "Top Contributing Factor", "Recommended Preventive Action"
    ])

    rows = []
    for z in zones:
        res = risk_engine.assess_zone(
            zone_code=z.zone_code,
            zone_name=z.zone_name,
            category=z.category,
            rainfall_24h_mm=r24,
            forecast_6h_mm=f6,
            precip_prob=prob,
            relative_elevation_diff_m=z.relative_elevation_diff_m,
            mapped_drainage_count=1,
            mapped_drainage_length_m=1200.0
        )
        rows.append({
            "code": z.zone_code,
            "name": z.zone_name,
            "dist": z.district,
            "cat": z.category,
            "lat": z.representative_latitude,
            "lon": z.representative_longitude,
            "elev": z.elevation_m,
            "rel_diff": z.relative_elevation_diff_m,
            "p": res["rainfall_score"],
            "d": res["drainage_indicator"],
            "t": res["terrain_indicator"],
            "score": res["overall_risk_score"],
            "category": res["risk_category"],
            "conf": res["confidence_level"],
            "top_factor": res["top_factors"][0] if res["top_factors"] else "N/A",
            "action": res["recommended_action"]
        })

    rows.sort(key=lambda x: x["score"], reverse=True)
    for rank, r in enumerate(rows, start=1):
        writer.writerow([
            rank, r["code"], r["name"], r["dist"], r["cat"],
            r["lat"], r["lon"], r["elev"], r["rel_diff"],
            r["p"], r["d"], r["t"], r["score"], r["category"],
            r["conf"], r["top_factor"], r["action"]
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=civisense_punjab_zones_risk_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

