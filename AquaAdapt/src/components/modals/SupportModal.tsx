import React from 'react';
import { X, HelpCircle, Phone, BookOpen, ShieldCheck } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-tech text-slate-800">
              PUSAT BANTUAN & DUKUNGAN TEKNIS
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-md text-sky-900">
            <p className="font-bold">AquaAdapt v4.2.0-STABLE</p>
            <p className="text-[11px] text-sky-700 mt-1">
              Sistem monitoring dan feeding otomatis kolam budidaya berbasis kecerdasan buatan edge computing.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Panduan Singkat:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Ringkasan</strong>: Tinjauan status pakan saat ini, keputusan AI, dan telemetri koneksi.</li>
              <li><strong>Monitor AI</strong>: Live streaming kamera dengan deteksi pakan permukaan kolam.</li>
              <li><strong>Riwayat Pakan</strong>: Audit log pemberian nutrisi dengan metrik akurasi 98.2%.</li>
              <li><strong>Penjadwal</strong>: Pengaturan siklus interval tetap & jendela adaptif AI.</li>
              <li><strong>Perangkat</strong>: Status Jetson Nano, kamera 60fps, motor DC PWM, dan console terminal.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dukungan Tim Lapangan:</span>
            </div>
            <span className="font-mono-code font-bold text-slate-900">+62 812-8899-AQUA</span>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white bg-[#0ea5e9] hover:bg-sky-600 transition-colors shadow-xs"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
