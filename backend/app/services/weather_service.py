import httpx
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_timestamp: Optional[datetime] = None
        self._last_live_success: Optional[datetime] = None
        self._last_error: Optional[str] = None

    def get_weather_data(self, lat: float = settings.PILOT_LAT, lon: float = settings.PILOT_LON) -> Dict[str, Any]:
        """
        Retrieves real-time and forecast weather data from Open-Meteo.
        Calculates 1h, 3h, 24h, 72h historical rainfall and 6h, 24h forecast.
        Implements in-memory caching and graceful fallback.
        """
        now = datetime.utcnow()
        cache_key = f"{round(lat, 4)}_{round(lon, 4)}"

        # Return cached data if fresh (under 10 minutes)
        if self._cache.get(cache_key) and self._cache_timestamp:
            age = (now - self._cache_timestamp).total_seconds()
            if age < settings.WEATHER_CACHE_TTL:
                return self._cache[cache_key]

        # Call Open-Meteo Forecast API
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "precipitation_probability",
                    "rain",
                    "showers"
                ],
                "current": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "rain"
                ],
                "timezone": settings.TIMEZONE,
                "past_days": 3,
                "forecast_days": 2
            }

            resp = httpx.get(settings.OPEN_METEO_FORECAST_URL, params=params, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                processed = self._process_open_meteo_response(data, lat, lon)
                self._cache[cache_key] = processed
                self._cache_timestamp = now
                self._last_live_success = now
                self._last_error = None
                return processed
            else:
                self._last_error = f"Open-Meteo returned status {resp.status_code}"
                logger.warning(self._last_error)
        except Exception as e:
            self._last_error = f"Open-Meteo request error: {str(e)}"
            logger.error(self._last_error)

        # Fallback to previously cached data if available
        if self._cache.get(cache_key):
            cached = self._cache[cache_key].copy()
            cached["is_live"] = False
            cached["stale_warning"] = "Using cached weather observation due to network/API timeout."
            return cached

        # Safe realistic baseline fallback for offline/isolated tests
        return self._generate_fallback_weather(lat, lon)

    def _process_open_meteo_response(self, data: Dict[str, Any], lat: float, lon: float) -> Dict[str, Any]:
        hourly = data.get("hourly", {})
        current = data.get("current", {})
        times = hourly.get("time", [])
        precips = hourly.get("precipitation", [])
        probs = hourly.get("precipitation_probability", [])
        temps = hourly.get("temperature_2m", [])
        
        current_time_str = current.get("time")
        curr_temp = current.get("temperature_2m", 28.5)
        curr_hum = current.get("relative_humidity_2m", 72.0)
        curr_precip = current.get("precipitation", 0.0)

        # Find current index in hourly array
        curr_idx = len(times) // 2 # default fallback
        if current_time_str and current_time_str in times:
            curr_idx = times.index(current_time_str)

        # Calculate historical rainfall sums (mm)
        # 1-hour
        r_1h = sum(precips[max(0, curr_idx - 1):curr_idx + 1])
        # 3-hour
        r_3h = sum(precips[max(0, curr_idx - 3):curr_idx + 1])
        # 24-hour
        r_24h = sum(precips[max(0, curr_idx - 24):curr_idx + 1])
        # 72-hour (past 3 days)
        r_72h = sum(precips[:curr_idx + 1])

        # Forecast sums
        f_6h = sum(precips[curr_idx + 1:min(len(precips), curr_idx + 7)])
        f_24h = sum(precips[curr_idx + 1:min(len(precips), curr_idx + 25)])

        # Max precip probability in next 6h
        prob_6h_slice = probs[curr_idx:min(len(probs), curr_idx + 7)]
        max_prob = max(prob_6h_slice) if prob_6h_slice else 20.0

        # Hourly data points for charts (24 hours past to 24 hours future)
        start_slice = max(0, curr_idx - 24)
        end_slice = min(len(times), curr_idx + 25)
        chart_points = []
        for i in range(start_slice, end_slice):
            chart_points.append({
                "time": times[i],
                "precipitation_mm": round(float(precips[i] if precips[i] is not None else 0.0), 2),
                "precipitation_probability": float(probs[i] if probs[i] is not None else 0.0),
                "temperature_c": float(temps[i] if temps[i] is not None else 25.0),
                "is_forecast": (i > curr_idx)
            })

        return {
            "latitude": lat,
            "longitude": lon,
            "city": "Chandigarh Tri-City (Punjab Pilot)",
            "temperature_c": round(float(curr_temp), 1),
            "relative_humidity": round(float(curr_hum), 1),
            "current_precipitation_mm": round(float(curr_precip), 2),
            "precipitation_probability": round(float(max_prob), 1),
            "rainfall_1h_mm": round(float(r_1h), 2),
            "rainfall_3h_mm": round(float(r_3h), 2),
            "rainfall_24h_mm": round(float(r_24h), 2),
            "rainfall_72h_mm": round(float(r_72h), 2),
            "forecast_6h_mm": round(float(f_6h), 2),
            "forecast_24h_mm": round(float(f_24h), 2),
            "hourly_chart": chart_points,
            "observation_time": current_time_str or datetime.utcnow().isoformat(),
            "retrieved_at": datetime.utcnow().isoformat(),
            "source": "Open-Meteo Weather API (ECMWF IFS & DWD ICON Seamless)",
            "attribution": "Weather data by Open-Meteo.com under CC BY 4.0",
            "is_live": True
        }

    def _generate_fallback_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Safe fallback for offline/isolated runtime with honest disclosure"""
        now = datetime.utcnow()
        chart_points = []
        for i in range(-24, 25):
            t = (now + timedelta(hours=i)).strftime("%Y-%m-%dT%H:00")
            chart_points.append({
                "time": t,
                "precipitation_mm": 1.2 if -3 <= i <= 2 else 0.0,
                "precipitation_probability": 35.0 if -3 <= i <= 5 else 10.0,
                "temperature_c": 27.5,
                "is_forecast": i > 0
            })
            
        return {
            "latitude": lat,
            "longitude": lon,
            "city": "Chandigarh Tri-City (Punjab Pilot)",
            "temperature_c": 27.8,
            "relative_humidity": 68.0,
            "current_precipitation_mm": 0.5,
            "precipitation_probability": 35.0,
            "rainfall_1h_mm": 1.2,
            "rainfall_3h_mm": 3.6,
            "rainfall_24h_mm": 14.5,
            "rainfall_72h_mm": 22.0,
            "forecast_6h_mm": 8.4,
            "forecast_24h_mm": 19.2,
            "hourly_chart": chart_points,
            "observation_time": now.isoformat(),
            "retrieved_at": now.isoformat(),
            "source": "Open-Meteo Fallback Profile (Network Restricted Mode)",
            "attribution": "Open-Meteo Reference Profile (Disclosed Offline Fallback)",
            "is_live": False
        }

weather_service = WeatherService()

