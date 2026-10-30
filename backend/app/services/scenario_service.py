import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import Zone, CitizenReport
from app.services.risk_engine import risk_engine
from app.services.weather_service import weather_service
from app.services.drainage_service import drainage_service
from app.schemas.dto import ScenarioSimulateRequest, ScenarioSimulateResponse, ScenarioZoneResult

logger = logging.getLogger(__name__)

class ScenarioService:
    def simulate(self, db: Session, request: ScenarioSimulateRequest) -> ScenarioSimulateResponse:
        zones = db.query(Zone).all()
        weather = weather_service.get_weather_data()
        
        # Get weather baseline values
        r24 = weather.get("rainfall_24h_mm", 14.5)
        f6 = weather.get("forecast_6h_mm", 8.4)
        prob = weather.get("precipitation_probability", 35.0)

        results: List[ScenarioZoneResult] = []
        base_scores = []
        sim_scores = []

        # Count verified citizen reports per zone
        reports = db.query(CitizenReport).all()
        verified_counts: Dict[int, int] = {}
        for r in reports:
            if r.verification_status == "Verified" and r.zone_id:
                verified_counts[r.zone_id] = verified_counts.get(r.zone_id, 0) + 1

        for z in zones:
            v_cnt = verified_counts.get(z.id, 0)
            
            # Baseline assessment
            base_assessment = risk_engine.assess_zone(
                zone_code=z.zone_code,
                zone_name=z.zone_name,
                category=z.category,
                rainfall_24h_mm=r24,
                forecast_6h_mm=f6,
                precip_prob=prob,
                relative_elevation_diff_m=z.relative_elevation_diff_m,
                mapped_drainage_count=1 if z.category in ["Commercial Core", "Wholesale Market"] else 0,
                mapped_drainage_length_m=1200.0,
                verified_citizen_reports_count=v_cnt,
                rainfall_modifier=1.0,
                drainage_modifier=1.0,
                terrain_modifier=1.0
            )

            # Simulated assessment with user parameters
            sim_assessment = risk_engine.assess_zone(
                zone_code=z.zone_code,
                zone_name=z.zone_name,
                category=z.category,
                rainfall_24h_mm=r24,
                forecast_6h_mm=f6,
                precip_prob=prob,
                relative_elevation_diff_m=z.relative_elevation_diff_m,
                mapped_drainage_count=1 if z.category in ["Commercial Core", "Wholesale Market"] else 0,
                mapped_drainage_length_m=1200.0,
                verified_citizen_reports_count=v_cnt,
                rainfall_modifier=request.rainfall_modifier,
                drainage_modifier=request.drainage_stress_modifier,
                terrain_modifier=request.terrain_vulnerability_modifier
            )

            b_score = base_assessment["overall_risk_score"]
            s_score = sim_assessment["overall_risk_score"]
            delta = round(s_score - b_score, 1)

            base_scores.append(b_score)
            sim_scores.append(s_score)

            results.append(ScenarioZoneResult(
                zone_code=z.zone_code,
                zone_name=z.zone_name,
                baseline_score=b_score,
                baseline_category=base_assessment["risk_category"],
                simulated_score=s_score,
                simulated_category=sim_assessment["risk_category"],
                delta=delta,
                priority_rank_simulated=0, # Will assign below after sorting
                recommended_action=sim_assessment["recommended_action"]
            ))

        # Rank simulated results descending by simulated_score
        results.sort(key=lambda x: x.simulated_score, reverse=True)
        critical_count = 0
        high_count = 0
        for rank, res in enumerate(results, start=1):
            res.priority_rank_simulated = rank
            if res.simulated_score >= 80.0:
                critical_count += 1
            elif res.simulated_score >= 60.0:
                high_count += 1

        avg_base = round(sum(base_scores) / len(base_scores), 1) if base_scores else 0.0
        avg_sim = round(sum(sim_scores) / len(sim_scores), 1) if sim_scores else 0.0

        return ScenarioSimulateResponse(
            scenario_name=request.scenario_name,
            inputs=request,
            results=results,
            city_average_baseline=avg_base,
            city_average_simulated=avg_sim,
            critical_zones_count=critical_count,
            high_zones_count=high_count
        )

scenario_service = ScenarioService()

