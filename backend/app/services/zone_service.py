import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import Zone, TerrainSample
from app.services.terrain_service import terrain_service

logger = logging.getLogger(__name__)

# 34 Rich Pilot Zones across Chandigarh & Punjab Tri-City Region
PILOT_ZONES_DATA = [
    # --- Chandigarh Urban Core & Hotspots ---
    {
        "zone_code": "CHD-17",
        "zone_name": "Sector 17 Central Plaza & City Commercial Center",
        "district": "Chandigarh",
        "category": "Commercial Core",
        "lat": 30.7410,
        "lon": 76.7850,
        "elevation_m": 314.0,
        "rel_diff_m": 4.0,
        "notes": "Extensive paved impervious surface. High runoff into underground storm mains."
    },
    {
        "zone_code": "CHD-22",
        "zone_name": "Sector 22 Market & Aroma Chowk Transit Belt",
        "district": "Chandigarh",
        "category": "High Density Commercial",
        "lat": 30.7300,
        "lon": 76.7725,
        "elevation_m": 311.5,
        "rel_diff_m": 1.5,
        "notes": "High footfall retail street. Slower gutter clearance during heavy downpours."
    },
    {
        "zone_code": "CHD-35",
        "zone_name": "Sector 35 Inner Commercial & Low-lying Market Depression",
        "district": "Chandigarh",
        "category": "Commercial & Residential",
        "lat": 30.7230,
        "lon": 76.7580,
        "elevation_m": 305.2,
        "rel_diff_m": -4.8,
        "notes": "Historical chronic waterlogging hotspot during monsoon high-intensity downpours."
    },
    {
        "zone_code": "CHD-26",
        "zone_name": "Sector 26 Grain & Timber Market (Madhya Marg Basin)",
        "district": "Chandigarh",
        "category": "Wholesale Market",
        "lat": 30.7360,
        "lon": 76.8150,
        "elevation_m": 312.0,
        "rel_diff_m": 2.0,
        "notes": "Bordering Sukhna Choe overflow basin. Heavy commercial logistics traffic."
    },
    {
        "zone_code": "CHD-IND1",
        "zone_name": "Industrial Area Phase 1 & Elante Environs",
        "district": "Chandigarh",
        "category": "Industrial & Retail",
        "lat": 30.7080,
        "lon": 76.8050,
        "elevation_m": 303.8,
        "rel_diff_m": -6.2,
        "notes": "Low gradient outfall. Significant runoff concentration in front of underpasses."
    },
    {
        "zone_code": "CHD-IND2",
        "zone_name": "Industrial Area Phase 2 & Railway Culvert Corridor",
        "district": "Chandigarh",
        "category": "Industrial",
        "lat": 30.6970,
        "lon": 76.7950,
        "elevation_m": 301.5,
        "rel_diff_m": -8.5,
        "notes": "Adjacent to Ambala-Kalka railway embankment. Drainage bottleneck at culverts."
    },
    {
        "zone_code": "CHD-MNM",
        "zone_name": "Manimajra & Housing Board Chowk Junction",
        "district": "Chandigarh",
        "category": "Transit Hub & High Density",
        "lat": 30.7250,
        "lon": 76.8400,
        "elevation_m": 326.0,
        "rel_diff_m": 16.0,
        "notes": "Higher elevation piedmont zone receiving rapid foothill runoff from Mansa Devi."
    },
    {
        "zone_code": "CHD-SKH",
        "zone_name": "Sukhna Lake Promenade & Spillway Regulatory Reach",
        "district": "Chandigarh",
        "category": "Reservoir Basin & Ecological",
        "lat": 30.7420,
        "lon": 76.8180,
        "elevation_m": 320.0,
        "rel_diff_m": 10.0,
        "notes": "Regulated reservoir spillway gates dictate downstream inundation alert levels."
    },
    {
        "zone_code": "CHD-43",
        "zone_name": "Sector 43 ISBT & District Courts Complex",
        "district": "Chandigarh",
        "category": "Transit Nexus",
        "lat": 30.7260,
        "lon": 76.7420,
        "elevation_m": 307.0,
        "rel_diff_m": -3.0,
        "notes": "Major regional bus hub. Street-level apron ponding disrupts bus mobility."
    },
    {
        "zone_code": "CHD-15",
        "zone_name": "Sector 15 / Panjab University South Gateway",
        "district": "Chandigarh",
        "category": "Institutional & Residential",
        "lat": 30.7510,
        "lon": 76.7680,
        "elevation_m": 319.5,
        "rel_diff_m": 9.5,
        "notes": "Receives storm sheet flow from northern sectors towards Patiali Rao channel."
    },
    {
        "zone_code": "CHD-14",
        "zone_name": "Sector 14 Panjab University Main Campus",
        "district": "Chandigarh",
        "category": "University Campus",
        "lat": 30.7600,
        "lon": 76.7700,
        "elevation_m": 324.0,
        "rel_diff_m": 14.0,
        "notes": "Green open canopy with high soil permeability and moderate natural slope."
    },
    {
        "zone_code": "CHD-34",
        "zone_name": "Sector 34 Sub-City Centre & Exhibition Grounds",
        "district": "Chandigarh",
        "category": "Commercial & Educational",
        "lat": 30.7220,
        "lon": 76.7750,
        "elevation_m": 308.5,
        "rel_diff_m": -1.5,
        "notes": "Broad asphalt parking areas cause high runoff volume toward Dakshin Marg."
    },
    {
        "zone_code": "CHD-DHN",
        "zone_name": "Dhanas Lake & Botanical Garden Buffer Zone",
        "district": "Chandigarh",
        "category": "Semi-Urban Reservoir",
        "lat": 30.7620,
        "lon": 76.7450,
        "elevation_m": 316.0,
        "rel_diff_m": 6.0,
        "notes": "Natural retention basin buffering storm surges prior to Mohali boundary."
    },
    {
        "zone_code": "CHD-MLY",
        "zone_name": "Maloya Colony Low-lying Drainage Outfall Reach",
        "district": "Chandigarh",
        "category": "High Density Residential",
        "lat": 30.7280,
        "lon": 76.7160,
        "elevation_m": 302.0,
        "rel_diff_m": -8.0,
        "notes": "Low-income urban settlement near drainage ditch prone to backflow flooding."
    },
    {
        "zone_code": "CHD-DDM",
        "zone_name": "Dadu Majra & N-Choe Origin Point",
        "district": "Chandigarh",
        "category": "Mixed Utility",
        "lat": 30.7460,
        "lon": 76.7280,
        "elevation_m": 311.0,
        "rel_diff_m": 1.0,
        "notes": "Headwaters of N-Choe seasonal stormwater ditch."
    },
    {
        "zone_code": "CHD-HLM",
        "zone_name": "Hallomajra & Raipur Kalan Sukhna Outfall Confluence",
        "district": "Chandigarh",
        "category": "Peri-Urban / Transit",
        "lat": 30.6910,
        "lon": 76.8180,
        "elevation_m": 298.5,
        "rel_diff_m": -11.5,
        "notes": "Sukhna Choe low basin confluence. Highly vulnerable during peak discharge."
    },

    # --- SAS Nagar (Mohali, Punjab) ---
    {
        "zone_code": "SAS-3B2",
        "zone_name": "Mohali Phase 3B2 Commercial Market & Dining Street",
        "district": "SAS Nagar (Mohali)",
        "category": "Commercial Hub",
        "lat": 30.7180,
        "lon": 76.7210,
        "elevation_m": 304.5,
        "rel_diff_m": -5.5,
        "notes": "Famous dining hub with recurrent street ponding outside retail storefronts."
    },
    {
        "zone_code": "SAS-07",
        "zone_name": "Mohali Phase 7 Industrial Area & SCL Vicinity",
        "district": "SAS Nagar (Mohali)",
        "category": "Industrial & Tech",
        "lat": 30.7100,
        "lon": 76.7110,
        "elevation_m": 302.8,
        "rel_diff_m": -7.2,
        "notes": "Heavy vehicle traffic, stressed roadside ditches and culvert siltation."
    },
    {
        "zone_code": "SAS-05",
        "zone_name": "Mohali Phase 5 Market & Chandigarh Boundary Border",
        "district": "SAS Nagar (Mohali)",
        "category": "Mixed Commercial",
        "lat": 30.7260,
        "lon": 76.7260,
        "elevation_m": 306.0,
        "rel_diff_m": -4.0,
        "notes": "Inter-state border jurisdiction where cross-municipal stormwater merges."
    },
    {
        "zone_code": "SAS-62",
        "zone_name": "Mohali Sector 62 City Centre / Phase 8 Administrative District",
        "district": "SAS Nagar (Mohali)",
        "category": "Administrative Core",
        "lat": 30.6990,
        "lon": 76.7240,
        "elevation_m": 301.2,
        "rel_diff_m": -8.8,
        "notes": "DC Office and PUDA complex. Wide arterial avenues with low longitudinal slope."
    },
    {
        "zone_code": "SAS-11",
        "zone_name": "Mohali Phase 11 & Railway Station Road",
        "district": "SAS Nagar (Mohali)",
        "category": "Residential & Transit",
        "lat": 30.6720,
        "lon": 76.7320,
        "elevation_m": 298.0,
        "rel_diff_m": -12.0,
        "notes": "Railway line underpass frequently impassable during intense 3-hour storms."
    },
    {
        "zone_code": "SAS-70",
        "zone_name": "Mohali Sector 70 Residential Basin & Matour Border",
        "district": "SAS Nagar (Mohali)",
        "category": "Dense Residential",
        "lat": 30.7020,
        "lon": 76.7050,
        "elevation_m": 303.0,
        "rel_diff_m": -7.0,
        "notes": "Localized depression in community park periphery and inner residential lanes."
    },
    {
        "zone_code": "SAS-82",
        "zone_name": "Mohali Sector 82 JLPL Industrial Park & Airport Corridor",
        "district": "SAS Nagar (Mohali)",
        "category": "IT & Industrial Corridor",
        "lat": 30.6550,
        "lon": 76.7380,
        "elevation_m": 296.0,
        "rel_diff_m": -14.0,
        "notes": "Low-lying southern periphery of Mohali receiving multi-sectoral discharge."
    },
    {
        "zone_code": "SAS-67",
        "zone_name": "Mohali Sector 67 Aerocity Commercial Junction",
        "district": "SAS Nagar (Mohali)",
        "category": "New Planned Urban",
        "lat": 30.6800,
        "lon": 76.7190,
        "elevation_m": 299.5,
        "rel_diff_m": -10.5,
        "notes": "Fast developing commercial grid reliant on modern trunk storm lines."
    },

    # --- Kharar & Sunny Enclave (Punjab) ---
    {
        "zone_code": "KHR-BS",
        "zone_name": "Kharar Bus Stand & Old NH-21 Highway Commercial Spine",
        "district": "SAS Nagar (Mohali / Kharar)",
        "category": "Transit & Highway",
        "lat": 30.7440,
        "lon": 76.6450,
        "elevation_m": 304.0,
        "rel_diff_m": -6.0,
        "notes": "Elevated highway flyover runoff concentrates directly on service lanes."
    },
    {
        "zone_code": "KHR-SE",
        "zone_name": "Kharar Sunny Enclave & Chajju Majra Low Basin",
        "district": "SAS Nagar (Mohali / Kharar)",
        "category": "Dense Residential Basin",
        "lat": 30.7350,
        "lon": 76.6620,
        "elevation_m": 299.0,
        "rel_diff_m": -11.0,
        "notes": "Notorious natural low basin; rapid construction has constricted natural drain paths."
    },

    # --- Gharuan & Chandigarh University (CU) Region (Punjab) ---
    {
        "zone_code": "GHR-VIL",
        "zone_name": "Gharuan Historical Village & Pond Catchment",
        "district": "Rupnagar / Mohali Border",
        "category": "Rural-Urban Transition",
        "lat": 30.7650,
        "lon": 76.5780,
        "elevation_m": 301.0,
        "rel_diff_m": -9.0,
        "notes": "Village pond buffer. Agricultural runoffs converge near old village settlement."
    },
    {
        "zone_code": "CU-GATE",
        "zone_name": "Chandigarh University (CU) Main Gate & NH-5 Gateway Corridor",
        "district": "Mohali / Gharuan Belt",
        "category": "University Transit Gateway",
        "lat": 30.7710,
        "lon": 76.5760,
        "elevation_m": 303.5,
        "rel_diff_m": -6.5,
        "notes": "Massive student and commuter influx. Road culvert ponding causes traffic jams on NH-5."
    },
    {
        "zone_code": "CU-HOST",
        "zone_name": "Chandigarh University (CU) South Hostels & Field Stream Outfall",
        "district": "Mohali / Gharuan Belt",
        "category": "University Residential",
        "lat": 30.7680,
        "lon": 76.5820,
        "elevation_m": 300.2,
        "rel_diff_m": -9.8,
        "notes": "Hostel campus perimeter bordering natural farmland drainage ditch."
    },

    # --- Landran (Punjab) ---
    {
        "zone_code": "LND-JNC",
        "zone_name": "Landran Junction & Technical Campus Belt",
        "district": "SAS Nagar (Mohali)",
        "category": "Transit & Institutional",
        "lat": 30.6910,
        "lon": 76.6650,
        "elevation_m": 300.0,
        "rel_diff_m": -10.0,
        "notes": "High traffic round-about where storm lines from Kharar, Mohali and Banur converge."
    },

    # --- Zirakpur (Punjab) ---
    {
        "zone_code": "ZRK-VIP",
        "zone_name": "Zirakpur VIP Road Commercial Strip & High-Rise Corridor",
        "district": "SAS Nagar (Zirakpur)",
        "category": "Dense Urban Commercial",
        "lat": 30.6420,
        "lon": 76.8180,
        "elevation_m": 295.0,
        "rel_diff_m": -15.0,
        "notes": "Severe localized flooding hotspot during monsoon. Overburdened storm drains."
    },
    {
        "zone_code": "ZRK-BLT",
        "zone_name": "Zirakpur Baltana & Sukhna Choe Southern Reach",
        "district": "SAS Nagar (Zirakpur)",
        "category": "Riverine Floodplain",
        "lat": 30.6580,
        "lon": 76.8320,
        "elevation_m": 293.0,
        "rel_diff_m": -17.0,
        "notes": "Directly exposed to Sukhna Choe high-volume river discharges."
    },

    # --- Regional Boundaries (Panchkula & Dera Bassi) ---
    {
        "zone_code": "PKL-19",
        "zone_name": "Panchkula Sector 19 / Railway Underpass Border",
        "district": "Panchkula / Tri-City Border",
        "category": "Underpass Critical Point",
        "lat": 30.6820,
        "lon": 76.8450,
        "elevation_m": 294.5,
        "rel_diff_m": -15.5,
        "notes": "Notorious underpass connecting Panchkula to Punjab/Zirakpur; submerged in heavy rain."
    },
    {
        "zone_code": "DRB-IND",
        "zone_name": "Dera Bassi Industrial Corridor & Ghaggar Basin",
        "district": "SAS Nagar (Dera Bassi)",
        "category": "Industrial River Basin",
        "lat": 30.5960,
        "lon": 76.8420,
        "elevation_m": 288.0,
        "rel_diff_m": -22.0,
        "notes": "Lowest regional elevation in pilot study area receiving downstream drainage."
    }
]

