from fastapi import APIRouter
from app.services.drainage_service import drainage_service

router = APIRouter(prefix="/drainage", tags=["Drainage & Waterways (OSM)"])

@router.get("/features")
def get_drainage_features():
    """
    Returns mapped waterways, canals, rivers, and ditches in GeoJSON FeatureCollection format.
    Attribution: OpenStreetMap community mapped coverage.
    """
    return drainage_service.get_drainage_features()

@router.get("/summary")
def get_drainage_summary():
    """
    Returns aggregate statistics of mapped drainage lines, total length, feature counts, and limitations.
    """
    return drainage_service.get_summary()

