import React from 'react';
import { 
  BarChart2, 
  Brain, 
  Calendar, 
  Cpu, 
  Wrench, 
  Droplets,
  Receipt
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDiagnostics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDiagnostics,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Ringkasan',
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      id: 'ai-monitor',
      label: 'Monitor AI',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'feeding-log',
      label: 'Riwayat Pakan',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'scheduler',
      label: 'Penjadwal',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'hardware',
      label: 'Perangkat',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  return (
    <aside 
      id="aqua-sidebar" 
      className="w-56 md:w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30"
    >
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-sky-300 flex items-center justify-center bg-sky-50 shadow-xs shrink-0">
            <Droplets className="w-4 h-4 text-sky-500 fill-sky-400/30" />
          </div>
          <div>
            <h1 className="text-[13px] font-bold tracking-widest text-[#0284c7] font-tech uppercase leading-tight">
              AQUA-MONITOR
            </h1>
            <p className="text-[10px] text-slate-500 font-mono-code leading-tight">
              v4.2.0-STABLE
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-3.5 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#e0f2fe] text-[#0284c7] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#0284c7] rounded-r-md" />
                )}
                <span className={`${isActive ? 'text-[#0284c7]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Utilities */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <button
            id="btn-sidebar-diagnostics"
            onClick={onOpenDiagnostics}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors text-left"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span>Diagnostik</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
