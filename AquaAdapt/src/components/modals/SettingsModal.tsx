import React from 'react';
import { X, Settings, ShieldCheck, Database, Sliders, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-tech text-slate-800">
              PENGATURAN SISTEM AQUA-MONITOR
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Telemetry settings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>PARAMETER TELEMETRI & JARINGAN</span>
            </div>
            <div className="space-y-2 pl-5">
              <div className="flex items-center justify-between py-1">
                <span>Frekuensi Polling Telemetri</span>
                <span className="font-mono-code font-bold text-slate-900">3.5 detik</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Protokol Kamera Visi</span>
                <span className="font-mono-code font-bold text-slate-900">CSI-2 / 1080p60</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Model Inferensi AI</span>
                <span className="font-mono-code font-bold text-slate-900">YOLO-Aqua v8.4 Edge</span>
              </div>
            </div>
          </div>

          {/* System info */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>STATUS PERANGKAT KERAS</span>
            </div>
            <div className="space-y-1.5 pl-5 text-slate-600">
              <p>NVIDIA Jetson Nano 4GB B01 (Firmware JetPack 5.1)</p>
              <p>Motor Driver: Dual H-Bridge BTS7960 (PWM 25kHz)</p>
              <p>Status Keamanan Fail-Safe: <span className="text-emerald-600 font-bold">AKTIF</span></p>
            </div>
          </div>

          {/* Operator profile */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>AKUN OPERATOR</span>
            </div>
            <div className="pl-5 text-slate-600">
              <p className="font-mono-code">lampungnista@gmail.com</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Otoritas: Administrator Kolam Utama</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
