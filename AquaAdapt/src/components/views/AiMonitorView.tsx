import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Activity, FileText } from 'lucide-react';
import { EventLogItem } from '../../types';

export const AiMonitorView: React.FC = () => {
  const [detectionEnabled, setDetectionEnabled] = useState<boolean>(true);
  const [temp, setTemp] = useState<number>(28.4);
  const [ph, setPh] = useState<number>(7.2);
  const [doLevel, setDoLevel] = useState<number>(6.8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial event logs matching screenshot exactly
  const [events] = useState<EventLogItem[]>([
    { time: '14:32:01', message: 'Pakan terdeteksi di sektor permukaan 2', highlight: true },
    { time: '14:31:45', message: 'Pakan habis terkonsumsi oleh ikan', highlight: false },
    { time: '14:30:12', message: 'Pemberian pakan selesai, monitoring sisa pelet', highlight: true },
    { time: '14:28:59', message: 'Kondisi kolam: Bebas sisa pakan (Permukaan Bersih)', highlight: false },
    { time: '14:25:00', message: 'Pemeriksaan sensor optik normal', highlight: true },
    { time: '14:20:11', message: 'Kalibrasi detektor pakan otomatis berhasil', highlight: false },
  ]);

  // Pond live simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frame = 0;

    // Simulated ripple rings
    const ripples: { x: number; y: number; radius: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 16; i++) {
      ripples.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        radius: Math.random() * 40,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.5 + 0.4,
      });
    }

    // Fish / feed particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: 200 + Math.random() * 400,
        y: 150 + Math.random() * 350,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1.5,
      });
    }

    const render = () => {
      frame++;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 540;

      // Deep aquatic pond background gradient (matching the industrial pond in screenshot)
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(0.3, '#1e293b');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Water churn / flow textures
      ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const waveY = (canvas.height / 5) * i + Math.sin(frame * 0.02 + i) * 15;
        ctx.ellipse(canvas.width * 0.45, waveY, canvas.width * 0.4, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pond concrete catwalk / bridge structure silhouette on top & right
      ctx.fillStyle = '#1e293b';
      // Walkway railing top
      ctx.fillRect(0, 0, canvas.width, 24);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 24, canvas.width, 4);

      // Feeding ripples
      ripples.forEach((r) => {
        r.radius += r.speed;
        r.opacity -= 0.003;
        if (r.opacity <= 0 || r.radius > 80) {
          r.radius = Math.random() * 5;
          r.opacity = Math.random() * 0.4 + 0.3;
          r.x = canvas.width * 0.25 + Math.random() * (canvas.width * 0.5);
          r.y = canvas.height * 0.3 + Math.random() * (canvas.height * 0.5);
        }

        ctx.strokeStyle = `rgba(186, 230, 253, ${r.opacity * 0.45})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 1.6, r.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Swirling floating feed pellets
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(frame * 0.03) * 0.2;
        p.y += p.vy + Math.cos(frame * 0.02) * 0.2;

        if (p.x < 150) p.vx = Math.abs(p.vx);
        if (p.x > canvas.width - 150) p.vx = -Math.abs(p.vx);
        if (p.y < 100) p.vy = Math.abs(p.vy);
        if (p.y > canvas.height - 80) p.vy = -Math.abs(p.vy);

        ctx.fillStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // CCTV scanline texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Jitter telemetry slightly for realism
    const interval = setInterval(() => {
      setTemp((prev) => +(28.4 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setPh((prev) => +(7.2 + (Math.random() * 0.2 - 0.1)).toFixed(1));
      setDoLevel((prev) => +(6.8 + (Math.random() * 0.2 - 0.1)).toFixed(1));
    }, 4000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, []);

  return (
    <div id="ai-monitor-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-tech uppercase">
            SISTEM PENGAWASAN AI
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Analisis visual kondisi kolam & deteksi sisa pakan secara langsung
          </p>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>ONLINE / SISTEM AKTIF</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Video + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera View */}
        <div className="lg:col-span-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-300 shadow-md relative group aspect-[4/3] md:aspect-[16/10] flex flex-col justify-between">
          {/* Top Video Header HUD */}
          <div className="relative z-10 bg-slate-950/80 backdrop-blur-xs px-4 py-2 flex items-center justify-between border-b border-white/10 text-white font-mono-code text-xs select-none">
            <span className="tracking-wider text-slate-200 font-semibold">
              KAMERA_ATAS_01 // PERMUKAAN_KOLAM_UTAMA
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider">
                LIVE FEED
              </span>
            </div>
          </div>

          {/* Canvas Pond Simulation */}
          <div className="absolute inset-0 z-0">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* AI Bounding Boxes Overlays (matching Screenshot 2) */}
          {detectionEnabled && (
            <div className="absolute inset-0 z-10 pointer-events-none p-6">
              {/* Box 1: PAKAN_TERDETEKSI : FULL */}
              <div 
                className="absolute border-2 border-sky-400 bg-sky-400/10 rounded-xs transition-all"
                style={{ top: '22%', left: '16%', width: '38%', height: '32%' }}
              >
                {/* Header Tag */}
                <div className="absolute -top-6 left-0 bg-[#0284c7] text-white font-mono-code text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping" />
                  PAKAN_TERDETEKSI : FULL
                </div>
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full" />
              </div>

              {/* Box 2: SEBARAN PAKAN : FULL */}
              <div 
                className="absolute border-2 border-sky-400 bg-sky-400/10 rounded-xs transition-all"
                style={{ top: '56%', left: '12%', width: '44%', height: '35%' }}
              >
                {/* Header Tag */}
                <div className="absolute -top-6 left-0 bg-[#0284c7] text-white font-mono-code text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping" />
                  SEBARAN PAKAN : FULL
                </div>
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full" />
              </div>
            </div>
          )}

          {/* Bottom HUD Bar */}
          <div className="relative z-10 bg-slate-950/85 backdrop-blur-xs px-4 py-2 border-t border-white/10 flex items-center justify-between text-slate-300 font-mono-code text-[11px]">
            <div className="flex items-center gap-4">
              <span className="font-bold tracking-wider text-slate-100">
                POND A7 FEEDING ZONE
              </span>
              <span className="text-slate-500">|</span>
              <span>TEMP: {temp}°C</span>
              <span className="text-slate-500">|</span>
              <span>PH: {ph}</span>
              <span className="text-slate-500">|</span>
              <span>DO: {doLevel} mg/L</span>
            </div>
            <div className="text-[10px] text-sky-400 uppercase tracking-widest font-semibold hidden sm:block">
              AI ENGINE: YOLO-AQUA v8.4
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Metrics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: KONTROL_MODUL */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>KONTROL_MODUL</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Deteksi Keberadaan Pakan
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Deteksi pakan tersisa di permukaan air
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                id="toggle-detection-pakan"
                onClick={() => setDetectionEnabled(!detectionEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  detectionEnabled ? 'bg-[#0ea5e9]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
                    detectionEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 2: METRIK_REALTIME */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              <span>METRIK_REALTIME</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Status Pakan Kolam */}
              <div>
                <div className="flex items-center justify-between pb-1.5 font-semibold">
                  <span className="text-slate-700 tracking-wider uppercase text-[11px]">
                    STATUS PAKAN KOLAM
                  </span>
                  <span className="text-[#0ea5e9] uppercase tracking-wider">
                    ADA PAKAN (TERSEDIA)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-[#0ea5e9] rounded-full" />
                </div>
              </div>

              {/* Kepadatan Sebaran Pakan */}
              <div>
                <div className="flex items-center justify-between pb-1.5 font-semibold">
                  <span className="text-slate-700 tracking-wider uppercase text-[11px]">
                    KEPADATAN SEBARAN PAKAN
                  </span>
                  <span className="text-[#0ea5e9] uppercase tracking-wider">
                    MERATA (88%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[88%] h-full bg-[#0ea5e9] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: RIWAYAT_KEJADIAN */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>RIWAYAT_KEJADIAN</span>
            </div>

            <div className="divide-y divide-slate-100 font-mono-code text-[11px] max-h-56 overflow-y-auto pr-1">
              {events.map((evt, idx) => (
                <div key={idx} className="py-2 flex items-start gap-2">
                  <span className="text-slate-400 shrink-0">[{evt.time}]</span>
                  <span className={evt.highlight ? 'text-[#0ea5e9] font-medium' : 'text-slate-700'}>
                    {evt.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
