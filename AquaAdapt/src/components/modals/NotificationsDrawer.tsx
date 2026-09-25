import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { NotificationItem } from '../../types';
import { API_BASE } from '../../config/api';

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTypeIcon(type: 'info' | 'warning' | 'success') {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    default:
      return <Info className="w-3.5 h-3.5 text-sky-500" />;
  }
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);
    timeoutRef.current = timeoutId;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/notifications.php?limit=20&offset=0`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
        setUnreadCount(json.unread_count ?? json.data.length);
        onUnreadCountChange?.(json.unread_count ?? json.data.length);
      } else {
        throw new Error(json.message || 'Gagal memuat notifikasi');
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Gagal mengambil data dari server';
      setError(message);
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications();
    return () => {
      abortControllerRef.current?.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex flex-col min-h-0 flex-1">
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
          <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-mono-code">Memuat notifikasi...</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <p className="text-sm text-red-600 font-mono-code font-medium">Gagal memuat notifikasi</p>
                <p className="text-xs text-slate-500 font-mono-code">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 px-3 py-1.5 text-xs font-bold text-sky-600 border border-sky-300 rounded-md hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <Bell className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500 font-mono-code font-medium">Tidak ada notifikasi</p>
                <p className="text-xs text-slate-400 font-mono-code">Sistem akan menampilkan notifikasi di sini saat ada event baru.</p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors space-y-1 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate pr-2">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono-code shrink-0 ml-2">{formatTimestamp(item.timestamp)}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-slate-400 font-mono-code uppercase">{item.source_table}</span>
                        <span className="text-[9px] text-slate-400 font-mono-code">ID: {item.source_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
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