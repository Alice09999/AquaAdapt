import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  hasUnreadNotifications?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenNotifications,
  hasUnreadNotifications = true,
}) => {
  const topTabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Dasbor' },
    { id: 'feeding-log', label: 'Riwayat' },
    { id: 'scheduler', label: 'Jadwal' },
    { id: 'hardware', label: 'Perangkat' },
  ];

  return (
    <header 
      id="aqua-topbar" 
      className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-20"
    >
      <div className="flex items-center gap-10">
        {/* Brand */}
        <span 
          onClick={() => setActiveTab('overview')} 
          className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer select-none"
        >
          AquaAdapt
        </span>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-8 text-[13px] font-medium text-slate-600">
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

        {/* Settings */}
        <button
          id="btn-top-settings"
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          title="Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div 
          id="user-profile-avatar" 
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer shadow-xs hover:ring-2 hover:ring-sky-400 transition-all"
          title="Operator: lampungnista@gmail.com"
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
            alt="Operator Avatar" 
            className="w-full h-full object-cover grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
