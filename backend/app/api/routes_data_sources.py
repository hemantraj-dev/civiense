from fastapi import APIRouter
from app.services.data_trust_service import data_trust_service

router = APIRouter(prefix="/data-sources", tags=["Data Trust & Quality Centre"])

@router.get("/status")
def get_data_sources_status():
    """
    Returns transparency audit status for all 5 external and internal data providers:
    Open-Meteo Weather, Copernicus DEM Elevation, OpenStreetMap Overpass, GIS Reference, and Citizen Reports.
    """
    return data_trust_service.get_all_data_sources_status()

@router.post("/refresh")
def manual_data_refresh():
    """
    Manually triggers live external API requests and syncs latest telemetry.
    """
    return data_trust_service.refresh_all()

