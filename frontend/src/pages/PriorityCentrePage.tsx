import React, { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  MapPin, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ActiveTab } from '../components/Sidebar';

interface PriorityCentrePageProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectZone: (zoneId: number) => void;
}

export const PriorityCentrePage: React.FC<PriorityCentrePageProps> = ({
  onNavigateTab,
  onSelectZone
}) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<string>('priority_rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRiskAssessments();
      setAssessments(data);
    } catch (err) {
      console.error("Assessments error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = assessments
    .filter(a => {
      const matchCat = categoryFilter === 'All' || a.risk_category === categoryFilter;
      const matchDist = districtFilter === 'All' || a.district.includes(districtFilter);
      const matchSearch = a.zone_name.toLowerCase().includes(search.toLowerCase()) ||
                          a.zone_code.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchDist && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              OPERATIONAL WORKFLOW PRIORITIZATION
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Prevention Priority Centre
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Dynamic rank order of all 34 monitored zones requiring preventive municipal clearing, pump staging, or site verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={api.getExportCsvUrl()}
              download
              className="px-3.5 py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Full CSV (34 Zones)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#738087]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zones by name or code..."
            className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#172B36] placeholder-[#738087] focus:outline-none focus:border-[#267C78]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#738087]">
            <span className="font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-2.5 py-1 text-xs text-[#172B36] focus:outline-none"
            >
              <option value="All">All Categories ({assessments.length})</option>
              <option value="Critical">Critical (80-100)</option>
              <option value="High">High (60-79)</option>
              <option value="Medium">Medium (35-59)</option>
              <option value="Low">Low (0-34)</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#738087]">
            <span className="font-semibold">District:</span>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-2.5 py-1 text-xs text-[#172B36] focus:outline-none"
            >
              <option value="All">All Territories</option>
              <option value="Chandigarh">Chandigarh UT</option>
              <option value="SAS Nagar">SAS Nagar Mohali</option>
              <option value="Kharar">Kharar</option>
              <option value="Gharuan">Gharuan / CU Campus</option>
              <option value="Zirakpur">Zirakpur</option>
              <option value="Panchkula">Panchkula</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority Ranked Table */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#172B36] text-white border-b border-[#263238] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('priority_rank')}>
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-[#83A69A]" />
                  </div>
                </th>
                <th className="py-3 px-3">Zone Code & Name</th>
                <th className="py-3 px-3">Territory</th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('overall_risk_score')}>
                  <div className="flex items-center gap-1">
                    <span>Score (0-100)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#83A69A]" />
                  </div>
                </th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Primary Contributing Driver</th>
                <th className="py-3 px-3">Recommended Preventive Action</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DF]">
              {filtered.map((item) => (
                <tr 
                  key={item.zone_id} 
                  className="hover:bg-[#F3F1E9]/60 transition-colors cursor-pointer"
                  onClick={() => {
                    onSelectZone(item.zone_id);
                    onNavigateTab('map');
                  }}
                >
                  <td className="py-3 px-3 font-mono font-bold text-[#172B36]">
                    <div className="w-6 h-6 rounded-full bg-[#F3F1E9] border border-[#E2E4DF] flex items-center justify-center font-bold text-xs text-[#172B36]">
                      #{item.priority_rank}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#172B36]">{item.zone_name}</div>
                    <div className="text-[11px] font-mono text-[#738087]">{item.zone_code} • {item.category}</div>
                  </td>
                  <td className="py-3 px-3 text-[#738087] font-medium">
                    {item.district}
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge category={item.risk_category} score={item.overall_risk_score} />
                  </td>
                  <td className="py-3 px-3">
                    <ConfidenceBadge level={item.confidence_level} explanation={item.confidence_explanation} />
                  </td>
                  <td className="py-3 px-3 text-[#738087] max-w-xs truncate" title={item.top_factors[0]}>
                    {item.top_factors[0]}
                  </td>
                  <td className="py-3 px-3 text-[#172B36] max-w-sm truncate" title={item.recommended_action}>
                    {item.recommended_action}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectZone(item.zone_id);
                        onNavigateTab('map');
                      }}
                      className="px-2.5 py-1 rounded bg-[#267C78]/10 text-[#267C78] font-semibold hover:bg-[#267C78] hover:text-white transition-colors"
                    >
                      Locate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

