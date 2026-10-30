import React, { useEffect, useState } from 'react';
import { 
  CloudRain, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp, 
  Radio, 
  Droplets, 
  Wind, 
  Eye, 
  Compass,
  Sliders,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../services/api';
import { CityOverview, HourlyChartPoint } from '../types';
import { MetricCard } from '../components/MetricCard';
import { RiskBadge } from '../components/RiskBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ActiveTab } from '../components/Sidebar';

interface OverviewPageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectZone: (zoneId: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ 
  onNavigateTab, 
  onSelectZone 
}) => {
  const [data, setData] = useState<CityOverview | null>(null);
  const [riskDist, setRiskDist] = useState<any[]>([]);
  const [rainfallTrend, setRainfallTrend] = useState<HourlyChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [overview, dist, trend] = await Promise.all([
        api.getOverview(),
        api.getRiskDistribution(),
        api.getRainfallTrend()
      ]);
      setData(overview);
      setRiskDist(dist);
      setRainfallTrend(trend);
    } catch (err: any) {
      console.error("Overview load error:", err);
      setError("Unable to connect to backend server on port 8001. Please ensure FastAPI service is active.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-28 bg-white border border-[#E2E4DF] rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-white border border-[#E2E4DF] rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-[#E2E4DF] rounded-xl animate-pulse"></div>
          <div className="h-80 bg-white border border-[#E2E4DF] rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#C75C54]/30 max-w-2xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-[#C75C54] mx-auto mb-3" />
        <h3 className="font-heading font-bold text-lg text-[#172B36]">Control Room Connection Alert</h3>
        <p className="text-xs text-[#738087] mt-1">{error}</p>
        <button
          onClick={loadOverview}
          className="mt-4 px-4 py-2 bg-[#267C78] text-white rounded-lg text-xs font-semibold hover:bg-[#267C78]/90"
        >
          Retry Telemetry Sync
        </button>
      </div>
    );
  }

  const weather = data.current_weather;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Pilot Territory & Live Weather Telemetry */}
      <div className="bg-gradient-to-r from-[#172B36] to-[#263238] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#263238]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#267C78] text-white">
                MUNICIPAL DISASTER INTELLIGENCE PILOT
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#83A69A]">
                <Radio className="w-3 h-3 text-[#438A69] animate-pulse" />
                Live Sensor Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              {data.pilot_region}
            </h1>
            <p className="text-xs text-[#83A69A] mt-1">
              Urban waterlogging prevention command centre • 34 zones across Chandigarh, Mohali, Kharar, CU Gharuan & Zirakpur
            </p>
          </div>

          {/* Quick Weather Capsule */}
          <div className="bg-[#172B36]/80 border border-[#83A69A]/30 rounded-xl p-3 sm:px-4 flex items-center gap-4 sm:gap-6 self-start md:self-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#267C78]/30 rounded-lg text-[#83A69A]">
                <CloudRain className="w-6 h-6 text-[#83A69A]" />
              </div>
              <div>
                <div className="text-lg font-bold font-heading">{weather.temperature_c}°C</div>
                <div className="text-[10px] text-[#83A69A]">Humidity: {weather.relative_humidity}%</div>
              </div>
            </div>

            <div className="border-l border-[#83A69A]/20 pl-4 space-y-0.5 text-xs">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#83A69A]">24h Rain:</span>
                <span className="font-mono font-semibold text-white">{weather.rainfall_24h_mm} mm</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#83A69A]">6h Forecast:</span>
                <span className="font-mono font-semibold text-[#D69A42]">{weather.forecast_6h_mm} mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Pilot Zones"
          value={data.total_zones}
          subtitle="Chandigarh + Punjab Tri-City"
          icon={MapPin}
          onClick={() => onNavigateTab('zones')}
          badge={
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#267C78]/15 text-[#267C78] font-bold">
              34 Units
            </span>
          }
        />

        <MetricCard
          title="Critical & High Risk"
          value={data.critical_zones + data.high_priority_zones}
          subtitle={`City Avg Risk: ${data.average_city_risk_score}/100`}
          icon={AlertTriangle}
          onClick={() => onNavigateTab('priority-centre')}
          badge={
            <RiskBadge 
              category={data.critical_zones > 0 ? 'Critical' : data.high_priority_zones > 0 ? 'High' : 'Medium'} 
              showScore={false} 
            />
          }
        />

        <MetricCard
          title="Citizen Waterlogging Reports"
          value={data.citizen_reports_total}
          subtitle={`${data.verified_incidents} verified by field teams`}
          icon={CheckCircle}
          onClick={() => onNavigateTab('citizen-reports')}
          badge={
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D69A42]/15 text-[#D69A42] font-bold">
              {data.pending_inspections} Pending
            </span>
          }
        />

        <MetricCard
          title="Municipal Action Orders"
          value={data.active_action_orders}
          subtitle="Inspections & pump deployments"
          icon={ShieldCheck}
          onClick={() => onNavigateTab('actions')}
          badge={
            <span className="text-xs px-2 py-0.5 rounded bg-[#438A69]/15 text-[#438A69] font-bold">
              Active
            </span>
          }
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rainfall & Precipitation Probability (48-Hour Model) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E4DF] gap-2">
            <div>
              <h2 className="font-heading font-bold text-base text-[#172B36]">
                48-Hour Rainfall & Precipitation Probability Trend
              </h2>
              <p className="text-xs text-[#738087]">
                Open-Meteo Seamless Numerical Weather Model (Past 24h Historical + Next 24h Predictive Forecast)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#267C78]"></span>
                Precipitation (mm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#D69A42]"></span>
                Probability (%)
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallTrend.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#267C78" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#267C78" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D69A42" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D69A42" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E4DF" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(t) => t.includes('T') ? t.split('T')[1].slice(0, 5) : t}
                  tick={{ fontSize: 10, fill: '#738087' }} 
                />
                <YAxis tick={{ fontSize: 10, fill: '#738087' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#172B36', borderColor: '#263238', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  labelFormatter={(l) => `Time: ${String(l).replace('T', ' ')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="precipitation_mm" 
                  name="Rainfall (mm)" 
                  stroke="#267C78" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#precipGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="precipitation_probability" 
                  name="Probability (%)" 
                  stroke="#D69A42" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#probGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#738087] pt-2 border-t border-[#E2E4DF]">
            <span>Units: Millimetres (mm) & Percentage (%)</span>
            <span className="font-medium text-[#267C78]">Attribution: Open-Meteo CC BY 4.0</span>
          </div>
        </div>

        {/* Right Col: Risk Category Distribution */}
        <div className="bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#E2E4DF]">
              <h2 className="font-heading font-bold text-base text-[#172B36]">
                Zone Risk Categorization
              </h2>
              <p className="text-xs text-[#738087]">
                Distribution across 34 pilot study locations
              </p>
            </div>

            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDist} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E4DF" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#738087' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#172B36' }} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#172B36', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {riskDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#F3F1E9] p-3 rounded-lg border border-[#E2E4DF] text-xs space-y-1">
            <div className="font-semibold text-[#172B36] flex items-center justify-between">
              <span>Weighted Formula</span>
              <span className="text-[#267C78]">0.5P + 0.3D + 0.2T</span>
            </div>
            <p className="text-[11px] text-[#738087] leading-relaxed">
              P = Rainfall risk, D = Drainage vulnerability, T = Macro-terrain depression.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top 5 Priority Inspection Hotspots & Quick Action Pathways */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E4DF] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-[#172B36]">
                Top Vulnerable Priority Zones
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C75C54]/15 text-[#C75C54] font-bold">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#738087]">
              Ranked by explainable multi-criteria score (updated automatically upon weather & terrain refresh)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('priority-centre')}
              className="text-xs font-semibold text-[#267C78] hover:text-[#172B36] flex items-center gap-1 transition-colors"
            >
              <span>View All 34 Zones</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hotspots List */}
        <div className="divide-y divide-[#E2E4DF] mt-1">
          {data.top_vulnerable_zones.map((zone, idx) => (
            <div 
              key={zone.zone_id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F3F1E9]/50 px-2 rounded-lg transition-colors cursor-pointer"
              onClick={() => {
                onSelectZone(zone.zone_id);
                onNavigateTab('map');
              }}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#172B36] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172B36]">{zone.zone_name}</span>
                    <span className="text-xs font-mono text-[#738087]">({zone.zone_code})</span>
                  </div>
                  <div className="text-xs text-[#738087] flex items-center gap-2 mt-0.5">
                    <span>{zone.district}</span>
                    <span>•</span>
                    <span>{zone.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                <RiskBadge category={zone.risk_category} score={zone.risk_score} />
                <ConfidenceBadge level={zone.confidence_level} />
                <button
                  className="px-2.5 py-1 text-xs rounded bg-[#267C78]/10 text-[#267C78] font-medium hover:bg-[#267C78] hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectZone(zone.zone_id);
                    onNavigateTab('map');
                  }}
                >
                  Locate on GIS Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
