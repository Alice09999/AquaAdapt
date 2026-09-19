import React from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle } from 'lucide-react';

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmergencyActive: boolean;
  onToggleEmergency: () => void;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({
  isOpen,
  onClose,
  isEmergencyActive,
  onToggleEmergency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          isEmergencyActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border-b border-red-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-tech">
              {isEmergencyActive ? 'PERINGATAN: SISTEM DARURAT AKTIF' : 'KONFIRMASI HENTIKAN DARURAT'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-sm transition-colors ${
              isEmergencyActive ? 'hover:bg-red-700 text-white' : 'hover:bg-red-100 text-red-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-700">
          {isEmergencyActive ? (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs leading-relaxed flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  Semua aktuator motor DC pemutar pakan telah <strong>diputus secara paksa</strong>. Kamera dan telemetri Jetson Nano tetap aktif dalam mode observasi pasif.
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Pastikan area tangki dan hopper pakan telah aman dari penyumbatan mekanis sebelum menyalakan ulang sistem.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-slate-900">
                Apakah Anda yakin ingin mematikan semua operasi pakan ikan secara mendadak?
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Motor penggerak PWM akan langsung dihentikan (0 RPM).</li>
                <li>Jadwal pakan otomatis dan analisis pengawasan AI dijeda.</li>
                <li>Status telemetri dialihkan ke mode siaga darurat.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors"
          >
            Tutup
          </button>
          <button
            id="btn-confirm-emergency"
            onClick={() => {
              onToggleEmergency();
              onClose();
            }}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white shadow-xs transition-colors flex items-center gap-2 ${
              isEmergencyActive
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isEmergencyActive ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>PULIHKAN SISTEM (RESET)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>AKTIFKAN STOP DARURAT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
