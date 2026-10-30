import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight, 
  Droplets, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ZoneItem, ZoneIntelligence } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ActiveTab } from '../components/Sidebar';

interface ZoneIntelligencePageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectZone: (zoneId: number) => void;
}

export const ZoneIntelligencePage: React.FC<ZoneIntelligencePageProps> = ({
  onNavigateTab,
  onSelectZone
}) => {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneItem | null>(null);
  const [intelligence, setIntelligence] = useState<ZoneIntelligence | null>(null);
  const [search, setSearch] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingIntel, setIsLoadingIntel] = useState<boolean>(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const data = await api.getZones();
      setZones(data);
      if (data.length > 0) {
        handleSelectZone(data[0]);
      }
    } catch (err) {
      console.error("Zones load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectZone = async (zone: ZoneItem) => {
    setSelectedZone(zone);
    try {
      setIsLoadingIntel(true);
      const intel = await api.getZoneIntelligence(zone.id);
      setIntelligence(intel);
    } catch (err) {
      console.error("Zone intel error:", err);
    } finally {
      setIsLoadingIntel(false);
    }
  };

  const filteredZones = zones.filter(z => {
    const matchDistrict = districtFilter === 'All' || z.district.includes(districtFilter);
    const matchCategory = categoryFilter === 'All' || z.category === categoryFilter;
    const matchSearch = z.zone_name.toLowerCase().includes(search.toLowerCase()) || 
                        z.zone_code.toLowerCase().includes(search.toLowerCase());
    return matchDistrict && matchCategory && matchSearch;
  });

  const categories = Array.from(new Set(zones.map(z => z.category)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              MONITORED PILOT JURISDICTIONS
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Zone Intelligence Directory (34 Pilot Sectors)
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Topographic elevation, mapped drainage buffers, citizen incident histories, and explainable multi-factor scoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#F3F1E9] px-3 py-1.5 rounded-lg border border-[#E2E4DF] font-mono text-[#172B36]">
              {filteredZones.length} of {zones.length} Zones
            </span>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#738087]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter zones (e.g. Sector 35, CU Gate, Baltana)..."
            className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#172B36] placeholder-[#738087] focus:outline-none focus:border-[#267C78]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* District Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#738087]">
            <span className="font-semibold">Territory:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-2.5 py-1 text-xs text-[#172B36] focus:outline-none"
            >
              <option value="All">All Territories (34)</option>
              <option value="Chandigarh">Chandigarh UT (16)</option>
              <option value="SAS Nagar">SAS Nagar Mohali (8)</option>
              <option value="Kharar">Kharar & Sunny Enclave (2)</option>
              <option value="Gharuan">Gharuan & CU Campus (3)</option>
              <option value="Zirakpur">Zirakpur & Confluences (2)</option>
              <option value="Panchkula">Panchkula & Dera Bassi (2)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#738087]">
            <span className="font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-2.5 py-1 text-xs text-[#172B36] focus:outline-none max-w-xs"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Zone List on Left, Comprehensive Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Zone List (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E4DF] rounded-xl shadow-sm overflow-hidden flex flex-col h-[680px]">
          <div className="p-3 border-b border-[#E2E4DF] bg-[#F3F1E9] text-xs font-bold text-[#172B36] flex items-center justify-between">
            <span>Pilot Zones Directory</span>
            <span className="text-[#738087] font-mono">{filteredZones.length} listed</span>
          </div>

          <div className="overflow-y-auto divide-y divide-[#E2E4DF] flex-1">
            {filteredZones.map(zone => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`p-3.5 transition-colors cursor-pointer text-left flex items-center justify-between ${
                    isSelected ? 'bg-[#267C78]/10 border-l-4 border-[#267C78]' : 'hover:bg-[#F3F1E9]/60'
                  }`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#172B36]">{zone.zone_code}</span>
                      <span className="text-[10px] text-[#738087] truncate">({zone.district})</span>
                    </div>
                    <div className="text-xs font-semibold text-[#172B36] truncate">{zone.zone_name}</div>
                    <div className="text-[10px] text-[#738087] flex items-center gap-1.5">
                      <span>Elev: {zone.elevation_m}m</span>
                      <span>•</span>
                      <span className={zone.relative_elevation_diff_m < -5 ? 'text-[#C75C54] font-medium' : ''}>
                        {zone.relative_elevation_diff_m > 0 ? `+${zone.relative_elevation_diff_m}` : zone.relative_elevation_diff_m}m diff
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <RiskBadge category={zone.risk_category} score={zone.current_risk_score} />
                    <ChevronRight className="w-4 h-4 text-[#738087]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Zone Detailed Intelligence Dossier (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E4DF] rounded-xl shadow-sm p-6 flex flex-col justify-between">
          {isLoadingIntel || !intelligence ? (
            <div className="h-full flex items-center justify-center p-12 text-center text-[#738087]">
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-[#267C78] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs">Loading Zone Multi-Criteria Assessment...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[#E2E4DF] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#172B36] text-white">
                      {intelligence.zone.zone_code}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#267C78]/15 text-[#267C78] font-semibold">
                      {intelligence.zone.district}
                    </span>
                    <span className="text-xs text-[#738087]">
                      {intelligence.zone.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#172B36] mt-2">
                    {intelligence.zone.zone_name}
                  </h2>
                  <div className="text-xs text-[#738087] mt-1 flex items-center gap-3">
                    <span>Coordinates: {intelligence.zone.representative_latitude.toFixed(4)}°N, {intelligence.zone.representative_longitude.toFixed(4)}°E</span>
                    <span>•</span>
                    <span className="italic">Illustrative Boundary Grid</span>
                  </div>
                </div>

                <div className="bg-[#F3F1E9] p-4 rounded-xl border border-[#E2E4DF] text-center shrink-0">
                  <div className="text-[10px] uppercase font-bold text-[#738087]">Calculated Risk Score</div>
                  <div className="text-3xl font-extrabold font-heading text-[#172B36]">
                    {intelligence.current_risk_score}
                    <span className="text-xs font-normal text-[#738087]"> / 100</span>
                  </div>
                  <div className="mt-1">
                    <RiskBadge category={intelligence.risk_category} score={intelligence.current_risk_score} showScore={false} />
                  </div>
                </div>
              </div>

              {/* Data Confidence Banner */}
              <div className="bg-[#F3F1E9] p-3 rounded-xl border border-[#E2E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ConfidenceBadge level={intelligence.confidence_level} />
                  <span className="text-[#172B36] font-medium">{intelligence.confidence_explanation}</span>
                </div>
                <span className="text-[10px] text-[#738087] font-mono">
                  Assessed: {new Date(intelligence.last_assessed).toLocaleTimeString()}
                </span>
              </div>

              {/* Multi-Criteria Factor Breakdown (Formula Explanation) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-[#E2E4DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172B36]">Rainfall Risk (P)</span>
                    <span className="font-mono text-xs font-bold text-[#267C78]">{intelligence.rainfall_indicator}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E4DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#267C78]" style={{ width: `${intelligence.rainfall_indicator}%` }}></div>
                  </div>
                  <div className="text-[11px] text-[#738087]">
                    Weight: 50% • 24h rain & near-term 6h predictive cloudburst volume.
                  </div>
                </div>

                <div className="border border-[#E2E4DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172B36]">Drainage Indicator (D)</span>
                    <span className="font-mono text-xs font-bold text-[#D69A42]">{intelligence.drainage_indicator}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E4DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D69A42]" style={{ width: `${intelligence.drainage_indicator}%` }}></div>
                  </div>
                  <div className="text-[11px] text-[#738087]">
                    Weight: 30% • High imperviousness & mapped waterway buffer relief.
                  </div>
                </div>

                <div className="border border-[#E2E4DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172B36]">Terrain Depression (T)</span>
                    <span className="font-mono text-xs font-bold text-[#C75C54]">{intelligence.terrain_indicator}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E4DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C75C54]" style={{ width: `${intelligence.terrain_indicator}%` }}></div>
                  </div>
                  <div className="text-[11px] text-[#738087]">
                    Weight: 20% • Relative elevation vs 310m AMSL regional datum.
                  </div>
                </div>
              </div>

              {/* Natural Language Plain Reasoning */}
              <div className="bg-[#172B36] text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#83A69A] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#267C78]" />
                  <span>Explainable Engine Assessment Summary</span>
                </div>
                <p className="text-xs text-[#E2E4DF] leading-relaxed">
                  {intelligence.explanation}
                </p>
                <div className="pt-2 border-t border-[#263238] flex flex-wrap gap-2">
                  {intelligence.top_factors.map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#263238] text-[#D69A42] border border-[#738087]/30">
                      Factor #{i+1}: {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action Capsule */}
              <div className="bg-[#438A69]/10 border border-[#438A69]/30 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#438A69] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#438A69] uppercase tracking-wide">
                    Recommended Preventive Response
                  </div>
                  <div className="text-xs text-[#172B36] font-medium leading-relaxed">
                    {intelligence.recommended_action}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onSelectZone(intelligence.zone.id);
                    onNavigateTab('map');
                  }}
                  className="px-4 py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View on GIS Map</span>
                </button>

                <button
                  onClick={() => onNavigateTab('actions')}
                  className="px-4 py-2 bg-white border border-[#267C78] text-[#267C78] hover:bg-[#267C78]/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Dispatch Municipal Action Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

