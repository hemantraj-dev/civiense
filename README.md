# CIVISENSE
### Predict. Prioritize. Prevent.

**Smart Urban Waterlogging Prevention and Municipal Response Intelligence System**  
**Pilot Study Geography:** Chandigarh & Punjab Tri-City Region (Chandigarh UT, SAS Nagar Mohali, Gharuan / Chandigarh University (CU), Kharar, Zirakpur, Panchkula).

---

## 1. Executive Summary

CiviSense is a full-stack civic-tech intelligence and municipal command platform designed to transform urban flood management from reactive emergency rescue into **proactive, explainable, data-backed prevention**.

Rather than relying on generic mockups or hardcoded assumptions, CiviSense integrates:
- **Live Weather Telemetry:** High-resolution numerical forecasts and 72-hour precipitation accumulation via the Open-Meteo Weather API (ECMWF & DWD blend).
- **Macro-Topographic Elevation:** Ground elevation AMSL and relative drainage depression modeling via Open-Meteo Elevation (Copernicus DEM 90m resolution).
- **Community Waterway Mapping:** Surface canals, streams (Sukhna Choe, Patiali Rao, N-Choe, agricultural channels) from OpenStreetMap Overpass API QL.
- **34 Pilot Study Zones across Punjab & Chandigarh:** Covering critical urban commercial centers, dense residential basins, university campuses (Chandigarh University CU & Panjab University), and transit bottlenecks.
- **Crowdsourced Citizen Reporting:** Responsive public incident submission with GPS coordinates, duplicate proximity detection review, and municipal inspector verification triage.
- **Explainable Multi-Criteria Risk Engine:** Fully transparent weighted formula:  
  $$\text{Risk Score} = 0.50 \times P + 0.30 \times D + 0.20 \times T$$
- **Decision Lab / What-If Simulator:** Interactive sandbox testing cloudburst stress (+120% rainfall), drain clogging (+60% stress), and preventive desilting (-40% stress) with dynamic citywide re-ranking.
- **Municipal Action Tracking:** Work order lifecycle management for suction pump deployment and catch-basin clearance.
- **Judge Demo Mode:** 15-step interactive walkthrough guiding hackathon evaluators through the complete operational prevention workflow.

---

## 2. Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   CIVISENSE CLIENT                     │
│    React 18 + TypeScript + Vite + Tailwind CSS         │
│   React Leaflet (GIS) + Recharts + Lucide Icons       │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (JSON)
┌──────────────────────────▼─────────────────────────────┐
│                  FASTAPI BACKEND                       │
│    Python 3.11 + Pydantic v2 + SQLAlchemy ORM          │
└────────┬──────────────┬──────────────┬─────────────────┘
         │              │              │
┌────────▼──────┐┌──────▼──────┐┌──────▼─────────────────┐
│  RISK ENGINE  ││ DATA TRUST  ││ RELATIONAL PERSISTENCE │
│ (0.5P+0.3D    ││ CACHE & SYNC││ SQLite (Dev) /         │
│  + 0.2T)      ││ 5 Providers ││ PostgreSQL (Production)│
└────────┬──────┘└──────┬──────┘└────────────────────────┘
         │              │
┌────────▼──────────────▼────────────────────────────────┐
│                   EXTERNAL APIS                        │
│ • Open-Meteo Forecast & Historical (Rainfall in mm)    │
│ • Open-Meteo Elevation (Copernicus DEM 90m)            │
│ • OpenStreetMap Overpass QL (Mapped Waterways)         │
│ • Punjab State GIS Reference Boundaries                │
└────────────────────────────────────────────────────────┘
```

### Technology Highlights
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS with customized civic-tech design system (`#172B36`, `#F3F1E9`, `#267C78`, `#83A69A`, `#D69A42`, `#C75C54`), React Leaflet, Recharts.
- **Backend:** FastAPI, Python 3.11, Pydantic, SQLAlchemy, httpx, pytest.
- **Data Stores:** Relational schema with 9 tables (`zones`, `weather_observations`, `drainage_features`, `terrain_samples`, `citizen_reports`, `risk_assessments`, `action_recommendations`, `scenarios`, `data_source_logs`).

---

## 3. Monitored Pilot Geography: 34 Zones across Punjab Tri-City

Per prompt requirements (`"instead of 16 zones 30+ dataset of punjab including regions of mohali chandigarh and near chandigarh university"`), CiviSense monitors **34 distinct zones**:

