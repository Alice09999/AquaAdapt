import React, { useState, useEffect } from 'react';
import { ArrowDown, Check } from 'lucide-react';

const API_BASE = 'http://localhost/smart-feeder/api';

const HARI_INDONESIA: Record<string, string> = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

const HARI顺序 = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface Detection {
  id: number;
  device_id: string;
  status: string;
  confidence: number;
  detected_at: string;
  created_at: string;
}

interface FeedingLog {
  id: number;
  device_id: string;
  device_name: string;
  ai_decision: string;
  motor_status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

interface FeedingSchedule {
  id: number;
  device_id: string;
  device_name: string;
  schedule_code: string;
  schedule_type: string;
  feeding_time: string;
  active_days: string[];
  duration_seconds: number;
  intensity_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Device {
  id: number;
  device_id: string;
  device_name: string;
  status: string;
  last_seen: string | null;
}

function formatTime(timeStr: string): string {
  const parts = timeStr.split(':');
  return `${parts[0]}.${parts[1]}`;
}

function formatTanggal(date: Date): string {
  const hari = HARI_INDONESIA[date.toLocaleDateString('en-US', { weekday: 'long' })] || '';
  const dd = date.getDate();
  const bulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulan = bulanIndo[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${hari}, ${dd} ${bulan} ${yyyy}`;
}

export const OverviewView: React.FC = () => {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detRes, logRes, schedRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/status.php`),
          fetch(`${API_BASE}/feeding_logs.php?limit=50`),
          fetch(`${API_BASE}/feeding_schedules.php`),
          fetch(`${API_BASE}/health.php`),
        ]);

        const detJson = await detRes.json();
        const logJson = await logRes.json();
        const schedJson = await schedRes.json();
        const healthJson = await healthRes.json();

        if (detJson.success && detJson.data) {
          setDetection(detJson.data);
        }
        if (logJson.success && logJson.data) {
          setFeedingLogs(logJson.data);
        }
        if (schedJson.success && schedJson.data) {
          setSchedules(schedJson.data);
        }