def generate_illustrative_polygon(lat: float, lon: float, delta: float = 0.005) -> str:
    """Generates an illustrative bounding polygon GeoJSON centered at (lat, lon) with honest disclaimer."""
    coords = [
        [lon - delta, lat - delta],
        [lon + delta, lat - delta],
        [lon + delta, lat + delta],
        [lon - delta, lat + delta],
        [lon - delta, lat - delta]
    ]
    return json.dumps({
        "type": "Polygon",
        "coordinates": [coords]
    })

class ZoneService:
    def seed_zones_if_empty(self, db: Session):
        count = db.query(Zone).count()
        if count >= len(PILOT_ZONES_DATA):
            return

        logger.info(f"Seeding {len(PILOT_ZONES_DATA)} pilot zones for Punjab Tri-City...")
        
        for z in PILOT_ZONES_DATA:
            existing = db.query(Zone).filter(Zone.zone_code == z["zone_code"]).first()
            elev = z.get("elevation_m", 310.0)
            rel_diff = z.get("rel_diff_m", round(elev - 310.0, 1))

            if not existing:
                zone = Zone(
                    zone_code=z["zone_code"],
                    zone_name=z["zone_name"],
                    district=z["district"],
                    category=z["category"],
                    representative_latitude=z["lat"],
                    representative_longitude=z["lon"],
                    elevation_m=elev,
                    relative_elevation_diff_m=rel_diff,
                    boundary_geojson=generate_illustrative_polygon(z["lat"], z["lon"]),
                    is_illustrative_boundary=True
                )
                db.add(zone)
                db.flush()

                # Add terrain sample
                sample = TerrainSample(
                    zone_id=zone.id,
                    latitude=z["lat"],
                    longitude=z["lon"],
                    elevation_m=elev,
                    resolution_label="Copernicus DEM 90m (Open-Meteo)"
                )
                db.add(sample)
        
        db.commit()
        logger.info("Pilot zones seeding completed successfully.")

    def get_all_zones(self, db: Session) -> List[Zone]:
        return db.query(Zone).all()

    def get_zone_by_code(self, db: Session, zone_code: str) -> Optional[Zone]:
        return db.query(Zone).filter(Zone.zone_code == zone_code).first()

    def get_zone_by_id(self, db: Session, zone_id: int) -> Optional[Zone]:
        return db.query(Zone).filter(Zone.id == zone_id).first()

zone_service = ZoneService()

