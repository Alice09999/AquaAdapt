import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { ActiveTab } from '../types';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNotifications: () => void;
  hasUnreadNotifications?: boolean;
  onOpenSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  hasUnreadNotifications = true,
  onOpenSidebar,
}) => {
  const topTabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'feeding-log', label: 'Riwayat' },
    { id: 'scheduler', label: 'Jadwal' },
    { id: 'hardware', label: 'Perangkat' },
  ];

  return (
    <header 
      id="aqua-topbar" 
      className="bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20"
    >
      <div className="flex items-center gap-4 md:gap-6 lg:gap-10 min-w-0">
        {/* Mobile hamburger */}
        <button
          id="btn-hamburger"
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <span 
          onClick={() => setActiveTab('overview')} 
          className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer select-none"
        >
          AquaAdapt
        </span>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-[13px] font-medium text-slate-600">
          {topTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`top-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-1.5 transition-colors hover:text-slate-900 cursor-pointer ${
                  isActive ? 'text-slate-950 font-semibold' : 'text-slate-600'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-[2.5px] bg-[#0ea5e9]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          id="btn-top-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
