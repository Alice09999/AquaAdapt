import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { AiMonitorView } from './components/views/AiMonitorView';
import { FeedingLogView } from './components/views/FeedingLogView';
import { SchedulerView } from './components/views/SchedulerView';
import { HardwareView } from './components/views/HardwareView';
import { EmergencyStopModal } from './components/modals/EmergencyStopModal';
import { NewScheduleModal } from './components/modals/NewScheduleModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SupportModal } from './components/modals/SupportModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { AlertOctagon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const handleSaveSchedule = (newSched: { id: string; type: 'Interval Tetap' | 'Berbasis AI'; time: string; days: string[] }) => {
    // Saved schedule feedback
    console.log('Jadwal baru disimpan:', newSched);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-sky-100 selection:text-sky-800 antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyStop={() => setIsEmergencyModalOpen(true)}
        onOpenDiagnostics={() => setActiveTab('hardware')}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        isEmergencyActive={isEmergencyActive}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          hasUnreadNotifications={true}
        />

        {/* Emergency Stop Active Warning Banner */}
        {isEmergencyActive && (
          <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold font-tech uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              <span>SISTEM DARURAT AKTIF: SEMUA MOTOR DC DAN SIKLUS PAKAN DIHENTIKAN</span>
            </div>
            <button
              onClick={() => setIsEmergencyActive(false)}
              className="px-3 py-1 bg-white text-red-700 hover:bg-red-50 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
            >
              Pulihkan Operasi
            </button>
          </div>
        )}

        {/* Dynamic View rendering */}
        <main className="flex-1 pb-12">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'ai-monitor' && <AiMonitorView />}
          {activeTab === 'feeding-log' && <FeedingLogView />}
          {activeTab === 'scheduler' && (
            <SchedulerView
              onOpenNewScheduleModal={() => setIsNewScheduleModalOpen(true)}
            />
          )}
          {activeTab === 'hardware' && <HardwareView />}
        </main>
      </div>

      {/* Interactive Modals */}
      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        isEmergencyActive={isEmergencyActive}
        onToggleEmergency={() => setIsEmergencyActive(!isEmergencyActive)}
      />

      <NewScheduleModal
        isOpen={isNewScheduleModalOpen}
        onClose={() => setIsNewScheduleModalOpen(false)}
        onSaveSchedule={handleSaveSchedule}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
