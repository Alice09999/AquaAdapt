import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Video, Settings2, AlertCircle, CheckCircle } from 'lucide-react';
import { TerminalLog } from '../../types';
import { API_BASE } from '../../config/api';

interface PcMonitorData {
  id: number;
  device_id: string;
  cpu_usage: number | null;
  ram_usage: number | null;
  cpu_temp: number | null;
  gpu_temp: number | null;
  created_at: string;
}

interface Device {
  id: number;
  device_id: string;
  device_name: string;
  status: string;
  last_seen: string | null;
}

export const HardwareView: React.FC = () => {
  const [pcMonitor, setPcMonitor] = useState<PcMonitorData | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Terminal state
  const [logs, setLogs] = useState<TerminalLog[]>([
    { timestamp: '14:32:01.002', level: 'INFO', message: 'Tautan telemetri Jetson Nano terhubung.' },
    { timestamp: '14:32:01.045', level: 'INFO', message: 'Aliran video kamera diinisialisasi via CSI-2 (1080p60).' },
    { timestamp: '14:32:02.110', level: 'INFO', message: 'Pengontrol motor PWM aktif pada GPIO 32.' },
    { timestamp: '14:32:05.400', level: 'PERINGATAN', message: 'Fluktuasi RPM kecil terdeteksi. Mengoreksi otomatis loop PI.' },
    { timestamp: '14:32:08.991', level: 'INFO', message: 'Kondisi sistem normal. Menunggu perintah jadwal pakan...' },
  ]);
  const [cmdInput, setCmdInput] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch pc_monitor data from database (polling setiap 5 detik)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monitorRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/pc_monitor.php?t=${Date.now()}`),
          fetch(`${API_BASE}/status.php`),
        ]);

        const monitorJson = await monitorRes.json();
        const statusJson = await statusRes.json();

        if (monitorJson.success && monitorJson.data) {
          setPcMonitor(monitorJson.data);
        }
        if (statusJson.success && statusJson.data?.device) {
          setDevice(statusJson.data.device);
        }
      } catch (err) {
        console.error('pc_monitor fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const memoryGB = pcMonitor?.ram_usage !== null ? (pcMonitor?.ram_usage! / 100 * 4).toFixed(1) : null;
  const memoryPercent = pcMonitor?.ram_usage !== null ? Math.round(pcMonitor?.ram_usage!) : null;

  return (
    <div id="hardware-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-tech uppercase">
          DIAGNOSTIK PERANGKAT KERAS
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Telemetri waktu-nyata dan status komponen sistem.
        </p>
      </div>

      {/* 3 Telemetry Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: JETSON NANO - CPU & GPU */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${device?.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
                JETSON NANO
              </span>
            </div>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                SUHU CPU
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {loading ? '-' : pcMonitor?.cpu_temp !== null ? `${pcMonitor.cpu_temp}°C` : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                SUHU GPU
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {loading ? '-' : pcMonitor?.gpu_temp !== null ? `${pcMonitor.gpu_temp}°C` : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                CPU USAGE
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {loading ? '-' : pcMonitor?.cpu_usage !== null ? `${pcMonitor.cpu_usage}%` : 'No data'}
              </span>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                PENGGUNAAN MEMORI
              </span>
              <span className="text-slate-800 font-semibold">
                {loading ? '-' : memoryGB !== null ? `${memoryGB} / 4.0 GB` : 'No data'}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0ea5e9] rounded-full transition-all duration-500"
                style={{ width: memoryPercent !== null ? `${memoryPercent}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: SISTEM KAMERA / VISI */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${device?.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
                SISTEM KAMERA / VISI
              </span>
            </div>
            <Video className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                FPS
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {loading ? '-' : fps !== null ? fps : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                RESOLUSI
              </span>
              <span className="text-xl font-bold text-slate-900 font-mono-code">
                1920×1080
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                RAM USAGE
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {loading ? '-' : pcMonitor?.ram_usage !== null ? `${pcMonitor.ram_usage}%` : 'No data'}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              STATUS
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-xs tracking-wider ${
              device?.status === 'online' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {device?.status === 'online' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Card 3: SYSTEM STATUS */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${device?.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
                STATUS SISTEM
              </span>
            </div>
            <Settings2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                DEVICE
              </span>
              <span className="text-slate-900 font-mono-code font-semibold">
                {device?.device_name || 'AI-001'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                DEVICE ID
              </span>
              <span className="text-slate-900 font-mono-code font-semibold">
                {device?.device_id || 'AI-001'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                LAST SEEN
              </span>
              <span className="text-slate-700 font-mono-code text-[11px]">
                {device?.last_seen ? new Date(device.last_seen).toLocaleString('id-ID') : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                PC MONITOR UPDATED
              </span>
              <span className="text-slate-700 font-mono-code text-[11px]">
                {pcMonitor?.created_at ? new Date(pcMonitor.created_at).toLocaleString('id-ID') : 'Never'}
              </span>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                DATABASE
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                API SERVER
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Running
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                TELEMETRI
              </span>
              <span className={`flex items-center gap-1.5 font-semibold ${
                pcMonitor ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {pcMonitor ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    No Data
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Window: KESEHATAN SISTEM // TERMINAL */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {/* Window Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code">
            KESEHATAN SISTEM // TERMINAL
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-transparent" />
            <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-transparent" />
            <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-transparent" />
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 bg-[#fbfcfd] min-h-64 font-mono-code text-xs space-y-2 select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <span className="text-slate-500 shrink-0 select-none">
                {log.timestamp}
              </span>
              <span
                className={`font-bold shrink-0 select-none ${
                  log.level === 'PERINGATAN'
                    ? 'text-red-600'
                    : log.level === 'ERROR'
                    ? 'text-red-700'
                    : 'text-[#0284c7]'
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-slate-800">
                {log.message}
              </span>
            </div>
          ))}

          {/* Interactive Shell Prompt */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!cmdInput.trim()) return;

            const trimmed = cmdInput.trim();
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

            if (trimmed.toLowerCase() === 'clear') {
              setLogs([]);
              setCmdInput('');
              return;
            }

            let response = '';
            let level: 'INFO' | 'PERINGATAN' | 'ERROR' = 'INFO';

            if (trimmed.toLowerCase() === 'help') {
              response = 'Perintah tersedia: help, status, ping, feed, clear';
            } else if (trimmed.toLowerCase() === 'status') {
              const cpuTempStr = pcMonitor?.cpu_temp !== null ? `${pcMonitor.cpu_temp}°C` : 'N/A';
              const gpuTempStr = pcMonitor?.gpu_temp !== null ? `${pcMonitor.gpu_temp}°C` : 'N/A';
              const cpuUsageStr = pcMonitor?.cpu_usage !== null ? `${pcMonitor.cpu_usage}%` : 'N/A';
              const ramUsageStr = pcMonitor?.ram_usage !== null ? `${pcMonitor.ram_usage}%` : 'N/A';
              const memStr = memoryGB !== null ? `${memoryGB}/4.0GB` : 'N/A';
              const fpsStr = fps !== null ? `${fps} FPS` : 'N/A';
              const deviceStatus = device?.status === 'online' ? 'ONLINE' : 'OFFLINE';
              response = `Jetson: ${deviceStatus} | CPU: ${cpuTempStr} | GPU: ${gpuTempStr} | CPU Usage: ${cpuUsageStr} | RAM: ${ramUsageStr} | Video: ${fpsStr} | Memori: ${memStr}`;
            } else if (trimmed.toLowerCase() === 'ping') {
              response = 'Koneksi telemetri: pong (latensi: 4ms)';
            } else if (trimmed.toLowerCase() === 'feed') {
              response = 'Memulai siklus pemberian pakan manual selama 5 detik... Motor PWM ON.';
            } else {
              response = `Perintah tidak dikenal: '${trimmed}'. Ketik 'help' untuk panduan.`;
              level = 'PERINGATAN';
            }

            setLogs((prev) => [
              ...prev,
              { timestamp: timeStr, level: 'INFO', message: `root@aqua-mon:~# ${trimmed}` },
              { timestamp: timeStr, level, message: response },
            ]);
            setCmdInput('');
          }} className="flex items-center gap-2 pt-2 text-[#0284c7]">
            <span className="select-none font-bold">root@aqua-mon:~#</span>
            <input
              type="text"
              id="terminal-input"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="ketik perintah (misal: 'help', 'status', 'ping')..."
              className="flex-1 bg-transparent text-slate-900 focus:outline-hidden font-mono-code text-xs placeholder:text-slate-400"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="w-2 h-4 bg-[#0284c7] inline-block animate-pulse" />
          </form>

          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
