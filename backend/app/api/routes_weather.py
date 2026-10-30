from fastapi import APIRouter, Query
from app.services.weather_service import weather_service
from app.core.config import settings

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("/current")
def get_current_weather(
    lat: float = Query(settings.PILOT_LAT, description="Latitude"),
    lon: float = Query(settings.PILOT_LON, description="Longitude")
):
    """
    Returns current weather, 1h, 3h, 24h, 72h historical rainfall, and 6h/24h forecast from Open-Meteo.
    """
    data = weather_service.get_weather_data(lat, lon)
    return {
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "city": data["city"],
        "temperature_c": data["temperature_c"],
        "relative_humidity": data["relative_humidity"],
        "current_precipitation_mm": data["current_precipitation_mm"],
        "precipitation_probability": data["precipitation_probability"],
        "rainfall_1h_mm": data["rainfall_1h_mm"],
        "rainfall_3h_mm": data["rainfall_3h_mm"],
        "rainfall_24h_mm": data["rainfall_24h_mm"],
        "rainfall_72h_mm": data["rainfall_72h_mm"],
        "forecast_6h_mm": data["forecast_6h_mm"],
        "forecast_24h_mm": data["forecast_24h_mm"],
        "observation_time": data["observation_time"],
        "retrieved_at": data["retrieved_at"],
        "source": data["source"],
        "attribution": data["attribution"],
        "is_live": data["is_live"]
    }

@router.get("/forecast")
def get_weather_forecast(
    lat: float = Query(settings.PILOT_LAT),
    lon: float = Query(settings.PILOT_LON)
):
    """
    Returns hourly rainfall forecast and probability chart points.
    """
    data = weather_service.get_weather_data(lat, lon)
    chart = [p for p in data.get("hourly_chart", []) if p["is_forecast"]]
    return {
        "city": data["city"],
        "hourly_forecast": chart[:24],
        "forecast_6h_total_mm": data["forecast_6h_mm"],
        "forecast_24h_total_mm": data["forecast_24h_mm"],
        "source": data["source"],
        "retrieved_at": data["retrieved_at"]
    }

@router.get("/history")
def get_weather_history(
    lat: float = Query(settings.PILOT_LAT),
    lon: float = Query(settings.PILOT_LON)
):
    """
    Returns historical hourly rainfall data points for trend analysis.
    """
    data = weather_service.get_weather_data(lat, lon)
    chart = [p for p in data.get("hourly_chart", []) if not p["is_forecast"]]
    return {
        "city": data["city"],
        "hourly_history": chart[-24:],
        "rainfall_24h_mm": data["rainfall_24h_mm"],
        "rainfall_72h_mm": data["rainfall_72h_mm"],
        "source": data["source"],
        "retrieved_at": data["retrieved_at"]
    }

