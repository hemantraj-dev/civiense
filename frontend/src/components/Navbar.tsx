import React from 'react';
import { 
  Droplet, 
  Search, 
  RefreshCw, 
  Radio, 
  Menu, 
  X,
  PlayCircle
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onStartDemo: () => void;
  isDemoActive: boolean;
  activeSearchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onRefreshData,
  isRefreshing,
  onStartDemo,
  isDemoActive,
  activeSearchQuery,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#172B36] text-white border-b border-[#263238] shadow-md">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-[#83A69A] hover:text-white hover:bg-[#263238] lg:hidden focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#267C78] flex items-center justify-center text-white shadow-inner">
              <Droplet className="w-5 h-5 fill-white/80" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white">CIVISENSE</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#267C78]/40 text-[#83A69A] border border-[#267C78]/50">
                  Punjab Tri-City
                </span>
              </div>
              <p className="text-[10px] text-[#83A69A] hidden sm:block leading-none">
                Predict. Prioritize. Prevent.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#83A69A]" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search zones (e.g. Sector 35, Sunny Enclave, CU Gate, Baltana)..."
              className="w-full bg-[#263238] border border-[#738087]/40 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#83A69A] focus:outline-none focus:border-[#267C78] transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions, Live Status & Demo Mode */}
        <div className="flex items-center gap-2.5">
          {/* Live telemetry badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#263238] border border-[#738087]/30 text-[11px] text-[#83A69A]">
            <Radio className="w-3.5 h-3.5 text-[#267C78] animate-pulse" />
            <span>Open-Meteo & OSM Live</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#263238] hover:bg-[#267C78]/30 border border-[#738087]/30 text-xs text-white transition-all disabled:opacity-50"
            title="Refresh live external API data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#83A69A] ${isRefreshing ? 'animate-spin text-[#267C78]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Judge Demo Walkthrough Trigger */}
          <button
            onClick={onStartDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isDemoActive
                ? 'bg-[#D69A42] text-[#172B36] ring-2 ring-[#D69A42]/50'
                : 'bg-[#267C78] hover:bg-[#267C78]/90 text-white'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isDemoActive ? 'Demo Active' : 'Judge Demo Tour'}</span>
          </button>

          {/* Operator Demo Profile */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#263238]">
            <div className="w-8 h-8 rounded-full bg-[#263238] border border-[#83A69A]/40 flex items-center justify-center font-bold text-xs text-[#83A69A]">
              MC
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-medium text-white leading-tight">Eng. V. Kumar</div>
              <div className="text-[10px] text-[#83A69A] leading-tight">Control Room Lead</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

