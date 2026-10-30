import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Polyline, 
  CircleMarker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import { 
  Layers, 
  Filter, 
  Info, 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Search,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ZoneItem, CitizenReport, ZoneIntelligence } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ActiveTab } from '../components/Sidebar';

interface GisMapPageProps {
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

// Controller to smoothly pan/zoom when a zone is selected
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const GisMapPage: React.FC<GisMapPageProps> = ({
  selectedZoneId,
  onSelectZone,
  onNavigateTab
}) => {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [drainageFeatures, setDrainageFeatures] = useState<any[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedIntelligence, setSelectedIntelligence] = useState<ZoneIntelligence | null>(null);
  
  // Layer Toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showDrainage, setShowDrainage] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);
  
  // Filter by District
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Map Center (Chandigarh Tri-City reference: 30.7333, 76.7794)
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.7333, 76.7794]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      loadZoneIntelligence(selectedZoneId);
      const found = zones.find(z => z.id === selectedZoneId);
      if (found) {
        setMapCenter([found.representative_latitude, found.representative_longitude]);
        setMapZoom(14);
      }
    } else {
      setSelectedIntelligence(null);
    }
  }, [selectedZoneId, zones]);

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      const [zonesData, drainageData, reportsData] = await Promise.all([
        api.getZones(),
        api.getDrainageFeatures(),
        api.getReports()
      ]);
      setZones(zonesData);
      setDrainageFeatures(drainageData.features || []);
      setReports(reportsData);
    } catch (err) {
      console.error("Map data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadZoneIntelligence = async (zoneId: number) => {
    try {
      const intel = await api.getZoneIntelligence(zoneId);
      setSelectedIntelligence(intel);
    } catch (err) {
      console.error("Error loading zone intelligence:", err);
    }
  };

  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'Critical': return '#B94B48';
      case 'High': return '#D18A35';
      case 'Medium': return '#D2B64B';
      default: return '#438A69';
    }
  };

  const filteredZones = zones.filter(z => {
    const matchDistrict = selectedDistrict === 'All' || z.district.includes(selectedDistrict);
    const matchSearch = z.zone_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        z.zone_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchSearch;
  });

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#F3F1E9]">
      {/* Top Map Action & Control Bar */}
      <div className="bg-[#172B36] text-white px-4 py-2.5 z-20 shadow-md border-b border-[#263238] flex flex-wrap items-center justify-between gap-3">
        {/* District Filter & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#83A69A]">
            <Filter className="w-3.5 h-3.5" />
            <span>District:</span>
          </div>
          {['All', 'Chandigarh', 'SAS Nagar', 'Gharuan', 'Kharar', 'Zirakpur'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedDistrict === d 
                  ? 'bg-[#267C78] text-white shadow-xs' 
                  : 'bg-[#263238] text-[#83A69A] hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Attribution */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#83A69A] hover:text-white">
            <input 
              type="checkbox" 
              checked={showZones} 
              onChange={e => setShowZones(e.target.checked)}
              className="accent-[#267C78] rounded"
            />
            <span>Zones ({zones.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#83A69A] hover:text-white">
            <input 
              type="checkbox" 
              checked={showDrainage} 
              onChange={e => setShowDrainage(e.target.checked)}
              className="accent-[#267C78] rounded"
            />
            <span>OSM Waterways</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#83A69A] hover:text-white">
            <input 
              type="checkbox" 
              checked={showReports} 
              onChange={e => setShowReports(e.target.checked)}
              className="accent-[#267C78] rounded"
            />
            <span>Citizen Reports ({reports.length})</span>
          </label>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />

          {/* Standard Clean OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 1. Mapped Waterways (OSM Overpass / GeoJSON Lines) */}
          {showDrainage && drainageFeatures.map((f, i) => {
            const geom = f.geometry;
            if (!geom || geom.type !== 'LineString') return null;
            // Leaflet requires [lat, lon] while GeoJSON uses [lon, lat]
            const positions: [number, number][] = geom.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            const isCanalOrRiver = f.properties.feature_type === 'canal' || f.properties.feature_type === 'river';

            return (
              <Polyline
                key={`drainage-${f.properties.osm_id || i}`}
                positions={positions}
                pathOptions={{
                  color: isCanalOrRiver ? '#006699' : '#267C78',
                  weight: isCanalOrRiver ? 4 : 2.5,
                  dashArray: f.properties.feature_type === 'ditch' ? '4 4' : undefined,
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <div className="font-bold text-[#172B36]">{f.properties.name}</div>
                    <div className="text-[10px] uppercase text-[#267C78] font-bold">
                      {f.properties.coverage_label || 'MAPPED DRAINAGE COVERAGE — OPENSTREETMAP'}
                    </div>
                    <div className="text-[11px] text-[#738087]">
                      Type: <span className="font-semibold">{f.properties.feature_type}</span> | Length: ~{f.properties.length_m}m
                    </div>
                    <div className="text-[10px] text-[#C75C54] italic">
                      Disclaimer: Community-mapped surface waterway. Does not guarantee live flow or underground storm sewer capacity.
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* 2. Pilot Zones (Illustrative Polygons & Centroid Circle Markers) */}
          {showZones && filteredZones.map(zone => {
            const riskColor = getRiskColor(zone.risk_category);
            const isSelected = zone.id === selectedZoneId;

            let polygonCoords: [number, number][] = [];
            try {
              if (zone.boundary_geojson) {
                const parsed = JSON.parse(zone.boundary_geojson);
                if (parsed.coordinates && parsed.coordinates[0]) {
                  polygonCoords = parsed.coordinates[0].map((c: [number, number]) => [c[1], c[0]]);
                }
              }
            } catch (e) {
              console.error("Boundary parse error for", zone.zone_code);
            }

            return (
              <React.Fragment key={`zone-${zone.id}`}>
                {polygonCoords.length > 0 && (
                  <Polygon
                    positions={polygonCoords}
                    pathOptions={{
                      color: riskColor,
                      fillColor: riskColor,
                      fillOpacity: isSelected ? 0.45 : 0.22,
                      weight: isSelected ? 3 : 1.5,
                      dashArray: zone.is_illustrative_boundary ? '4 4' : undefined
                    }}
                    eventHandlers={{
                      click: () => onSelectZone(zone.id)
                    }}
                  />
                )}

                {/* Zone Centroid Marker */}
                <CircleMarker
                  center={[zone.representative_latitude, zone.representative_longitude]}
                  radius={isSelected ? 9 : 6}
                  pathOptions={{
                    color: '#172B36',
                    fillColor: riskColor,
                    fillOpacity: 1,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => onSelectZone(zone.id)
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-[#172B36]">{zone.zone_name}</div>
                      <div className="text-[11px] text-[#738087]">
                        Code: <span className="font-mono font-semibold">{zone.zone_code}</span> | {zone.district}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <RiskBadge category={zone.risk_category} score={zone.current_risk_score} />
                        <ConfidenceBadge level={zone.confidence_level} />
                      </div>
                      <div className="text-[11px] text-[#738087] pt-1">
                        Elevation: <span className="font-mono">{zone.elevation_m}m AMSL</span> ({zone.relative_elevation_diff_m > 0 ? `+${zone.relative_elevation_diff_m}` : zone.relative_elevation_diff_m}m)
                      </div>
                      <button
                        onClick={() => onSelectZone(zone.id)}
                        className="mt-2 w-full py-1 text-center bg-[#267C78] text-white rounded text-[11px] font-semibold"
                      >
                        Inspect Zone Intelligence
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* 3. Citizen Incident Markers */}
          {showReports && reports.map(r => {
            const isVerified = r.verification_status === 'Verified';
            const markerColor = isVerified ? '#C75C54' : r.verification_status === 'Under Review' ? '#D69A42' : '#738087';

            return (
              <CircleMarker
                key={`report-${r.id}`}
                center={[r.latitude, r.longitude]}
                radius={isVerified ? 7 : 5}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: markerColor,
                  fillOpacity: 0.9,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#172B36]">{r.report_number}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isVerified ? 'bg-[#C75C54]/20 text-[#C75C54]' : 'bg-[#D69A42]/20 text-[#D69A42]'
                      }`}>
                        {r.verification_status}
                      </span>
                    </div>
                    <div className="font-semibold text-[#172B36]">{r.location_name}</div>
                    <p className="text-[11px] text-[#738087] line-clamp-2">{r.description}</p>
                    {r.water_depth_cm && (
                      <div className="text-[10px] font-mono text-[#C75C54]">
                        Reported Depth: ~{r.water_depth_cm} cm
                      </div>
                    )}
                    {r.is_potential_duplicate && (
                      <div className="text-[10px] bg-[#D69A42]/15 text-[#D69A42] p-1 rounded font-medium">
                        Duplicate proximity match flagged for review
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-[#E2E4DF] rounded-xl p-3 shadow-lg max-w-xs text-xs space-y-2">
          <div className="font-bold text-[#172B36] text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>Risk Map Legend</span>
            <span className="text-[10px] text-[#738087] font-normal">Punjab Pilot</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#B94B48]"></span>
              <span>Critical (80-100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#D18A35]"></span>
              <span>High (60-79)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#D2B64B]"></span>
              <span>Medium (35-59)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#438A69]"></span>
              <span>Low (0-34)</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#E2E4DF] space-y-1 text-[10px] text-[#738087]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#006699]"></span>
              <span>Mapped Canal / River (Sukhna, Patiali)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#267C78]"></span>
              <span>Surface Drainage Ditch / N-Choe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C75C54]"></span>
              <span>Verified Citizen Waterlogging Report</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Intelligence Flyout Drawer (Right Side) */}
        {selectedIntelligence && (
          <div className="absolute top-4 right-4 bottom-4 z-20 w-80 sm:w-96 bg-white border border-[#E2E4DF] rounded-2xl shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E4DF]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#267C78]/15 text-[#267C78]">
                      {selectedIntelligence.zone.district}
                    </span>
                    <span className="font-mono text-xs text-[#738087] font-semibold">
                      {selectedIntelligence.zone.zone_code}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-[#172B36] mt-1 leading-snug">
                    {selectedIntelligence.zone.zone_name}
                  </h3>
                  <div className="text-xs text-[#738087] mt-0.5">
                    {selectedIntelligence.zone.category}
                  </div>
                </div>

                <button
                  onClick={() => onSelectZone(null)}
                  className="p-1 text-[#738087] hover:text-[#172B36] hover:bg-[#F3F1E9] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score Capsule */}
              <div className="bg-[#F3F1E9] p-3.5 rounded-xl border border-[#E2E4DF] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#738087] font-medium">Explainable Risk Score</div>
                  <div className="text-3xl font-extrabold font-heading text-[#172B36]">
                    {selectedIntelligence.current_risk_score}
                    <span className="text-sm font-normal text-[#738087]"> / 100</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <RiskBadge 
                    category={selectedIntelligence.risk_category} 
                    score={selectedIntelligence.current_risk_score} 
                    showScore={false} 
                  />
                  <ConfidenceBadge 
                    level={selectedIntelligence.confidence_level} 
                    explanation={selectedIntelligence.confidence_explanation}
                  />
                </div>
              </div>

              {/* Factor Decomposition */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#172B36] uppercase tracking-wide">
                  Criteria Decomposition
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#738087]">Rainfall Risk (P: 50% wt)</span>
                      <span className="font-mono font-bold text-[#172B36]">{selectedIntelligence.rainfall_indicator}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E4DF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#267C78] rounded-full" style={{ width: `${selectedIntelligence.rainfall_indicator}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#738087]">Drainage Vulnerability (D: 30% wt)</span>
                      <span className="font-mono font-bold text-[#172B36]">{selectedIntelligence.drainage_indicator}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E4DF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D69A42] rounded-full" style={{ width: `${selectedIntelligence.drainage_indicator}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#738087]">Terrain Depression (T: 20% wt)</span>
                      <span className="font-mono font-bold text-[#172B36]">{selectedIntelligence.terrain_indicator}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E4DF] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C75C54] rounded-full" style={{ width: `${selectedIntelligence.terrain_indicator}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elevation & Terrain Details */}
              <div className="bg-[#172B36] text-white p-3 rounded-xl text-xs space-y-1">
                <div className="text-[#83A69A] text-[10px] uppercase font-bold">Copernicus DEM 90m Resolution</div>
                <div className="flex items-center justify-between">
                  <span>Elevation AMSL:</span>
                  <span className="font-mono font-bold">{selectedIntelligence.zone.elevation_m} metres</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#83A69A]">
                  <span>Relative vs Regional Mean:</span>
                  <span className="font-mono">
                    {selectedIntelligence.zone.relative_elevation_diff_m > 0 ? `+${selectedIntelligence.zone.relative_elevation_diff_m}` : selectedIntelligence.zone.relative_elevation_diff_m} m
                  </span>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="text-xs text-[#738087] bg-white border border-[#E2E4DF] p-3 rounded-xl leading-relaxed">
                <strong className="text-[#172B36] block mb-1">Risk Justification:</strong>
                {selectedIntelligence.explanation}
              </div>

              {/* Recommended Action */}
              <div className="bg-[#438A69]/10 border border-[#438A69]/30 p-3 rounded-xl text-xs">
                <strong className="text-[#438A69] block mb-0.5">Municipal Preventive Action:</strong>
                <span className="text-[#172B36]">{selectedIntelligence.recommended_action}</span>
              </div>
            </div>

            {/* Bottom Button to Zone Intelligence */}
            <button
              onClick={() => onNavigateTab('zones')}
              className="mt-4 w-full py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>View Full Zone Intelligence Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

