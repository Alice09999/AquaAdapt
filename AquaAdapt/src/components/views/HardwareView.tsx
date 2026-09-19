import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Video, Settings2 } from 'lucide-react';
import { TerminalLog } from '../../types';

export const HardwareView: React.FC = () => {
  const [cpuTemp, setCpuTemp] = useState<number>(42.5);
  const [gpuTemp, setGpuTemp] = useState<number>(45.1);
  const [fps, setFps] = useState<number>(60.0);
  const [rpm, setRpm] = useState<number>(1450);
  const [voltage, setVoltage] = useState<number>(12.4);
  const [motorLoad, setMotorLoad] = useState<number>(42);

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

  // Subtle real-time sensor fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuTemp((prev) => +(42.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setGpuTemp((prev) => +(45.1 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setFps((prev) => +(59.9 + (Math.random() * 0.3 - 0.1)).toFixed(1));
      setRpm((prev) => Math.round(1450 + (Math.random() * 6 - 3)));
      setVoltage((prev) => +(12.4 + (Math.random() * 0.1 - 0.05)).toFixed(1));
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
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
      response = 'Perintah tersedia: help, status, ping, feed, rpm [nilai], clear';
    } else if (trimmed.toLowerCase() === 'status') {
      response = `Jetson: OK | Temp: ${cpuTemp}°C | RPM: ${rpm} | Video: ${fps} FPS | Memori: 2.4/4.0GB`;
    } else if (trimmed.toLowerCase() === 'ping') {
      response = 'Koneksi telemetri: pong (latensi: 4ms)';
    } else if (trimmed.toLowerCase().startsWith('rpm')) {
      const parts = trimmed.split(' ');
      const val = parseInt(parts[1], 10);
      if (!isNaN(val) && val >= 0 && val <= 3000) {
        setRpm(val);
        response = `Target RPM motor diubah ke ${val}. Loop PID sinkronisasi berhasil.`;
      } else {
        response = 'Format salah. Gunakan: rpm [0-3000]';
        level = 'PERINGATAN';
      }
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
  };

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
        {/* Card 1: JETSON NANO */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
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
                {cpuTemp}°C
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                SUHU GPU
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {gpuTemp}°C
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
                2.4 / 4.0 GB
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[60%] h-full bg-[#0ea5e9] rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 2: SISTEM KAMERA / VISI */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
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
                {fps}
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
          </div>

          {/* Status badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              STATUS
            </span>
            <span className="bg-[#0ea5e9] text-white text-xs font-bold px-3 py-1 rounded-xs tracking-wider">
              ONLINE
            </span>
          </div>
        </div>

        {/* Card 3: MOTOR PENGGERAK UTAMA */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
                MOTOR PENGGERAK UTAMA
              </span>
            </div>
            <Settings2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                TEGANGAN
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono-code">
                {voltage}V
              </span>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase block">
                RPM SAAT INI
              </span>
              <p className="text-4xl font-extrabold text-[#0284c7] font-mono-code tracking-tight mt-0.5">
                {rpm}
              </p>
            </div>
          </div>

          {/* Beban Motor */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono-code">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              BEBAN MOTOR
            </span>
            <span className="text-slate-800 font-semibold">
              {motorLoad}%
            </span>
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
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-2 text-[#0284c7]">
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