| Zone Code | Zone Name & Landmark | Territory | Category |
|---|---|---|---|
| `CHD-17` | Sector 17 Central Commercial Plaza | Chandigarh UT | Commercial Core |
| `CHD-22` | Sector 22 Market & Aroma Chowk | Chandigarh UT | High Density Commercial |
| `CHD-35` | Sector 35 Inner Market Depression | Chandigarh UT | Commercial & Residential |
| `CHD-26` | Sector 26 Grain & Timber Market | Chandigarh UT | Wholesale Market |
| `CHD-IND1` | Industrial Area Phase 1 / Elante Environs | Chandigarh UT | Industrial & Retail |
| `CHD-IND2` | Industrial Area Phase 2 Railway Culverts | Chandigarh UT | Industrial |
| `CHD-MNM` | Manimajra & Housing Board Chowk | Chandigarh UT | Transit Hub & High Density |
| `CHD-SKH` | Sukhna Lake Spillway Regulatory Reach | Chandigarh UT | Reservoir Basin |
| `CHD-43` | Sector 43 ISBT Transit Nexus | Chandigarh UT | Transit Nexus |
| `CHD-15` | Sector 15 / Panjab University South Gateway | Chandigarh UT | Institutional & Residential |
| `CHD-14` | Sector 14 Panjab University Main Campus | Chandigarh UT | University Campus |
| `CHD-34` | Sector 34 Sub-City Centre Exhibition Grounds | Chandigarh UT | Commercial Core |
| `CHD-DHN` | Dhanas Lake & Botanical Garden Buffer | Chandigarh UT | Semi-Urban Reservoir |
| `CHD-MLY` | Maloya Colony Lowline Outfall Reach | Chandigarh UT | High Density Residential |
| `CHD-DDM` | Dadu Majra & N-Choe Origin Point | Chandigarh UT | Mixed Utility |
| `CHD-HLM` | Hallomajra & Raipur Kalan Sukhna Outfall | Chandigarh UT | Peri-Urban / Transit |
| `SAS-3B2` | Mohali Phase 3B2 Commercial Market | SAS Nagar (Mohali) | Commercial Hub |
| `SAS-07` | Mohali Phase 7 Industrial Area | SAS Nagar (Mohali) | Industrial & Tech |
| `SAS-05` | Mohali Phase 5 Market | SAS Nagar (Mohali) | Mixed Commercial |
| `SAS-62` | Mohali Sector 62 City Centre / Phase 8 | SAS Nagar (Mohali) | Administrative Core |
| `SAS-11` | Mohali Phase 11 & Railway Station Road | SAS Nagar (Mohali) | Residential & Transit |
| `SAS-70` | Mohali Sector 70 Residential Basin | SAS Nagar (Mohali) | Dense Residential |
| `SAS-82` | Mohali Sector 82 JLPL IT Park | SAS Nagar (Mohali) | IT & Industrial Corridor |
| `SAS-67` | Mohali Sector 67 Aerocity Commercial Junction | SAS Nagar (Mohali) | New Planned Urban |
| `KHR-BS` | Kharar Bus Stand & Old NH-21 Corridor | Kharar, Punjab | Transit & Highway |
| `KHR-SE` | Kharar Sunny Enclave & Chajju Majra Basin | Kharar, Punjab | Dense Residential Basin |
| `GHR-VIL` | Gharuan Historical Village Core | Gharuan, Punjab | Rural-Urban Transition |
| `CU-GATE` | Chandigarh University (CU) Main Gate NH-5 | Mohali / CU Belt | University Gateway |
| `CU-HOST` | Chandigarh University (CU) South Hostels | Mohali / CU Belt | University Residential |
| `LND-JNC` | Landran Junction Technical Campus Belt | SAS Nagar, Punjab | Transit & Institutional |
| `ZRK-VIP` | Zirakpur VIP Road Commercial Strip | Zirakpur, Punjab | Dense Urban Commercial |
| `ZRK-BLT` | Zirakpur Baltana Sukhna Choe Confluence | Zirakpur, Punjab | Riverine Floodplain |
| `PKL-19` | Panchkula Sector 19 Railway Underpass | Panchkula / Border | Underpass Critical Point |
| `DRB-IND` | Dera Bassi Ghaggar River Catchment | Dera Bassi, Punjab | Industrial River Basin |

---

## 4. Explainable Multi-Criteria Risk Formula

The CiviSense risk score is calculated via:

$$\text{Risk Score} = 0.50 \times P + 0.30 \times D + 0.20 \times T$$

- **$P$ (Rainfall Factor, 0–100):** Weighted combination of past 24-hour accumulation (mm), near-term 6-hour forecast (mm), and probability of precipitation.
- **$D$ (Drainage Indicator, 0–100):** Land-use runoff coefficient (impervious asphalt vs open canopy) mitigated by nearby mapped OpenStreetMap waterways.
- **$T$ (Terrain Indicator, 0–100):** Relative elevation difference in metres against the 310m AMSL regional datum derived from Copernicus DEM 90m resolution.