        if (healthJson.success) {
          setDevice({
            id: 1,
            device_id: 'AI-001',
            device_name: 'AI Kamera Kolam 1',
            status: healthJson.database === 'connected' ? 'online' : 'offline',
            last_seen: healthJson.timestamp,
          });
        }
      } catch {
        // Network error — device stays null
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const kondisiIkan = detection?.status === 'pakan_ada' ? 'FULL' : detection?.status === 'pakan_habis' ? 'Hungry' : '-';
  const keputusanAI = detection?.status === 'pakan_ada' ? 'Hentikan pemberian pakan' : detection?.status === 'pakan_habis' ? 'Mulai pemberian pakan' : '-';
  const isDeviceOnline = device?.status === 'online';

  const now = new Date();
  const todayName = HARI_INDONESIA[now.toLocaleDateString('en-US', { weekday: 'long' })] || '';
  const todayLogs = feedingLogs.filter((log) => {
    const logDate = new Date(log.started_at);
    return logDate.toDateString() === now.toDateString();
  });

  const todaySchedules = schedules
    .filter((s) => s.is_active && s.active_days.includes(todayName))
    .sort((a, b) => a.feeding_time.localeCompare(b.feeding_time));

  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextSchedule = todaySchedules.find((s) => s.feeding_time > nowHHMM);

  const lastLog = feedingLogs.length > 0 ? feedingLogs[0] : null;
  const statusFeeder = lastLog?.motor_status === 'ON' ? 'FEEDING' : 'STANDBY';

  const lastLogTime = lastLog ? new Date(lastLog.started_at) : null;
  const isRecentlyActive = lastLogTime ? (now.getTime() - lastLogTime.getTime()) < 15 * 60 * 1000 : false;

  const weeklyData = HARI顺序.map((day) => {
    const count = feedingLogs.filter((log) => {
      const logDate = new Date(log.started_at);
      const logDay = HARI_INDONESIA[logDate.toLocaleDateString('en-US', { weekday: 'long' })];
      return logDay === day;
    }).length;
    return { day, count };
  });

  const maxBarCount = Math.max(...weeklyData.map((d) => d.count), 1);
  const maxHeightPx = 192;

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
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase ${isDeviceOnline ? 'text-sky-500' : 'text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
            {isDeviceOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            {formatTanggal(now)}
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
            {loading ? '-' : kondisiIkan}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 text-center">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            STATUS FEEDER
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-tech">
            {loading ? '-' : statusFeeder}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 text-center">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            PEMBERIAN BERIKUTNYA
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-tech">
            {loading ? '-' : nextSchedule ? formatTime(nextSchedule.feeding_time) : '-'}
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
            <span className="text-lg font-bold text-slate-900">{loading ? '-' : kondisiIkan}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600 font-medium">Keputusan AI</span>
            <span className="text-lg font-bold text-[#0284c7]">{loading ? '-' : keputusanAI}</span>
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
            {formatTanggal(now)}
          </p>
          <div className="space-y-2 text-sm text-slate-700 pt-1">
            {loading ? (
              <p className="text-slate-400 text-sm">Memuat data...</p>
            ) : todayLogs.length === 0 ? (
              <p className="text-slate-400 text-sm">Belum ada aktivitas hari ini</p>
            ) : (
              todayLogs.map((log) => {
                const logTime = new Date(log.started_at);
                const hh = String(logTime.getHours()).padStart(2, '0');
                const mm = String(logTime.getMinutes()).padStart(2, '0');
                return (
                  <div key={log.id} className="flex items-center gap-6 font-mono-code text-[13px]">
                    <span className="font-semibold text-slate-900 w-12">{hh}.{mm}</span>
                    <span className="text-slate-700">{log.ai_decision} → Feeding → {log.motor_status === 'ON' ? 'Feeding' : 'Full'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Feeding Schedule */}
        <div className="md:pl-8 space-y-3 pt-4 md:pt-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            JADWAL PEMBERIAN PAKAN
          </h2>
          <div className="space-y-3 pt-3">
            {loading ? (
              <p className="text-slate-400 text-sm">Memuat data...</p>
            ) : todaySchedules.length === 0 ? (
              <p className="text-slate-400 text-sm">Tidak ada jadwal hari ini</p>
            ) : (
              todaySchedules.map((sched) => {
                const isCompleted = sched.feeding_time <= nowHHMM;
                return (
                  <div key={sched.id} className="flex items-center gap-6 text-sm">
                    <span className="font-mono-code font-semibold text-slate-900 w-12 text-[13px]">
                      {formatTime(sched.feeding_time)}
                    </span>
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-sky-500 font-medium text-[13px]">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Selesai</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800 text-[13px]">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 inline-block" />
                        <span>Berikutnya</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
            <div className="absolute left-[-24px] top-0 text-[10px] text-slate-500 font-mono-code">{maxBarCount}</div>
            <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono-code">{Math.ceil(maxBarCount / 2)}</div>
            <div className="absolute left-[-24px] bottom-0 text-[10px] text-slate-500 font-mono-code">0</div>

            {/* X-axis arrow */}
            <div className="absolute right-[-14px] bottom-[-8px] text-slate-400 text-xs">→</div>

            {/* Days with Bars */}
            {weeklyData.map((item, idx) => {
              const barHeight = item.count > 0
                ? Math.max(8, Math.round((item.count / maxBarCount) * maxHeightPx))
                : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  {barHeight > 0 ? (
                    <div
                      className="w-8 bg-slate-950 rounded-xs transition-all hover:bg-slate-800 cursor-pointer shadow-xs"
                      style={{ height: `${barHeight}px` }}
                      title={`${item.day}: ${item.count} aktivitas`}
                    />
                  ) : (
                    <div className="w-8 h-0" />
                  )}
                  <span className="text-[11px] text-slate-600 mt-3 group-hover:text-slate-900 transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
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
                <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-sky-500' : 'bg-slate-400'}`} />
                <span className="text-slate-800">Kamera</span>
              </div>
              <span className="text-slate-600 font-medium">{isDeviceOnline ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-sky-500' : 'bg-slate-400'}`} />
                <span className="text-slate-800">Jetson Nano</span>
              </div>
              <span className="text-slate-600 font-medium">{isDeviceOnline ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${lastLog?.motor_status === 'ON' ? 'bg-sky-500' : 'border border-slate-400 bg-transparent'}`} />
                <span className="text-slate-800">Motor DC</span>
              </div>
              <span className="text-slate-600 font-medium">{lastLog?.motor_status === 'ON' ? 'Active' : 'Standby'}</span>
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
                <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-sky-500' : 'bg-slate-400'}`} />
                <span className="text-slate-800">Network</span>
              </div>
              <span className="text-slate-600 font-medium">{isDeviceOnline ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-800">Status IoT</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-sky-500' : 'bg-slate-400'}`} />
                <span className="text-slate-600 font-medium">{isDeviceOnline ? 'Active' : 'Inactive'}</span>
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
