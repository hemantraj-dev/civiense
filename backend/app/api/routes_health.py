from fastapi import APIRouter
from app.core.config import settings
from datetime import datetime

router = APIRouter(tags=["Health & Configuration"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": settings.TAGLINE,
        "pilot_region": settings.PILOT_REGION,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/config")
def get_system_config():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "pilot_geography": {
            "region": settings.PILOT_REGION,
            "center_lat": settings.PILOT_LAT,
            "center_lon": settings.PILOT_LON,
            "timezone": settings.TIMEZONE
        },
        "weights": {
            "rainfall_weight": settings.WEIGHT_RAINFALL,
            "drainage_weight": settings.WEIGHT_DRAINAGE,
            "terrain_weight": settings.WEIGHT_TERRAIN
        },
        "risk_thresholds": {
            "critical": "80-100",
            "high": "60-79",
            "medium": "35-59",
            "low": "0-34"
        }
    }

