import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Send, 
  Building2, 
  Truck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ActionOrder, ZoneItem } from '../types';

export const ActionManagementPage: React.FC = () => {
  const [actions, setActions] = useState<ActionOrder[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [actionType, setActionType] = useState<string>('Drainage inspection');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('High');
  const [assignedTeam, setAssignedTeam] = useState<string>('MCC Stormwater Rapid Response Team');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Status Update state
  const [updatingActionId, setUpdatingActionId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [actionsData, zonesData] = await Promise.all([
        api.getActions(),
        api.getZones()
      ]);
      setActions(actionsData);
      setZones(zonesData);
      if (zonesData.length > 0) {
        setSelectedZoneId(zonesData[0].id);
      }
    } catch (err) {
      console.error("Action load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide action description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAction({
        zone_id: selectedZoneId,
        action_type: actionType,
        description: description,
        priority: priority,
        assigned_team: assignedTeam
      });
      setIsCreateOpen(false);
      setDescription('');
      loadData();
    } catch (err) {
      alert("Action creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (actionId: number, newStatus: string) => {
    try {
      setUpdatingActionId(actionId);
      await api.updateAction(actionId, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Failed to update action status.");
    } finally {
      setUpdatingActionId(null);
    }
  };

  const filteredActions = actions.filter(a => {
    return statusFilter === 'All' || a.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#267C78]">
              MUNICIPAL RESPONSE ORCHESTRATION
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36] mt-0.5">
              Action & Inspection Work Order Management
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Preventive maintenance dispatch, silt clearance orders, and stormwater field crew tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-[#267C78] hover:bg-[#267C78]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prototype Simulation Disclosure */}
      <div className="bg-[#172B36] text-white p-4 rounded-xl border border-[#263238] flex items-center gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#267C78] shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#83A69A]">Operational Prototype Simulation:</span>
          <p className="text-[#E2E4DF]">
            This module models the standard operating procedure for municipal engineering divisions (MCC, GMADA, PUDA). No physical dispatch sirens or live vehicle telemetry are spoofed.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between bg-white border border-[#E2E4DF] rounded-xl p-4 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#738087]">Status Filter:</span>
          {['All', 'Pending Review', 'Approved', 'Assigned', 'Inspection in Progress', 'Completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === s 
                  ? 'bg-[#267C78] text-white shadow-xs' 
                  : 'bg-[#F3F1E9] text-[#738087] hover:text-[#172B36]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-[#738087] font-mono text-xs">{filteredActions.length} Work Orders</span>
      </div>

      {/* Action Orders Table */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#172B36] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">Order Code</th>
                <th className="py-3 px-3">Zone Location</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Assigned Crew</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DF]">
              {filteredActions.map(a => {
                const isPending = a.status === 'Pending Review';
                const isProgress = a.status === 'Inspection in Progress' || a.status === 'Assigned';
                const isDone = a.status === 'Completed';

                return (
                  <tr key={a.id} className="hover:bg-[#F3F1E9]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#172B36]">{a.action_code}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#172B36]">{a.zone_name}</div>
                      <div className="text-[10px] font-mono text-[#738087]">{a.zone_code}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#267C78]">{a.action_type}</td>
                    <td className="py-3 px-3 max-w-sm text-[#738087] truncate" title={a.description}>
                      {a.description}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.priority === 'Critical' ? 'bg-[#C75C54]/15 text-[#C75C54]' :
                        a.priority === 'High' ? 'bg-[#D18A35]/15 text-[#D18A35]' : 'bg-[#267C78]/15 text-[#267C78]'
                      }`}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#172B36] font-medium flex items-center gap-1.5 mt-2">
                      <Truck className="w-3.5 h-3.5 text-[#738087]" />
                      <span>{a.assigned_team}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDone ? 'bg-[#438A69]/15 text-[#438A69]' :
                        isProgress ? 'bg-[#D69A42]/15 text-[#D69A42]' : 'bg-[#738087]/15 text-[#738087]'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <button
                            disabled={updatingActionId === a.id}
                            onClick={() => handleUpdateStatus(a.id, 'Approved')}
                            className="px-2 py-1 bg-[#267C78] text-white rounded text-[11px] font-semibold hover:bg-[#267C78]/90"
                          >
                            Approve
                          </button>
                        )}
                        {a.status === 'Approved' && (
                          <button
                            disabled={updatingActionId === a.id}
                            onClick={() => handleUpdateStatus(a.id, 'Inspection in Progress')}
                            className="px-2 py-1 bg-[#D69A42] text-[#172B36] rounded text-[11px] font-bold hover:bg-[#D69A42]/90"
                          >
                            Dispatch Crew
                          </button>
                        )}
                        {isProgress && (
                          <button
                            disabled={updatingActionId === a.id}
                            onClick={() => handleUpdateStatus(a.id, 'Completed')}
                            className="px-2 py-1 bg-[#438A69] text-white rounded text-[11px] font-semibold hover:bg-[#438A69]/90"
                          >
                            Mark Completed
                          </button>
                        )}
                        {isDone && (
                          <span className="text-[11px] text-[#438A69] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Action Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E4DF] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E4DF]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#267C78] tracking-wider">
                  MUNICIPAL ACTION GENERATOR
                </span>
                <h3 className="font-heading font-bold text-lg text-[#172B36]">
                  Create Preventive Work Order
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-[#738087]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#172B36] mb-1">Target Zone *</label>
                <select
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(Number(e.target.value))}
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.zone_code} — {z.zone_name} ({z.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B36] mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={e => setActionType(e.target.value)}
                    className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                  >
                    <option value="Drainage inspection">Drainage inspection</option>
                    <option value="Drain cleaning review">Drain cleaning review</option>
                    <option value="Waterlogging site verification">Waterlogging site verification</option>
                    <option value="Road safety review">Road safety review</option>
                    <option value="Traffic diversion assessment">Traffic diversion assessment</option>
                    <option value="Preventive maintenance recommendation">Preventive maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B36] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate dispatch)</option>
                    <option value="High">High (Within 3 hours)</option>
                    <option value="Medium">Medium (Routine sweep)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172B36] mb-1">Assigned Maintenance Team</label>
                <select
                  value={assignedTeam}
                  onChange={e => setAssignedTeam(e.target.value)}
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg px-3 py-2 text-[#172B36] focus:outline-none"
                >
                  <option value="MCC Stormwater Rapid Response Team">MCC Stormwater Rapid Response Team</option>
                  <option value="SAS Nagar Municipal Emergency Squad">SAS Nagar Municipal Emergency Squad</option>
                  <option value="Kharar Civic Works & Pump Crew">Kharar Civic Works & Pump Crew</option>
                  <option value="Gharuan Sub-Divisional Engineering Unit">Gharuan Sub-Divisional Engineering Unit</option>
                  <option value="Zirakpur Drainage Wing">Zirakpur Drainage Wing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B36] mb-1">Order Scope & Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Specify equipment (e.g. 50HP suction pump), specific culvert location, or traffic coordination instructions..."
                  className="w-full bg-[#F3F1E9] border border-[#E2E4DF] rounded-lg p-2.5 text-[#172B36] focus:outline-none focus:border-[#267C78]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E4DF]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-[#E2E4DF] text-xs font-semibold text-[#172B36] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#267C78] text-xs font-bold text-white rounded-lg hover:bg-[#267C78]/90"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

