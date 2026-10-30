from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import TerrainSample, Zone
from app.services.terrain_service import terrain_service

router = APIRouter(prefix="/terrain", tags=["Terrain & Elevation"])

@router.get("/samples")
def get_terrain_samples(db: Session = Depends(get_db)):
    """
    Returns sampled elevation points across all pilot zones from Copernicus DEM (90m).
    """
    samples = db.query(TerrainSample).all()
    results = []
    for s in samples:
        results.append({
            "id": s.id,
            "zone_id": s.zone_id,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "elevation_m": s.elevation_m,
            "resolution": s.resolution_label,
            "retrieved_at": s.retrieved_at.isoformat() if s.retrieved_at else None
        })
    return results

@router.get("/zones/{zone_id}")
def get_zone_terrain(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    vuln = terrain_service.calculate_terrain_vulnerability(zone.elevation_m)
    return {
        "zone_code": zone.zone_code,
        "zone_name": zone.zone_name,
        "elevation_m": zone.elevation_m,
        "relative_elevation_diff_m": zone.relative_elevation_diff_m,
        "terrain_indicator_score": vuln["terrain_indicator_score"],
        "resolution": vuln["resolution"],
        "limitations": vuln["limitations"]
    }

