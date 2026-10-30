import os
from pydantic import BaseModel

def get_default_db_url() -> str:
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        # Normalize postgres:// to postgresql:// for SQLAlchemy
        if env_url.startswith("postgres://"):
            return env_url.replace("postgres://", "postgresql://", 1)
        return env_url
    # On Vercel or AWS Lambda, the local filesystem is read-only except /tmp
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/civisense.db"
    return "sqlite:///./civisense.db"

class Settings(BaseModel):
    APP_NAME: str = "CIVISENSE"
    APP_VERSION: str = "2.0.0"
    TAGLINE: str = "Predict. Prioritize. Prevent."
    API_PREFIX: str = "/api"
    
    # Pilot Study Geography: Chandigarh & Tri-City Punjab (Mohali, Kharar, CU Gharuan, Zirakpur)
    PILOT_REGION: str = "Chandigarh & Punjab Tri-City Region"
    PILOT_LAT: float = 30.7333
    PILOT_LON: float = 76.7794
    TIMEZONE: str = "Asia/Kolkata"
    
    # Database
    DATABASE_URL: str = get_default_db_url()
    
    # External APIs
    OPEN_METEO_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_HISTORICAL_URL: str = "https://archive-api.open-meteo.com/v1/archive"
    OPEN_METEO_ELEVATION_URL: str = "https://api.open-meteo.com/v1/elevation"
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    
    # Cache TTLs (seconds)
    WEATHER_CACHE_TTL: int = 600  # 10 minutes
    ELEVATION_CACHE_TTL: int = 86400  # 24 hours
    OVERPASS_CACHE_TTL: int = 3600  # 1 hour
    
    # Risk weights
    WEIGHT_RAINFALL: float = 0.50
    WEIGHT_DRAINAGE: float = 0.30
    WEIGHT_TERRAIN: float = 0.20

settings = Settings()

