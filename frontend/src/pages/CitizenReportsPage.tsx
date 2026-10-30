import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Send, 
  Camera, 
  Crosshair, 
  Filter, 
  Search, 
  ShieldAlert, 
  CheckSquare, 
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { CitizenReport } from '../types';

export const CitizenReportsPage: React.FC = () => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Public Form state
  const [locationName, setLocationName] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('30.7333');
  const [longitude, setLongitude] = useState<string>('76.7794');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [severity, setSeverity] = useState<string>('Medium');
  const [waterDepth, setWaterDepth] = useState<string>('15');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Operator verification modal/action
  const [activeReportToReview, setActiveReportToReview] = useState<CitizenReport | null>(null);
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(5));
          setLongitude(position.coords.longitude.toFixed(5));
        },
        (error) => {
          alert("Geolocation permission denied or timed out. You may manually adjust coordinates.");
        }
      );
    } else {
      alert("Browser geolocation not supported.");
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !description.trim()) {
      alert("Please provide location name and waterlogging description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitSuccess(null);
      const res = await api.submitReport({
        location_name: locationName,
        latitude: parseFloat(latitude) || 30.7333,
        longitude: parseFloat(longitude) || 76.7794,
        description: description,
        reporter_name: reporterName || "Anonymous Citizen",
        reporter_contact: reporterContact || undefined,
        severity: severity,
        water_depth_cm: parseFloat(waterDepth) || 0
      });

      setSubmitSuccess(`Report filed successfully! Tracking Number: ${res.report_number}. Staged for municipal field triage.`);
      // Reset form
      setLocationName('');
      setDescription('');
      loadReports();
    } catch (err: any) {
      alert("Failed to submit report. Please check server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await api.updateReportStatus(reportId, newStatus, operatorNotes || undefined);
      setActiveReportToReview(null);
      setOperatorNotes('');
      loadReports();
    } catch (err) {
      alert("Status update failed.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchStatus = statusFilter === 'All' || r.verification_status === statusFilter;
    const matchSearch = r.location_name.toLowerCase().includes(search.toLowerCase()) ||
                        r.description.toLowerCase().includes(search.toLowerCase()) ||
                        r.report_number.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              CROWDSOURCED INCIDENT TRIAGE & VERIFICATION
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Citizen Waterlogging Reporting Portal
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Field observations logged by citizens with municipal inspector verification workflow
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#F3F1E9] border border-[#E2E4DF] font-semibold text-[#172B36]">
              {reports.filter(r => r.verification_status === 'Verified').length} Verified Incidents
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Public Submission Form, Right = Operator Verification Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Public Reporting Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E4DF] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E4DF]">
            <div className="p-2 rounded-lg bg-[#267C78]/15 text-[#267C78]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#172B36]">
                Report Street Waterlogging
              </h2>
              <p className="text-xs text-[#738087]">Submit localized street ponding or drain choke</p>
            </div>
          </div>

          {submitSuccess && (
            <div className="mt-4 p-3 bg-[#438A69]/10 border border-[#438A69]/30 rounded-lg text-xs text-[#438A69] flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="mt-4 space-y-4 text-xs">
            {/* Location */}
            <div>
              <label className="block font-semibold text-[#172B36] mb-1">
                Location Name / Landmark *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Sector 35-C Inner Market or CU Main Gate NH-5"
                className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none focus:border-[#267C78]"
              />
            </div>

            {/* Coordinates & Geolocation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#738087] mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 font-mono text-[#172B36] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#738087] mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 font-mono text-[#172B36] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="w-full py-1.5 bg-[#F3F1E9] hover:bg-[#E2E4DF] border border-[#E2E4DF] rounded-lg font-semibold text-[#267C78] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Use Device Browser Geolocation (Permission Required)</span>
            </button>

            {/* Severity & Water Depth */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#172B36] mb-1">Severity Rating</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                >
                  <option value="Low">Low (Puddles on sidewalk)</option>
                  <option value="Medium">Medium (Street water &lt; 15cm)</option>
                  <option value="High">High (Water 15-30cm, vehicles slowed)</option>
                  <option value="Severe">Severe (Water &gt; 30cm, submerged)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B36] mb-1">Water Depth (cm)</label>
                <input
                  type="number"
                  value={waterDepth}
                  onChange={e => setWaterDepth(e.target.value)}
                  min="0"
                  max="150"
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 font-mono text-[#172B36] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-[#172B36] mb-1">
                Incident Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe water depth, traffic blockage, or clogged catch-basin grates..."
                className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none focus:border-[#267C78]"
              ></textarea>
            </div>

            {/* Reporter Contact */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#738087] mb-1">Reporter Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Anonymous Citizen"
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#738087] mb-1">Phone / Contact (Optional)</label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={e => setReporterContact(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-2.5 bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg text-[10px] text-[#738087]">
              Notice: Reports enter the system as unverified until verified by an on-duty municipal inspector.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Report...' : 'Submit Incident Report'}</span>
            </button>
          </form>
        </div>

        {/* Right: Operator Triage & Verification Management Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E4DF] rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Table Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E4DF] gap-3">
              <div>
                <h2 className="font-heading font-bold text-base text-[#172B36]">
                  Operator Incident Log & Verification
                </h2>
                <p className="text-xs text-[#738087]">
                  Verify field reports to feed verified indicators into the central risk engine
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-2.5 py-1 text-xs text-[#172B36] focus:outline-none"
                >
                  <option value="All">All Statuses ({reports.length})</option>
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified by Crew</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="overflow-y-auto max-h-[560px] divide-y divide-[#E2E4DF]">
              {filteredReports.map(r => {
                const isVerified = r.verification_status === 'Verified';
                return (
                  <div key={r.id} className="py-3.5 space-y-2 hover:bg-[#F3F1E9]/40 p-2 rounded-lg transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#172B36]">{r.report_number}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVerified 
                              ? 'bg-[#438A69]/15 text-[#438A69] border border-[#438A69]/30' 
                              : r.verification_status === 'Under Review'
                                ? 'bg-[#D69A42]/15 text-[#D69A42] border border-[#D69A42]/30'
                                : 'bg-[#738087]/15 text-[#738087]'
                          }`}>
                            {r.verification_status}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C75C54]/10 text-[#C75C54] font-semibold">
                            {r.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#172B36] mt-1">{r.location_name}</h4>
                      </div>

                      <div className="text-right text-[10px] text-[#738087] shrink-0 font-mono">
                        {r.reported_at ? new Date(r.reported_at).toLocaleTimeString() : 'Recent'}
                      </div>
                    </div>

                    <p className="text-xs text-[#738087] leading-relaxed">{r.description}</p>

                    {/* Duplicate detection badge if proximity triggered */}
                    {r.is_potential_duplicate && (
                      <div className="text-[11px] bg-[#D69A42]/15 text-[#8F781A] px-2.5 py-1 rounded-md border border-[#D69A42]/30 flex items-center gap-1.5 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Proximity Match Flag: Logged within 250m of another active report in the past 12h. Operator review suggested.</span>
                      </div>
                    )}

                    {r.operator_notes && (
                      <div className="text-[11px] bg-[#F3F1E9] p-2 rounded border border-[#E2E4DF] text-[#172B36]">
                        <span className="font-semibold text-[#267C78]">Inspector Notes:</span> {r.operator_notes}
                      </div>
                    )}

                    {/* Operator Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {r.verification_status !== 'Verified' && (
                        <button
                          onClick={() => {
                            setActiveReportToReview(r);
                            setOperatorNotes(r.operator_notes || 'Verified on site by municipal inspection crew.');
                          }}
                          className="px-2.5 py-1 bg-[#438A69] text-white rounded text-xs font-semibold hover:bg-[#438A69]/90 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Verify Incident</span>
                        </button>
                      )}

                      {r.verification_status === 'Submitted' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'Under Review')}
                          className="px-2.5 py-1 bg-[#D69A42] text-[#172B36] rounded text-xs font-bold hover:bg-[#D69A42]/90 transition-colors"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {r.verification_status === 'Verified' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'Resolved')}
                          className="px-2.5 py-1 bg-[#267C78] text-white rounded text-xs font-semibold hover:bg-[#267C78]/90 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Operator Verification Modal */}
      {activeReportToReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E4DF] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#267C78]">
                  VERIFICATION TRIAGE • {activeReportToReview.report_number}
                </span>
                <h3 className="font-heading font-bold text-lg text-[#172B36] mt-0.5">
                  Confirm Incident Verification
                </h3>
              </div>
              <button onClick={() => setActiveReportToReview(null)} className="p-1 text-[#738087]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F3F1E9] p-3 rounded-xl text-xs space-y-1">
              <div className="font-bold text-[#172B36]">{activeReportToReview.location_name}</div>
              <p className="text-[#738087]">{activeReportToReview.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B36] mb-1">
                Official Municipal Inspection Notes *
              </label>
              <textarea
                rows={3}
                value={operatorNotes}
                onChange={e => setOperatorNotes(e.target.value)}
                className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg p-2.5 text-xs text-[#172B36] focus:outline-none focus:border-[#267C78]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E4DF]">
              <button
                onClick={() => setActiveReportToReview(null)}
                className="px-4 py-2 bg-[#E2E4DF] text-xs font-semibold text-[#172B36] rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus(activeReportToReview.id, 'Verified')}
                className="px-4 py-2 bg-[#438A69] text-xs font-bold text-white rounded-lg hover:bg-[#438A69]/90 shadow-xs"
              >
                Confirm Verified Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

