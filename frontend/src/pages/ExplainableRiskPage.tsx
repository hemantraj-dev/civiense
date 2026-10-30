import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ShieldCheck, 
  Calculator, 
  BarChart2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { api } from '../services/api';
import { ZoneItem, ZoneIntelligence } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

export const ExplainableRiskPage: React.FC = () => {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(3); // Default to Sector 35
  const [intel, setIntel] = useState<ZoneIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      loadZoneIntel(selectedZoneId);
    }
  }, [selectedZoneId]);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const data = await api.getZones();
      setZones(data);
      if (data.length > 0) {
        setSelectedZoneId(data[0].id);
      }
    } catch (err) {
      console.error("Zones load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadZoneIntel = async (id: number) => {
    try {
      const data = await api.getZoneIntelligence(id);
      setIntel(data);
    } catch (err) {
      console.error("Intel error:", err);
    }
  };

  const contributionData = intel ? [
    {
      factor: 'Rainfall Risk (P)',
      weight: '50%',
      rawScore: intel.rainfall_indicator,
      contribution: roundTo1(intel.rainfall_indicator * 0.50),
      color: '#267C78'
    },
    {
      factor: 'Drainage Vulnerability (D)',
      weight: '30%',
      rawScore: intel.drainage_indicator,
      contribution: roundTo1(intel.drainage_indicator * 0.30),
      color: '#D69A42'
    },
    {
      factor: 'Terrain Depression (T)',
      weight: '20%',
      rawScore: intel.terrain_indicator,
      contribution: roundTo1(intel.terrain_indicator * 0.20),
      color: '#C75C54'
    }
  ] : [];

  function roundTo1(val: number) {
    return Math.round(val * 10) / 10;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              TRANSPARENT ALGORITHMIC GOVERNANCE
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Explainable Risk Intelligence Architecture
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Multi-criteria mathematical formulation, factor contribution breakdown, and transparent confidence auditing
            </p>
          </div>

          <div className="bg-[#F3F1E9] p-3 rounded-xl border border-[#E2E4DF] text-xs font-mono font-bold text-[#172B36]">
            Risk Score = 0.50·P + 0.30·D + 0.20·T
          </div>
        </div>
      </div>

      {/* Model Formulation Card */}
      <div className="bg-gradient-to-r from-[#172B36] to-[#263238] text-white rounded-2xl p-6 shadow-md border border-[#263238] space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#267C78]" />
          <h2 className="text-base font-heading font-bold">The CiviSense Initial Weighted Rule Model</h2>
        </div>

        <p className="text-xs text-[#83A69A] leading-relaxed">
          CiviSense implements a fully interpretable multi-criteria model specifically calibrated for the Shivalik piedmont and alluvial basin topography of Chandigarh and Punjab. Every single point in the 0–100 score is traceable to live physical inputs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#172B36]/80 border border-[#267C78]/40 p-4 rounded-xl space-y-1">
            <div className="text-xs font-bold text-[#267C78] flex items-center justify-between">
              <span>P: Rainfall Risk Factor</span>
              <span>Weight: 50%</span>
            </div>
            <p className="text-[11px] text-[#E2E4DF]">
              Normalized from recent 24h accumulated rainfall (mm), 6h predictive forecast volume, and precipitation probability curve.
            </p>
          </div>

          <div className="bg-[#172B36]/80 border border-[#D69A42]/40 p-4 rounded-xl space-y-1">
            <div className="text-xs font-bold text-[#D69A42] flex items-center justify-between">
              <span>D: Drainage Vulnerability</span>
              <span>Weight: 30%</span>
            </div>
            <p className="text-[11px] text-[#E2E4DF]">
              Captures land-use impervious runoff coefficients (commercial, industrial, residential) buffered by mapped OpenStreetMap waterways.
            </p>
          </div>

          <div className="bg-[#172B36]/80 border border-[#C75C54]/40 p-4 rounded-xl space-y-1">
            <div className="text-xs font-bold text-[#C75C54] flex items-center justify-between">
              <span>T: Terrain Basin Depression</span>
              <span>Weight: 20%</span>
            </div>
            <p className="text-[11px] text-[#E2E4DF]">
              Derived from Copernicus DEM 90m digital elevation. Calculates relative elevation difference against the 310m AMSL regional datum.
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#263238] rounded-xl border border-[#738087]/20 text-[11px] text-[#83A69A] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#D69A42] shrink-0" />
          <span>
            <strong>Scientifically Honest:</strong> A score of 78/100 represents a normalized vulnerability indicator, not an 78% mathematical probability of flooding.
          </span>
        </div>
      </div>

      {/* Interactive Zone Inspector */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E4DF] gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-[#172B36]">
              Inspect Zone Risk Decomposition
            </h3>
            <p className="text-xs text-[#738087]">Select any pilot location to see exact point contributions and natural language reasoning</p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(Number(e.target.value))}
              className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-xs font-semibold text-[#172B36] focus:outline-none focus:border-[#267C78]"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.zone_code} — {z.zone_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {intel && (
          <div className="space-y-6">
            {/* Zone Summary Capsule */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F3F1E9] rounded-xl border border-[#E2E4DF] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#267C78]">{intel.zone.zone_code}</span>
                  <span className="text-xs text-[#738087]">{intel.zone.district}</span>
                </div>
                <h4 className="font-heading font-extrabold text-xl text-[#172B36] mt-0.5">{intel.zone.zone_name}</h4>
                <div className="text-xs text-[#738087] mt-0.5">
                  Elevation: {intel.zone.elevation_m}m AMSL ({intel.zone.relative_elevation_diff_m > 0 ? `+${intel.zone.relative_elevation_diff_m}` : intel.zone.relative_elevation_diff_m}m vs datum)
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-extrabold font-heading text-[#172B36]">{intel.current_risk_score}</div>
                  <div className="text-[10px] text-[#738087]">Score / 100</div>
                </div>
                <RiskBadge category={intel.risk_category} score={intel.current_risk_score} showScore={false} />
              </div>
            </div>

            {/* Waterfall Contribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-[#E2E4DF] rounded-xl p-4">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#172B36] mb-3">
                  Score Contribution in Weighted Points
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contributionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DF" />
                      <XAxis dataKey="factor" tick={{ fontSize: 10, fill: '#172B36' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#738087' }} domain={[0, 50]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#172B36', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        formatter={(val: any) => [`${val} Points`, 'Contribution']}
                      />
                      <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                        {contributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Exact Calculation Breakdown Table */}
              <div className="border border-[#E2E4DF] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#172B36] mb-3">
                    Mathematical Proof
                  </h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E4DF] text-[#738087] text-[11px]">
                        <th className="text-left pb-2">Factor</th>
                        <th className="text-center pb-2">Raw (0-100)</th>
                        <th className="text-center pb-2">Weight</th>
                        <th className="text-right pb-2">Score Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4DF]">
                      {contributionData.map((row, i) => (
                        <tr key={i} className="py-2">
                          <td className="py-2.5 font-semibold text-[#172B36]">{row.factor}</td>
                          <td className="py-2.5 text-center font-mono text-[#738087]">{row.rawScore}</td>
                          <td className="py-2.5 text-center font-mono text-[#267C78] font-bold">{row.weight}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-[#172B36]">{row.contribution}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#172B36] font-bold">
                        <td className="pt-2 text-[#172B36]">Summed Risk Score</td>
                        <td className="pt-2"></td>
                        <td className="pt-2 text-center text-[#267C78]">100%</td>
                        <td className="pt-2 text-right font-mono text-[#172B36] text-sm">
                          {intel.current_risk_score} / 100
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-4 p-2.5 bg-[#F3F1E9] rounded-lg text-[11px] text-[#738087]">
                  Formula: (50% × {intel.rainfall_indicator}) + (30% × {intel.drainage_indicator}) + (20% × {intel.terrain_indicator}) = {intel.current_risk_score}
                </div>
              </div>
            </div>

            {/* Generated Plain-Language Explanation */}
            <div className="bg-[#172B36] text-white p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#83A69A] text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#438A69]" />
                <span>Autonomous Plain-Language Risk Explanation</span>
              </div>
              <p className="text-xs text-[#E2E4DF] leading-relaxed">
                "{intel.explanation}"
              </p>
              <div className="pt-2 text-[11px] text-[#83A69A] border-t border-[#263238] flex items-center justify-between">
                <span>Top Influencing Driver: {intel.top_factors[0]}</span>
                <ConfidenceBadge level={intel.confidence_level} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

