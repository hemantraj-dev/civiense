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

def init_db():
    try:
        logger.info("Ensuring CiviSense database and models are initialized...")
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            zone_service.seed_zones_if_empty(db)
            report_service.seed_demo_reports_if_empty(db)
            action_service.seed_demo_actions_if_empty(db)
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")

# Call init_db on module load to guarantee ready state in serverless runtime
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info(f"CiviSense v{settings.APP_VERSION} ready for operation.")
    yield
    logger.info("CiviSense shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Urban Waterlogging Prevention and Municipal Response Intelligence System (Punjab Tri-City Pilot)",
    lifespan=lifespan
)

# CORS setup: allow all origins for API prototype access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Register API Routers both with /api prefix and root for maximum proxy compatibility
api_routers = [
    health_router,
    weather_router,
    drainage_router,
    terrain_router,
    zones_router,
    risk_router,
    reports_router,
    actions_router,
    scenarios_router,
    data_sources_router,
    analytics_router,
]

for r in api_routers:
    app.include_router(r, prefix=settings.API_PREFIX)

for r in api_routers:
    app.include_router(r)

# Check if built frontend SPA exists to serve unified single-domain app
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = Path("frontend/dist")

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    logger.info(f"Serving unified frontend SPA from {frontend_dist}")
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "system": settings.APP_NAME,
            "tagline": settings.TAGLINE,
            "pilot": settings.PILOT_REGION,
            "documentation": "/docs",
            "health": "/api/health"
        }

