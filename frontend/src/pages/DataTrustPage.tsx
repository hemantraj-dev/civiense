import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Radio, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Database,
  Layers,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { DataSourceStatus } from '../types';

export const DataTrustPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDataSourcesStatus();
      setSources(data);
    } catch (err) {
      console.error("Sources error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshMessage(null);
      const res = await api.refreshDataSources();
      setRefreshMessage("Live API refresh completed: External providers queried and telemetry synced.");
      loadSources();
    } catch (err) {
      alert("Failed to refresh external data sources.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'LIVE / RECENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#438A69]/15 text-[#438A69] border border-[#438A69]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#438A69] animate-pulse"></span>
          <span>LIVE / RECENT</span>
        </span>
      );
    } else if (status === 'HISTORICAL' || status === 'ESTIMATED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#D69A42]/15 text-[#8F781A] border border-[#D69A42]/30">
          <span>{status}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#C75C54]/15 text-[#C75C54]">
          <span>{status}</span>
        </span>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              DATA INTEGRITY & ETHICAL TRANSPARENCY
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Data Trust Centre
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Transparent live telemetry audit of all 5 external and crowdsourced information providers
            </p>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Pinging External APIs...' : 'Trigger Live Telemetry Refresh'}</span>
          </button>
        </div>

        {refreshMessage && (
          <div className="mt-4 p-3 bg-[#438A69]/10 border border-[#438A69]/30 rounded-lg text-xs text-[#438A69] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}
      </div>

      {/* Core Transparency Charter */}
      <div className="bg-[#172B36] text-white p-5 rounded-2xl border border-[#263238] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#83A69A] font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#267C78]" />
          <span>The CiviSense Civic-Tech Data Transparency Mandate</span>
        </div>
        <p className="text-[#E2E4DF] leading-relaxed">
          In high-stakes municipal operations, false certainty can lead to flawed emergency resource deployment. CiviSense enforces rigorous epistemic honesty:
          <strong> A provider is never marked LIVE merely because a URL exists.</strong> Numerical weather forecasts are never disguised as physical rain gauges, community-mapped drainage is explicitly disclosed as incomplete, and Copernicus 90m DEM is clearly distinguished from micro-curb topography.
        </p>
      </div>

      {/* Data Providers Audit Cards */}
      <div className="space-y-4">
        {sources.map((s, idx) => (
          <div key={idx} className="bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#E2E4DF]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-base text-[#172B36]">{s.provider}</span>
                  {getStatusBadge(s.status)}
                </div>
                <div className="text-xs text-[#267C78] font-semibold mt-0.5">{s.dataset}</div>
                <div className="text-[11px] font-mono text-[#738087] mt-0.5 truncate max-w-xl">
                  Endpoint: {s.endpoint}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5 shrink-0">
                <div className="text-[11px] text-[#738087]">
                  Response Latency: <span className="font-mono font-bold text-[#172B36]">{s.response_time_ms} ms</span>
                </div>
                <div className="text-[10px] text-[#738087] font-mono">
                  Last Sync: {new Date(s.retrieved_at).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F3F1E9] p-3 rounded-lg border border-[#E2E4DF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#738087] block">Spatial Resolution</span>
                <span className="font-medium text-[#172B36]">{s.spatial_resolution}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#738087] block">Geographic Boundary</span>
                <span className="font-medium text-[#172B36]">{s.geographic_coverage}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#738087] block">Measured Metric Units</span>
                <span className="font-medium text-[#172B36]">{s.units}</span>
              </div>
            </div>

            {/* Known Limitations */}
            <div className="text-xs text-[#738087] flex items-start gap-2 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D69A42] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#172B36]">Documented Operational Limitations:</strong> {s.limitations}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

