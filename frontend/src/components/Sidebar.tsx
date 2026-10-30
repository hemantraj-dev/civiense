import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  CloudRain, 
  MapPin, 
  AlertCircle, 
  HelpCircle, 
  ListOrdered, 
  CheckSquare, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  Compass,
  Building2,
  ExternalLink
} from 'lucide-react';

export type ActiveTab = 
  | 'overview' 
  | 'map' 
  | 'weather' 
  | 'zones' 
  | 'citizen-reports' 
  | 'explainable-risk' 
  | 'priority-centre' 
  | 'actions' 
  | 'decision-lab' 
  | 'data-trust' 
  | 'reports'
  | 'judge-demo';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  criticalCount: number;
  pendingReportsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  criticalCount,
  pendingReportsCount
}) => {
  const navItems = [
    { id: 'overview', label: 'City Overview', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Risk Map', icon: Map, badge: 'Leaflet' },
    { id: 'weather', label: 'Weather Intelligence', icon: CloudRain, badge: 'Live API' },
    { id: 'zones', label: 'Zone Intelligence (34)', icon: MapPin },
    { id: 'citizen-reports', label: 'Citizen Reports', icon: AlertCircle, count: pendingReportsCount },
    { id: 'explainable-risk', label: 'Explainable Risk Engine', icon: HelpCircle },
    { id: 'priority-centre', label: 'Prevention Priority Centre', icon: ListOrdered, alertCount: criticalCount },
    { id: 'actions', label: 'Action & Inspections', icon: CheckSquare },
    { id: 'decision-lab', label: 'Decision Lab Simulator', icon: Sliders, highlight: true },
    { id: 'data-trust', label: 'Data Trust Centre', icon: ShieldCheck },
    { id: 'reports', label: 'Reports & CSV Export', icon: FileText },
    { id: 'judge-demo', label: 'Judge Guided Walkthrough', icon: Compass, special: true },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id as ActiveTab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#172B36] border-r border-[#263238] flex flex-col transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-[#83A69A]/80">
            Operations & Intelligence
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group
                  ${isActive 
                    ? 'bg-[#267C78] text-white shadow-sm' 
                    : item.highlight 
                      ? 'text-[#F3F1E9] hover:bg-[#263238] border border-[#267C78]/30'
                      : item.special
                        ? 'text-[#D69A42] hover:bg-[#263238] border border-[#D69A42]/30'
                        : 'text-[#83A69A] hover:bg-[#263238] hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.special ? 'text-[#D69A42]' : 'text-[#83A69A] group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#263238] text-[#83A69A] border border-[#738087]/20">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D69A42] text-[#172B36] font-bold">
                      {item.count}
                    </span>
                  )}
                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C75C54] text-white font-bold animate-pulse">
                      {item.alertCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info & Punjab tri-city reference */}
        <div className="p-3 border-t border-[#263238] bg-[#172B36]/90">
          <div className="bg-[#263238]/60 rounded-lg p-2.5 border border-[#738087]/20">
            <div className="flex items-center gap-2 text-white text-xs font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#267C78]" />
              <span>Pilot Region</span>
            </div>
            <p className="text-[11px] text-[#83A69A] leading-snug">
              Chandigarh UT • SAS Nagar (Mohali) • Kharar • CU Gharuan • Zirakpur
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#83A69A]/80 border-t border-[#738087]/20 pt-1.5">
              <span>DEM 90m + OSM QL</span>
              <span className="text-[#267C78] font-mono">v2.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

