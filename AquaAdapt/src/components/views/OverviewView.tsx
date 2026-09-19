import React from 'react';
import { ArrowDown, Check } from 'lucide-react';

export const OverviewView: React.FC = () => {
  return (
    <div id="overview-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AquaAdapt
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Smart Feeding Monitoring System
          </p>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            ONLINE
          </div>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            Senin, 30 Agustus 2026
          </p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="bg-slate-100/70 border border-slate-200/80 rounded-md grid grid-cols-3 divide-x divide-slate-200/80 overflow-hidden shadow-xs">
        {/* Metric 1 */}
        <div className="p-6 text-center">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            KONDISI IKAN
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-tech">
            FULL
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 text-center">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            STATUS FEEDER
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-tech">
            STANDBY
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 text-center">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            PEMBERIAN BERIKUTNYA
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-tech">
            17.00
          </p>
        </div>
      </div>

      {/* AI DETECTION banner container */}
      <div className="bg-[#e5e7eb] rounded-lg p-3 pt-3.5 space-y-2 border border-slate-300/60 shadow-xs">
        <p className="text-[11px] font-bold tracking-widest text-slate-600 uppercase px-2 font-mono-code">
          AI DETECTION
        </p>
        <div className="bg-white rounded-md p-4 flex items-center justify-between shadow-xs border border-slate-200/60">
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600 font-medium">Kondisi Ikan</span>
            <span className="text-lg font-bold text-slate-900">FULL</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600 font-medium">Keputusan AI</span>
            <span className="text-lg font-bold text-[#0284c7]">Hentikan pemberian pakan</span>
          </div>
        </div>
      </div>

      {/* Two Column: Activity Log & Schedule */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-xs gap-6 md:gap-0">
        {/* Left Column: Feeding Activity History */}
        <div className="md:pr-8 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            RIWAYAT AKTIVITAS PEMBERIAN PAKAN
          </h2>
          <p className="text-sm font-bold text-slate-900 pt-1">
            Senin, 30 Agustus 2026
          </p>
          <div className="space-y-2 text-sm text-slate-700 pt-1">
            <div className="flex items-center gap-6 font-mono-code text-[13px]">
              <span className="font-semibold text-slate-900 w-12">07.00</span>
              <span className="text-slate-700">Hungry → Feeding → Full</span>
            </div>
            <div className="flex items-center gap-6 font-mono-code text-[13px]">
              <span className="font-semibold text-slate-900 w-12">17.00</span>
              <span className="text-slate-700">Hungry → Feeding → Full</span>
            </div>
          </div>
        </div>

        {/* Right Column: Feeding Schedule */}
        <div className="md:pl-8 space-y-3 pt-4 md:pt-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            JADWAL PEMBERIAN PAKAN
          </h2>
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-6 text-sm">
              <span className="font-mono-code font-semibold text-slate-900 w-12 text-[13px]">
                07.00
              </span>
              <div className="flex items-center gap-1.5 text-sky-500 font-medium text-[13px]">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Selesai</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="font-mono-code font-semibold text-slate-900 w-12 text-[13px]">
                17.00
              </span>
              <div className="flex items-center gap-2 text-slate-800 text-[13px]">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 inline-block" />
                <span>Berikutnya</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feeding Activity Graph */}
      <div className="bg-[#f9fafb] border border-slate-200/90 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          GRAFIK AKTIVITAS PEMBERIAN PAKAN
        </h2>

        <div className="relative pt-6 pb-2">
          {/* Y Axis Label */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1 absolute top-0 left-0">
            <span>Aktivitas</span>
            <span>↑</span>
          </div>

          {/* Graph Grid */}
          <div className="flex items-end gap-3 h-48 border-l border-b border-slate-300/80 ml-6 pl-4 relative">
            {/* Horizontal Grid Ticks */}
            <div className="absolute left-[-24px] top-0 text-[10px] text-slate-500 font-mono-code">2</div>
            <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono-code">1</div>
            <div className="absolute left-[-24px] bottom-0 text-[10px] text-slate-500 font-mono-code">0</div>

            {/* X-axis arrow */}
            <div className="absolute right-[-14px] bottom-[-8px] text-slate-400 text-xs">→</div>

            {/* Days with Bars */}
            {[
              { day: 'Senin', hasBar: true, height: 'h-10' },
              { day: 'Selasa', hasBar: true, height: 'h-10' },
              { day: 'Rabu', hasBar: true, height: 'h-10' },
              { day: 'Kamis', hasBar: true, height: 'h-10' },
              { day: 'Jumat', hasBar: false, height: 'h-0' },
              { day: 'Sabtu', hasBar: false, height: 'h-0' },
              { day: 'Minggu', hasBar: false, height: 'h-0' },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                {item.hasBar ? (
                  <div className={`w-8 ${item.height} bg-slate-950 rounded-xs transition-all hover:bg-slate-800 cursor-pointer shadow-xs`} />
                ) : (
                  <div className="w-8 h-0" />
                )}
                <span className="text-[11px] text-slate-600 mt-3 group-hover:text-slate-900 transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-3 text-[11px] text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
            <span>Pemberian pakan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
            <span>Deteksi Hungry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>Deteksi Full</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 shadow-xs relative">
        {/* Device Status */}
        <div className="md:pr-8 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            STATUS PERANGKAT
          </h2>
          <div className="space-y-2 pt-1 text-[13px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-800">Kamera</span>
              </div>
              <span className="text-slate-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-800">Jetson Nano</span>
              </div>
              <span className="text-slate-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full border border-slate-400 bg-transparent" />
                <span className="text-slate-800">Motor DC</span>
              </div>
              <span className="text-slate-600 font-medium">Standby</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="md:pl-8 space-y-3 pt-4 md:pt-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            KONEKSI
          </h2>
          <div className="space-y-2 pt-1 text-[13px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-800">Network</span>
              </div>
              <span className="text-slate-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-800">Status IoT</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll / Action floating button */}
        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
          title="Scroll ke bawah"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
