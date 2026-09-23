import React, { useState, useCallback } from 'react';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { AiMonitorView } from './components/views/AiMonitorView';
import { FeedingLogView } from './components/views/FeedingLogView';
import { SchedulerView } from './components/views/SchedulerView';
import { HardwareView } from './components/views/HardwareView';
import { NewScheduleModal } from './components/modals/NewScheduleModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState<number>(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  const handleScheduleCreated = () => {
    setScheduleRefreshKey((k) => k + 1);
  };

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadNotificationCount(count);
  }, []);

  const handleCloseNotifications = useCallback(() => {
    setIsNotificationsOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans selection:bg-sky-100 selection:text-sky-800 antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDiagnostics={() => setActiveTab('hardware')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          hasUnreadNotifications={unreadNotificationCount > 0}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'ai-monitor' && <AiMonitorView />}
          {activeTab === 'feeding-log' && <FeedingLogView />}
          {activeTab === 'scheduler' && (
            <SchedulerView
              onOpenNewScheduleModal={() => setIsNewScheduleModalOpen(true)}
              refreshKey={scheduleRefreshKey}
            />
          )}
          {activeTab === 'hardware' && <HardwareView />}
        </main>
      </div>

      {/* Interactive Modals */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </div>
  );
}
