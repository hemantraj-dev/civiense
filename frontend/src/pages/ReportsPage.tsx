import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  CloudRain, 
  Calendar,
  Building,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { CityOverview, ZoneItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [overview, setOverview] = useState<CityOverview | null>(null);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const [ov, z] = await Promise.all([
        api.getOverview(),
        api.getZones()
      ]);
      setOverview(ov);
      setZones(z);
    } catch (err) {
      console.error("Report data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !overview) {
    return (
      <div className="p-8 text-center text-[#738087] max-w-4xl mx-auto">
        <div className="w-8 h-8 border-2 border-[#267C78] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">Assembling Municipal Operations Briefing...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Action Header (Hidden in Print) */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              OFFICIAL MUNICIPAL INTELLIGENCE BRIEFING
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Reports, Audit Dossiers & Data Export
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Download real CSV datasets or generate executive printable briefing reports for disaster-management authorities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={api.getExportCsvUrl()}
              download
              className="px-4 py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-[#267C78] text-[#267C78] hover:bg-[#267C78]/10 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-8 sm:p-10 shadow-md space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-[#172B36] pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#267C78] uppercase tracking-wider">
              <span>CIVISENSE URBAN FLOOD & WATERLOGGING PREVENTION SYSTEM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172B36] mt-1">
              Daily Operational Intelligence Dossier
            </h2>
            <div className="text-xs text-[#738087] mt-1">
              Territory: <strong>Chandigarh UT & Punjab Tri-City Region</strong> (SAS Nagar Mohali, Gharuan/CU, Kharar, Zirakpur)
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono text-[#172B36] font-bold">DOC REF: CIVI-OPS-2026-10</div>
            <div className="text-[#738087]">{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
            <div className="text-[10px] text-[#438A69] font-bold uppercase">Status: Approved Briefing</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#172B36] uppercase tracking-wider">
            1. Executive Telemetry & Risk Summary
          </h3>
          <p className="text-xs text-[#263238] leading-relaxed">
            The CiviSense multi-criteria surveillance network monitors 34 verified pilot sectors covering high-density commercial markets, low-lying alluvial basins, student hubs, and arterial transit underpasses.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="border border-[#E2E4DF] p-3 rounded-xl bg-[#F3F1E9]">
              <div className="text-[10px] text-[#738087] uppercase font-bold">Total Monitored Zones</div>
              <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-0.5">{overview.total_zones}</div>
            </div>
            <div className="border border-[#E2E4DF] p-3 rounded-xl bg-[#F3F1E9]">
              <div className="text-[10px] text-[#738087] uppercase font-bold">Critical & High Vulnerability</div>
              <div className="text-2xl font-extrabold font-heading text-[#C75C54] mt-0.5">{overview.critical_zones + overview.high_priority_zones}</div>
            </div>
            <div className="border border-[#E2E4DF] p-3 rounded-xl bg-[#F3F1E9]">
              <div className="text-[10px] text-[#738087] uppercase font-bold">Verified Citizen Incidents</div>
              <div className="text-2xl font-extrabold font-heading text-[#267C78] mt-0.5">{overview.verified_incidents}</div>
            </div>
            <div className="border border-[#E2E4DF] p-3 rounded-xl bg-[#F3F1E9]">
              <div className="text-[10px] text-[#738087] uppercase font-bold">Average Regional Risk Score</div>
              <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-0.5">{overview.average_city_risk_score} / 100</div>
            </div>
          </div>
        </div>

        {/* Hydrological Telemetry Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#172B36] uppercase tracking-wider">
            2. Verified Hydrometric Conditions (Open-Meteo Seamless Blend)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-[#E2E4DF] rounded-xl p-4 bg-[#F3F1E9]">
            <div>
              <span className="text-[10px] text-[#738087] block">Past 24h Rain:</span>
              <strong className="text-sm font-mono text-[#172B36]">{overview.current_weather.rainfall_24h_mm} mm</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#738087] block">Past 72h Rain:</span>
              <strong className="text-sm font-mono text-[#172B36]">{overview.current_weather.rainfall_72h_mm} mm</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#738087] block">Next 6h Forecast:</span>
              <strong className="text-sm font-mono text-[#267C78]">{overview.current_weather.forecast_6h_mm} mm</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#738087] block">Next 24h Forecast:</span>
              <strong className="text-sm font-mono text-[#267C78]">{overview.current_weather.forecast_24h_mm} mm</strong>
            </div>
          </div>
        </div>

        {/* Priority Action Orders */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#172B36] uppercase tracking-wider">
            3. Recommended Preventive Dispatch Orders
          </h3>
          <table className="w-full text-xs text-left border border-[#E2E4DF] rounded-xl overflow-hidden">
            <thead className="bg-[#172B36] text-white text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Zone Code & Name</th>
                <th className="p-2.5">Territory</th>
                <th className="p-2.5">Recommended Preventive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DF]">
              {overview.top_vulnerable_zones.map((z, i) => (
                <tr key={i} className="py-2">
                  <td className="p-2.5 font-bold font-mono text-[#C75C54]">Priority #{i+1}</td>
                  <td className="p-2.5 font-semibold text-[#172B36]">{z.zone_name} ({z.zone_code})</td>
                  <td className="p-2.5 text-[#738087]">{z.district}</td>
                  <td className="p-2.5 text-[#172B36]">{z.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign-off & Verification Signatures */}
        <div className="pt-8 border-t border-[#E2E4DF] grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-[#172B36]">Control Room Officer</div>
            <div className="text-[11px] text-[#738087]">MCC / Tri-City Disaster Response Cell</div>
            <div className="mt-8 border-b border-[#738087]/40 w-48"></div>
            <div className="text-[10px] text-[#738087] mt-1">Authorized Digital Signature</div>
          </div>

          <div className="text-right">
            <div className="font-bold text-[#172B36]">Executive Engineer (Drainage)</div>
            <div className="text-[11px] text-[#738087]">Punjab Municipal Operations Unit</div>
            <div className="mt-8 border-b border-[#738087]/40 w-48 ml-auto"></div>
            <div className="text-[10px] text-[#738087] mt-1">Inspection Clearance Sign-off</div>
          </div>
        </div>
      </div>
    </div>
  );
};

