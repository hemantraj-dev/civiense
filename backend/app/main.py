import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.services.zone_service import zone_service
from app.services.report_service import report_service
from app.services.action_service import action_service

# Routers
from app.api.routes_health import router as health_router
from app.api.routes_weather import router as weather_router
from app.api.routes_drainage import router as drainage_router
from app.api.routes_terrain import router as terrain_router
from app.api.routes_zones import router as zones_router
from app.api.routes_risk import router as risk_router
from app.api.routes_reports import router as reports_router
from app.api.routes_actions import router as actions_router
from app.api.routes_scenarios import router as scenarios_router
from app.api.routes_data_sources import router as data_sources_router
from app.api.routes_analytics import router as analytics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civisense")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed initial data
    logger.info("Initializing CiviSense database and models...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        zone_service.seed_zones_if_empty(db)
        report_service.seed_demo_reports_if_empty(db)
        action_service.seed_demo_actions_if_empty(db)
    finally:
        db.close()
    
    logger.info(f"CiviSense v{settings.APP_VERSION} ready for operation.")
    yield
    # Shutdown
    logger.info("CiviSense shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Urban Waterlogging Prevention and Municipal Response Intelligence System (Punjab Tri-City Pilot)",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development prototype, allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(weather_router, prefix=settings.API_PREFIX)
app.include_router(drainage_router, prefix=settings.API_PREFIX)
app.include_router(terrain_router, prefix=settings.API_PREFIX)
app.include_router(zones_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(actions_router, prefix=settings.API_PREFIX)
app.include_router(scenarios_router, prefix=settings.API_PREFIX)
app.include_router(data_sources_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "system": settings.APP_NAME,
        "tagline": settings.TAGLINE,
        "pilot": settings.PILOT_REGION,
        "documentation": "/docs",
        "health": "/api/health"
    }

