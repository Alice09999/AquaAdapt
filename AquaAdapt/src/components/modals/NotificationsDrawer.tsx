import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Siklus Pakan Selesai',
      desc: 'Pemberian pakan 07.00 WIB selesai secara otomatis.',
      time: '1 jam yang lalu',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Fluktuasi RPM Terdeteksi',
      desc: 'Sistem loop PI mengoreksi putaran motor penggerak.',
      time: '3 jam yang lalu',
    },
    {
      id: 3,
      type: 'success',
      title: 'Kalibrasi Sensor Optik Berhasil',
      desc: 'Akurasi deteksi AI diperbarui menjadi 98.2%.',
      time: 'Hari ini 06:30 WIB',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono-code text-slate-800">
                NOTIFIKASI SISTEM
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono-code">{item.time}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold uppercase tracking-wider"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
