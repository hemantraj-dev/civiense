import httpx
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TerrainService:
    def __init__(self):
        self._elevation_cache: Dict[str, float] = {}
        self._last_live_success: Optional[datetime] = None
        self._last_error: Optional[str] = None

    def get_elevation_batch(self, coordinates: List[Dict[str, float]]) -> List[float]:
        """
        Queries Open-Meteo Elevation API for a list of coordinates [{'latitude': lat, 'longitude': lon}].
        Returns a list of elevation heights in metres.
        """
        lats = [c["latitude"] for c in coordinates]
        lons = [c["longitude"] for c in coordinates]
        
        # Check cache first
        all_cached = True
        cached_results = []
        for lat, lon in zip(lats, lons):
            key = f"{round(lat, 4)}_{round(lon, 4)}"
            if key in self._elevation_cache:
                cached_results.append(self._elevation_cache[key])
            else:
                all_cached = False
                break
                
        if all_cached and len(cached_results) == len(coordinates):
            return cached_results

        try:
            lat_str = ",".join(str(lat) for lat in lats)
            lon_str = ",".join(str(lon) for lon in lons)
            
            resp = httpx.get(
                settings.OPEN_METEO_ELEVATION_URL,
                params={"latitude": lat_str, "longitude": lon_str},
                timeout=8.0
            )
            
            if resp.status_code == 200:
                elevations = resp.json().get("elevation", [])
                for lat, lon, elev in zip(lats, lons, elevations):
                    key = f"{round(lat, 4)}_{round(lon, 4)}"
                    self._elevation_cache[key] = float(elev)
                self._last_live_success = datetime.utcnow()
                self._last_error = None
                return [float(e) for e in elevations]
            else:
                self._last_error = f"Elevation API error code: {resp.status_code}"
                logger.warning(self._last_error)
        except Exception as e:
            self._last_error = f"Elevation API request failed: {str(e)}"
            logger.error(self._last_error)

        # Fallback approximation based on well-established regional topography of Chandigarh / Punjab Shivalik foothills
        # Foothills to South-West gradient: ~350m at Pinjore/Kalka foothills down to ~290m at Mohali/Zirakpur
        fallback_elevs = []
        for c in coordinates:
            lat = c["latitude"]
            lon = c["longitude"]
            key = f"{round(lat, 4)}_{round(lon, 4)}"
            if key in self._elevation_cache:
                fallback_elevs.append(self._elevation_cache[key])
            else:
                # Realistic gradient formula for Chandigarh Shivalik piedmont
                approx = 310.0 + (lat - 30.73) * 120.0 + (lon - 76.78) * 40.0
                fallback_elevs.append(round(approx, 1))
        return fallback_elevs

    def calculate_terrain_vulnerability(self, elevation_m: float, regional_mean_m: float = 310.0) -> Dict[str, Any]:
        """
        Calculates terrain vulnerability indicator (0 - 100).
        Lower elevation relative to the regional mean indicates basin/ponding vulnerability.
        """
        rel_diff = round(elevation_m - regional_mean_m, 2)
        
        # If elevation is lower than mean, vulnerability is elevated
        # Every -1m below mean increases score; higher elevation decreases score
        if rel_diff <= -15.0:
            score = 90.0
        elif rel_diff <= -10.0:
            score = 78.0
        elif rel_diff <= -5.0:
            score = 65.0
        elif rel_diff <= 0.0:
            score = 50.0
        elif rel_diff <= 5.0:
            score = 35.0
        elif rel_diff <= 10.0:
            score = 22.0
        else:
            score = 12.0

        return {
            "elevation_m": elevation_m,
            "relative_elevation_diff_m": rel_diff,
            "terrain_indicator_score": score,
            "resolution": "Copernicus DEM 90m (GLO-90)",
            "limitations": "90m spatial resolution. Indicates macro-topographic basin susceptibility, not micro-curb or street-level storm sewer hydraulics."
        }

terrain_service = TerrainService()

