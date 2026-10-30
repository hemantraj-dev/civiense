import json
import logging
from typing import Dict, Any, List, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class RiskEngine:
    def __init__(self):
        self.w_p = settings.WEIGHT_RAINFALL   # 0.50
        self.w_d = settings.WEIGHT_DRAINAGE   # 0.30
        self.w_t = settings.WEIGHT_TERRAIN    # 0.20

    def calculate_rainfall_score(self, rainfall_24h_mm: float, forecast_6h_mm: float, precip_prob: float = 30.0) -> float:
        """
        Calculates normalized rainfall-related risk score P (0 - 100).
        Combines recent 24h accumulation and near-term 6h forecast intensity with precipitation probability.
        """
        # Weighted effective rain volume
        effective_rain = rainfall_24h_mm * 0.45 + forecast_6h_mm * 0.55
        
        if effective_rain <= 5.0:
            score = 10.0 + effective_rain * 2.0
        elif effective_rain <= 15.0:
            score = 20.0 + (effective_rain - 5.0) * 2.5
        elif effective_rain <= 35.0:
            score = 45.0 + (effective_rain - 15.0) * 1.5
        elif effective_rain <= 60.0:
            score = 75.0 + (effective_rain - 35.0) * 0.6
        else:
            score = min(100.0, 90.0 + (effective_rain - 60.0) * 0.25)
            
        # Mild probability scaling
        if precip_prob > 70.0 and score < 85.0:
            score = min(100.0, score + 5.0)

        return round(score, 1)

    def calculate_drainage_indicator(self, category: str, mapped_features_count: int, mapped_length_m: float) -> float:
        """
        Calculates normalized drainage-related vulnerability indicator D (0 - 100).
        Higher score means GREATER vulnerability (weaker/more stressed drainage).
        Industrial & Dense Commercial have higher impervious runoff coefficients.
        Disclosed: Community-mapped OSM coverage is used as a proxy, not verified underground flow.
        """
        # Base vulnerability based on land-use imperviousness
        base_vulnerability = {
            "Commercial Core": 68.0,
            "High Density Commercial": 65.0,
            "Commercial & Residential": 60.0,
            "Industrial": 72.0,
            "Industrial & Retail": 70.0,
            "Wholesale Market": 64.0,
            "Transit Hub & High Density": 68.0,
            "Transit Nexus": 70.0,
            "Underpass Critical Point": 85.0,
            "Dense Residential Basin": 75.0,
            "Dense Residential": 58.0,
            "High Density Residential": 68.0,
            "University Campus": 32.0,
            "University Transit Gateway": 62.0,
            "University Residential": 48.0,
            "Semi-Urban Reservoir": 40.0,
            "Reservoir Basin & Ecological": 50.0,
            "Riverine Floodplain": 82.0,
            "Rural-Urban Transition": 55.0,
            "IT & Industrial Corridor": 52.0,
            "Transit & Institutional": 65.0,
            "Transit & Highway": 76.0,
        }.get(category, 55.0)

        # If substantial mapped drainage lines exist nearby, relieve vulnerability slightly
        if mapped_length_m > 2500:
            relief = 12.0
        elif mapped_length_m > 1000:
            relief = 7.0
        elif mapped_features_count > 0:
            relief = 4.0
        else:
            relief = 0.0

        indicator = max(15.0, min(95.0, base_vulnerability - relief))
        return round(indicator, 1)

    def calculate_terrain_indicator(self, relative_elevation_diff_m: float) -> float:
        """
        Calculates normalized terrain vulnerability indicator T (0 - 100).
        Higher score means LOWER ground / basin depression relative to regional datum (310m).
        """
        # rel_diff_m < 0 means below regional mean (depression)
        if relative_elevation_diff_m <= -15.0:
            return 92.0 # Deep basin / river floodplain reach (e.g. Baltana, Zirakpur VIP road)
        elif relative_elevation_diff_m <= -10.0:
            return 80.0 # Low-lying basin (e.g. Sunny Enclave, Mohali Phase 11)
        elif relative_elevation_diff_m <= -5.0:
            return 66.0 # Depressed commercial core (e.g. Sector 35, Industrial Area 1)
        elif relative_elevation_diff_m <= 0.0:
            return 50.0 # Average regional slope
        elif relative_elevation_diff_m <= 8.0:
            return 32.0 # Gentle elevation
        else:
            return 16.0 # Elevated Shivalik piedmont / foothills

    def assess_zone(
        self,
        zone_code: str,
        zone_name: str,
        category: str,
        rainfall_24h_mm: float,
        forecast_6h_mm: float,
        precip_prob: float,
        relative_elevation_diff_m: float,
        mapped_drainage_count: int,
        mapped_drainage_length_m: float,
        verified_citizen_reports_count: int = 0,
        unverified_reports_count: int = 0,
        is_weather_live: bool = True,
        is_elevation_live: bool = True,
        is_drainage_live: bool = True,
        rainfall_modifier: float = 1.0,
        drainage_modifier: float = 1.0,
        terrain_modifier: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Core Explainable Multi-Criteria Risk Assessment.
        Risk Score = 0.50 * P + 0.30 * D + 0.20 * T
        """
        # 1. Calculate Component Scores
        P_raw = self.calculate_rainfall_score(rainfall_24h_mm, forecast_6h_mm, precip_prob)
        D_raw = self.calculate_drainage_indicator(category, mapped_drainage_count, mapped_drainage_length_m)
        T_raw = self.calculate_terrain_indicator(relative_elevation_diff_m)

        # Apply scenario modifiers (for Decision Lab simulation)
        P = min(100.0, max(0.0, P_raw * rainfall_modifier))
        D = min(100.0, max(0.0, D_raw * drainage_modifier))
        T = min(100.0, max(0.0, T_raw * terrain_modifier))

        # Core weighted formula
        overall_score = round(self.w_p * P + self.w_d * D + self.w_t * T, 1)

        # Adjust slightly if verified citizen ground reports confirm active waterlogging
        if verified_citizen_reports_count > 0:
            overall_score = min(100.0, overall_score + min(8.0, verified_citizen_reports_count * 2.5))
            overall_score = round(overall_score, 1)

        # Determine Risk Category
        if overall_score >= 80.0:
            category_label = "Critical"
        elif overall_score >= 60.0:
            category_label = "High"
        elif overall_score >= 35.0:
            category_label = "Medium"
        else:
            category_label = "Low"

        # Determine Confidence Level & Explanation
        confidence_level, confidence_explanation = self._evaluate_confidence(
            is_weather_live=is_weather_live,
            is_elevation_live=is_elevation_live,
            is_drainage_live=is_drainage_live,
            mapped_features_count=mapped_drainage_count,
            verified_reports_count=verified_citizen_reports_count,
            unverified_reports_count=unverified_reports_count
        )

        # Identify Top Contributing Factors
        factors = []
        weighted_p = self.w_p * P
        weighted_d = self.w_d * D
        weighted_t = self.w_t * T
        
        factor_pairs = [
            ("Rainfall Volume & Forecast Intensity", weighted_p, P),
            ("Drainage Conduit Vulnerability / Impervious Basin", weighted_d, D),
            ("Topographic Depression / Low Elevation", weighted_t, T)
        ]
        factor_pairs.sort(key=lambda x: x[1], reverse=True)
        top_factors = [f"{fp[0]} (Factor Score: {fp[2]}/100, Contrib: {round(fp[1], 1)} pts)" for fp in factor_pairs[:2]]

        # Action Recommendation
        recommended_action = self._determine_recommended_action(overall_score, category_label, factor_pairs[0][0], zone_name)

        # Natural language explainable justification
        explanation = self._generate_explanation(
            zone_name=zone_name,
            overall_score=overall_score,
            category_label=category_label,
            P=P,
            D=D,
            T=T,
            rel_diff_m=relative_elevation_diff_m,
            verified_reports_count=verified_citizen_reports_count,
            rainfall_24h_mm=rainfall_24h_mm,
            forecast_6h_mm=forecast_6h_mm
        )

        return {
            "overall_risk_score": overall_score,
            "risk_category": category_label,
            "confidence_level": confidence_level,
            "confidence_explanation": confidence_explanation,
            "rainfall_score": P,
            "drainage_indicator": D,
            "terrain_indicator": T,
            "top_factors": top_factors,
            "recommended_action": recommended_action,
            "explanation": explanation
        }

    def _evaluate_confidence(
        self,
        is_weather_live: bool,
        is_elevation_live: bool,
        is_drainage_live: bool,
        mapped_features_count: int,
        verified_reports_count: int,
        unverified_reports_count: int
    ) -> Tuple[str, str]:
        score = 0
        reasons = []

        if is_weather_live:
            score += 35
            reasons.append("Live Open-Meteo API connection active (hourly forecast + 72h history)")
        else:
            reasons.append("Weather running in calibrated offline/cached fallback mode")

        if is_elevation_live:
            score += 30
            reasons.append("Copernicus DEM 90m digital elevation grid verified")
        else:
            reasons.append("Terrain model using established regional topographic datum")

        if mapped_features_count > 0:
            score += 20
            reasons.append(f"OSM mapped waterways active ({mapped_features_count} features mapped)")
        else:
            reasons.append("Community drainage mapping sparse in this specific sector")

        if verified_reports_count > 0:
            score += 15
            reasons.append(f"{verified_reports_count} municipal-verified field inspection report(s) on file")
        elif unverified_reports_count > 0:
            score += 5
            reasons.append(f"{unverified_reports_count} citizen report(s) submitted (pending field verification)")
        else:
            reasons.append("No citizen incident reports logged in the current window")

        if score >= 75:
            level = "High"
        elif score >= 50:
            level = "Medium"
        else:
            level = "Low"

        explanation_str = " | ".join(reasons)
        return level, explanation_str

    def _determine_recommended_action(self, score: float, category: str, primary_factor: str, zone_name: str) -> str:
        if score >= 80.0:
            return f"Immediate dispatch: Pre-position suction dewatering pumps and deploy rapid stormwater clearance team to {zone_name}."
        elif score >= 60.0:
            return f"Priority inspection: Inspect roadside catch-basins and clear silt grating along arterial bottlenecks in {zone_name}."
        elif score >= 35.0:
            return f"Routine monitoring: Verify culvert discharge capacity and log hourly water level observations."
        else:
            return f"Normal operational standby: Baseline preventive drain sweep scheduled."

    def _generate_explanation(
        self,
        zone_name: str,
        overall_score: float,
        category_label: str,
        P: float,
        D: float,
        T: float,
        rel_diff_m: float,
        verified_reports_count: int,
        rainfall_24h_mm: float,
        forecast_6h_mm: float
    ) -> str:
        dep_str = f"low-lying depression ({abs(rel_diff_m)}m below regional average)" if rel_diff_m < -2.0 else "moderate natural slope"
        
        explanation = (
            f"Vulnerability is classified as {category_label.upper()} ({overall_score}/100). "
            f"Rainfall factor ({P}/100) reflects 24h accumulation ({rainfall_24h_mm} mm) and near-term 6h forecast ({forecast_6h_mm} mm). "
            f"Terrain factor ({T}/100) indicates {dep_str}. "
            f"Drainage factor ({D}/100) accounts for high impervious surface runoff and available mapped waterway relief. "
        )
        if verified_reports_count > 0:
            explanation += f" Confirmed by {verified_reports_count} verified field inspection report(s)."
            
        return explanation

risk_engine = RiskEngine()