### Risk Categories:
- **Critical (80–100):** Immediate deployment of high-capacity suction dewatering pumps and pre-positioned teams.
- **High (60–79):** Priority inspection of catch-basins and desilting of culverts.
- **Medium (35–59):** Routine surveillance and culvert clearing.
- **Low (0–34):** Standard operational standby.

---

## 5. Live Data Providers & Transparent Disclosures

| Provider | Dataset | Spatial Resolution | Limitations Disclosed |
|---|---|---|---|
| **Open-Meteo Weather** | Forecast & Historical Precipitation | 1 km to 11 km numerical grid | Numerical atmospheric model. Not a physical telemetry rain-gauge network. |
| **Open-Meteo Elevation** | Copernicus DEM GLO-90 | 90-metre spatial sampling | Macro-topography indicator. Does not capture sub-meter street curbs or underground pipe capacity. |
| **OpenStreetMap Overpass** | Mapped Canals, Choes, Drains | Vector Line geometries | Community crowdsourced. Unmapped conduits may exist. Does not indicate silt blockage. |
| **Citizen Reports** | Geolocation waterlogging reports | GPS ±15m accuracy | Requires municipal operator verification before official action dispatch. |

---

## 6. How to Run the Application

The workspace is pre-configured with standalone tooling in `.tools/`.

### 1. Start the Backend (Port 8001)
```powershell
$env:PYTHONPATH = "$PWD\backend"
.\backend\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8001
```

### 2. Start the Frontend (Port 5173)
```powershell
$env:Path = "$PWD\.tools\node;$PWD\.tools;" + $env:Path
cd frontend
npx vite preview --port 5173 --host 127.0.0.1
```

### 3. Open in Browser
- **Frontend Dashboard:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI Interactive Swagger Docs:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Backend Health Check:** [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)

---

## 7. Running Backend Unit & Integration Tests

```powershell
$env:PYTHONPATH = "$PWD\backend"
.\backend\.venv\Scripts\pytest.exe backend\app\tests -v
```

All 5 core test suites pass:
1. `test_risk_engine_calculation`
2. `test_risk_engine_assess_zone`
3. `test_weather_service_structure`
4. `test_drainage_service_geojson`
5. `test_terrain_service`

---

## 8. Final Acceptance Criteria Verification

- [x] **Premium responsive frontend:** React 18, TypeScript, Tailwind CSS with custom civic-tech palette (`#172B36`, `#267C78`, `#F3F1E9`).
- [x] **Working FastAPI backend:** Real REST API endpoints running on port 8001.
- [x] **Relational Database:** SQLite/SQLAlchemy with 9 tables and persistent state.
- [x] **Real Weather API Integration:** Open-Meteo live hourly rainfall, 1h/3h/24h/72h historical rainfall, 6h/24h forecasts.
- [x] **Real Elevation API Integration:** Copernicus DEM 90m resolution elevation for all 34 pilot coordinates.
- [x] **Real Mapped Drainage Retrieval:** OpenStreetMap Overpass API QL waterway lines (Sukhna, Patiali, N-Choe, Gharuan cut).
- [x] **Interactive GIS Risk Map:** React Leaflet with dynamic color-coded risk overlays, layer toggles, and zone drawer.
- [x] **Zone Intelligence (34 Pilot Zones):** Dedicated views covering Chandigarh, Mohali, Kharar, CU Gharuan, and Zirakpur.
- [x] **Central Explainable Risk Engine:** $0.50P + 0.30D + 0.20T$ with plain-language automated justifications.
- [x] **Citizen Reporting Portal:** Public submission with browser geolocation, duplicate detection review, and operator triage.
- [x] **Prevention Priority Centre:** Ranked table with sorting, search, category filters, and CSV export.
- [x] **Action & Inspection Management:** Municipal work orders, crew dispatch, and status tracking.
- [x] **Decision Lab / What-If Simulator:** Sliders for rainfall, drainage clogging, and terrain with dynamic re-ranking.
- [x] **Data Trust Centre:** Transparency audit table for 5 data providers with live ping refresh.
- [x] **Working CSV Export:** Real-time CSV generation from live backend risk calculations.
- [x] **Judge Demo Mode:** 15-step interactive guided tour for evaluators.
- [x] **Honest Disclosures:** Model predictions explicitly distinguished from physical rain-gauge telemetry.

#   C i v i S e n s e - -  
 