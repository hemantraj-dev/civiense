from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.scenario_service import scenario_service
from app.schemas.dto import ScenarioSimulateRequest, ScenarioSimulateResponse

router = APIRouter(prefix="/scenarios", tags=["Decision Lab / What-If Simulator"])

@router.get("/presets")
def get_scenario_presets():
    """
    Returns pre-configured stress and intervention presets for municipal scenario testing.
    """
    return [
        {
            "id": "normal",
            "name": "Normal Conditions (Baseline)",
            "description": "Observed live weather and baseline infrastructure operational parameters.",
            "rainfall_modifier": 1.0,
            "drainage_stress_modifier": 1.0,
            "terrain_vulnerability_modifier": 1.0
        },
        {
            "id": "heavy_rain",
            "name": "Heavy Cloudburst Scenario (+120% Rainfall)",
            "description": "Simulates sudden localized 50mm/hr intense monsoon downpour across Punjab Tri-City.",
            "rainfall_modifier": 2.2,
            "drainage_stress_modifier": 1.1,
            "terrain_vulnerability_modifier": 1.0
        },
        {
            "id": "reduced_drainage",
            "name": "Severe Drain Clogging / Outfall Backflow",
            "description": "Simulates 60% silt and trash accumulation blocking municipal storm grates and culverts.",
            "rainfall_modifier": 1.1,
            "drainage_stress_modifier": 1.6,
            "terrain_vulnerability_modifier": 1.0
        },
        {
            "id": "combined_stress",
            "name": "Combined Compound Stress (Extreme Cloudburst + Clogged Drains)",
            "description": "Simultaneous peak monsoon cloudburst with congested downstream outfalls.",
            "rainfall_modifier": 2.0,
            "drainage_stress_modifier": 1.5,
            "terrain_vulnerability_modifier": 1.2
        },
        {
            "id": "improved_drainage",
            "name": "Preventive Drainage Desilting Intervention (-40% Stress)",
            "description": "Simulates positive municipal intervention with fully cleared culverts and pre-positioned suction pumps.",
            "rainfall_modifier": 1.0,
            "drainage_stress_modifier": 0.6,
            "terrain_vulnerability_modifier": 0.9
        }
    ]

@router.post("/simulate", response_model=ScenarioSimulateResponse)
def simulate_scenario(req: ScenarioSimulateRequest, db: Session = Depends(get_db)):
    """
    Dynamically recalculates risk across all 34 zones using the central Risk Engine.
    Returns baseline vs simulated scores, delta, category shifts, and updated priority ranks.
    """
    return scenario_service.simulate(db, req)

