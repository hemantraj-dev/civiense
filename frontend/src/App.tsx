import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { JudgeDemoGuide, DEMO_STEPS } from './components/JudgeDemoGuide';
import { OverviewPage } from './pages/OverviewPage';
import { GisMapPage } from './pages/GisMapPage';
import { WeatherPage } from './pages/WeatherPage';
import { ZoneIntelligencePage } from './pages/ZoneIntelligencePage';
import { CitizenReportsPage } from './pages/CitizenReportsPage';
import { ExplainableRiskPage } from './pages/ExplainableRiskPage';
import { PriorityCentrePage } from './pages/PriorityCentrePage';
import { ActionManagementPage } from './pages/ActionManagementPage';
import { DecisionLabPage } from './pages/DecisionLabPage';
import { DataTrustPage } from './pages/DataTrustPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Judge Demo Guide State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);

  // Global badges
  const [criticalCount, setCriticalCount] = useState<number>(0);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(3);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadGlobalBadges();
  }, []);

  const loadGlobalBadges = async () => {
    try {
      const overview = await api.getOverview();
      setCriticalCount(overview.critical_zones + overview.high_priority_zones);
      setPendingReportsCount(overview.pending_inspections);
    } catch (e) {
      console.warn("Global badges sync error:", e);
    }
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      await api.refreshDataSources();
      await loadGlobalBadges();
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Demo walkthrough controls
  const handleStartDemo = () => {
    setIsDemoActive(true);
    setDemoStepIndex(0);
    setActiveTab(DEMO_STEPS[0].tab);
  };

  const handleNextDemoStep = () => {
    if (demoStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = demoStepIndex + 1;
      setDemoStepIndex(nextIdx);
      setActiveTab(DEMO_STEPS[nextIdx].tab);
    } else {
      setIsDemoActive(false);
    }
  };

  const handlePrevDemoStep = () => {
    if (demoStepIndex > 0) {
      const prevIdx = demoStepIndex - 1;
      setDemoStepIndex(prevIdx);
      setActiveTab(DEMO_STEPS[prevIdx].tab);
    }
  };

  const handleJumpToDemoStep = (index: number) => {
    setDemoStepIndex(index);
    setActiveTab(DEMO_STEPS[index].tab);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'judge-demo') {
      handleStartDemo();
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1E9] text-[#263238] flex flex-col font-sans">
      {/* Global Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        onStartDemo={handleStartDemo}
        isDemoActive={isDemoActive}
        activeSearchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          criticalCount={criticalCount}
          pendingReportsCount={pendingReportsCount}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 lg:pl-64 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              onNavigateTab={setActiveTab}
              onSelectZone={(id) => setSelectedZoneId(id)}
            />
          )}

          {activeTab === 'map' && (
            <GisMapPage
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherPage />
          )}

          {activeTab === 'zones' && (
            <ZoneIntelligencePage
              onNavigateTab={setActiveTab}
              onSelectZone={(id) => setSelectedZoneId(id)}
            />
          )}

          {activeTab === 'citizen-reports' && (
            <CitizenReportsPage />
          )}

          {activeTab === 'explainable-risk' && (
            <ExplainableRiskPage />
          )}

          {activeTab === 'priority-centre' && (
            <PriorityCentrePage
              onNavigateTab={setActiveTab}
              onSelectZone={(id) => setSelectedZoneId(id)}
            />
          )}

          {activeTab === 'actions' && (
            <ActionManagementPage />
          )}

          {activeTab === 'decision-lab' && (
            <DecisionLabPage />
          )}

          {activeTab === 'data-trust' && (
            <DataTrustPage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}
        </main>
      </div>

      {/* Floating Judge Guided Tour Banner */}
      {isDemoActive && (
        <JudgeDemoGuide
          currentStepIndex={demoStepIndex}
          onNext={handleNextDemoStep}
          onPrev={handlePrevDemoStep}
          onJumpToStep={handleJumpToDemoStep}
          onClose={() => setIsDemoActive(false)}
        />
      )}
    </div>
  );
};

export default App;
