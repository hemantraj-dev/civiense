import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ScenarioPreset, ScenarioResponse, ScenarioZoneResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const DecisionLabPage: React.FC = () => {
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>('normal');
  
  // Sliders
  const [rainfallModifier, setRainfallModifier] = useState<number>(1.0);
  const [drainageModifier, setDrainageModifier] = useState<number>(1.0);
  const [terrainModifier, setTerrainModifier] = useState<number>(1.0);
  
  // Simulation results
  const [simResults, setSimResults] = useState<ScenarioResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    loadPresetsAndInitialSimulation();
  }, []);

  const loadPresetsAndInitialSimulation = async () => {
    try {
      const p = await api.getScenarioPresets();
      setPresets(p);
      runSimulation("Baseline Scenario", 1.0, 1.0, 1.0);
    } catch (err) {
      console.error("Presets load error:", err);
    }
  };

  const handleSelectPreset = (p: ScenarioPreset) => {
    setActivePresetId(p.id);
    setRainfallModifier(p.rainfall_modifier);
    setDrainageModifier(p.drainage_stress_modifier);
    setTerrainModifier(p.terrain_vulnerability_modifier);
    runSimulation(p.name, p.rainfall_modifier, p.drainage_stress_modifier, p.terrain_vulnerability_modifier);
  };

  const runSimulation = async (name: string, rMod: number, dMod: number, tMod: number) => {
    try {
      setIsSimulating(true);
      const res = await api.simulateScenario({
        scenario_name: name,
        rainfall_modifier: rMod,
        drainage_stress_modifier: dMod,
        terrain_vulnerability_modifier: tMod
      });
      setSimResults(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSliderChange = (r: number, d: number, t: number) => {
    setActivePresetId('custom');
    setRainfallModifier(r);
    setDrainageModifier(d);
    setTerrainModifier(t);
    runSimulation("Custom Operator Stress Test", r, d, t);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              SIGNATURE PREDICTIVE STRESS LAB
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Decision Lab / What-If Scenario Simulator
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Simulate cloudbursts, drain clogging, and preventive maintenance interventions across all 34 zones simultaneously
            </p>
          </div>

          <div className="bg-[#D69A42]/15 text-[#8F781A] px-3 py-1.5 rounded-lg border border-[#D69A42]/30 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D69A42]" />
            <span>Dynamic Multi-Criteria Re-ranking</span>
          </div>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold text-[#172B36] uppercase tracking-wider flex items-center justify-between">
          <span>Standard Operational Scenario Presets</span>
          <span className="text-[11px] text-[#738087] font-normal">Click a scenario to evaluate citywide impact</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {presets.map(p => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#267C78] text-white border-[#267C78] shadow-sm' 
                    : 'bg-[#F3F1E9] text-[#172B36] border-[#E2E4DF] hover:border-[#83A69A]'
                }`}
              >
                <div className="font-bold text-xs leading-snug">{p.name}</div>
                <div className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-[#738087]'}`}>
                  {p.description}
                </div>
                <div className={`mt-2 font-mono text-[10px] font-semibold pt-1 border-t ${
                  isSelected ? 'border-white/20 text-white' : 'border-[#E2E4DF] text-[#267C78]'
                }`}>
                  Rain: {p.rainfall_modifier}x • Drain: {p.drainage_stress_modifier}x
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Simulator Engine Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sliders (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm space-y-5">
          <div className="pb-3 border-b border-[#E2E4DF] flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#172B36]">
              Parameter Controls
            </h3>
            <button
              onClick={() => {
                const norm = presets.find(p => p.id === 'normal');
                if (norm) handleSelectPreset(norm);
              }}
              className="text-xs text-[#267C78] hover:text-[#172B36] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: Rainfall Multiplier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B36]">Rainfall Multiplier</span>
              <span className="font-mono font-extrabold text-[#267C78] bg-[#267C78]/10 px-2 py-0.5 rounded">
                {rainfallModifier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={rainfallModifier}
              onChange={e => handleSliderChange(parseFloat(e.target.value), drainageModifier, terrainModifier)}
              className="w-full accent-[#267C78] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#738087]">
              <span>0.5x (Light drizzle)</span>
              <span>1.0x (Observed)</span>
              <span>3.0x (Severe cloudburst)</span>
            </div>
          </div>

          {/* Slider 2: Drainage Stress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B36]">Drainage Conduit Stress</span>
              <span className="font-mono font-extrabold text-[#D69A42] bg-[#D69A42]/10 px-2 py-0.5 rounded">
                {drainageModifier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={drainageModifier}
              onChange={e => handleSliderChange(rainfallModifier, parseFloat(e.target.value), terrainModifier)}
              className="w-full accent-[#D69A42] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#738087]">
              <span>0.5x (Clean desilted drains)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Clogged culverts)</span>
            </div>
          </div>

          {/* Slider 3: Terrain Vulnerability */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B36]">Terrain Ponding Sensitivity</span>
              <span className="font-mono font-extrabold text-[#C75C54] bg-[#C75C54]/10 px-2 py-0.5 rounded">
                {terrainModifier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={terrainModifier}
              onChange={e => handleSliderChange(rainfallModifier, drainageModifier, parseFloat(e.target.value))}
              className="w-full accent-[#C75C54] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#738087]">
              <span>0.8x (Dry absorption)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Saturated soil)</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-[#F3F1E9] border border-[#E2E4DF] rounded-xl text-[11px] text-[#738087] leading-relaxed">
            <strong className="text-[#172B36] block mb-0.5">Scientific Sandbox Guardrail:</strong>
            Scenario results are simulated projections calculated on the fly. Live physical telemetry is never overwritten.
          </div>
        </div>

        {/* Right: Comparative Impact Analytics & Re-ranked Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {simResults && (
            <>
              {/* Macro Impact Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-[#738087]">City Avg Baseline</div>
                  <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
                    {simResults.city_average_baseline}
                  </div>
                  <div className="text-[10px] text-[#738087]">Observed status</div>
                </div>

                <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-[#738087]">City Avg Simulated</div>
                  <div className="text-2xl font-extrabold font-heading text-[#267C78] mt-1">
                    {simResults.city_average_simulated}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                    simResults.city_average_simulated > simResults.city_average_baseline ? 'text-[#C75C54]' : 'text-[#438A69]'
                  }`}>
                    {simResults.city_average_simulated > simResults.city_average_baseline ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{Math.round((simResults.city_average_simulated - simResults.city_average_baseline)*10)/10} pts</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{Math.round((simResults.city_average_simulated - simResults.city_average_baseline)*10)/10} pts</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-[#738087]">Critical Zones</div>
                  <div className="text-2xl font-extrabold font-heading text-[#B94B48] mt-1">
                    {simResults.critical_zones_count}
                  </div>
                  <div className="text-[10px] text-[#738087]">Score &ge; 80 / 100</div>
                </div>

                <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-[#738087]">High Priority</div>
                  <div className="text-2xl font-extrabold font-heading text-[#D18A35] mt-1">
                    {simResults.high_zones_count}
                  </div>
                  <div className="text-[10px] text-[#738087]">Score 60 - 79</div>
                </div>
              </div>

              {/* Dynamic Re-ranked Results Table */}
              <div className="bg-white border border-[#E2E4DF] rounded-xl shadow-sm overflow-hidden">
                <div className="p-3.5 bg-[#172B36] text-white flex items-center justify-between text-xs font-bold">
                  <span>Simulated Priority Ranking (Top Stressed Zones)</span>
                  <span className="text-[11px] text-[#83A69A] font-normal">34 Zones Evaluated</span>
                </div>

                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#263238] text-white uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">New Rank</th>
                        <th className="py-2.5 px-3">Zone Code & Name</th>
                        <th className="py-2.5 px-3">Baseline</th>
                        <th className="py-2.5 px-3">Simulated</th>
                        <th className="py-2.5 px-3">Delta</th>
                        <th className="py-2.5 px-3">Category Shift</th>
                        <th className="py-2.5 px-3">Updated Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4DF]">
                      {simResults.results.slice(0, 12).map((r) => {
                        const isWorse = r.delta > 0;
                        const isImproved = r.delta < 0;

                        return (
                          <tr key={r.zone_code} className="hover:bg-[#F3F1E9]/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#172B36]">
                              #{r.priority_rank_simulated}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[#172B36]">{r.zone_name}</div>
                              <div className="text-[10px] font-mono text-[#738087]">{r.zone_code}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#738087]">
                              {r.baseline_score}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-extrabold text-[#172B36]">
                              {r.simulated_score}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isWorse ? 'bg-[#C75C54]/15 text-[#C75C54]' :
                                isImproved ? 'bg-[#438A69]/15 text-[#438A69]' : 'text-[#738087]'
                              }`}>
                                {isWorse ? `+${r.delta}` : r.delta}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-[#738087] line-through">{r.baseline_category}</span>
                                <ArrowRight className="w-3 h-3 text-[#738087]" />
                                <RiskBadge category={r.simulated_category} score={r.simulated_score} showScore={false} />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-[#738087] max-w-xs truncate" title={r.recommended_action}>
                              {r.recommended_action}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

