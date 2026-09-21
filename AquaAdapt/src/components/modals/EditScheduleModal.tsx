import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, Trash2 } from 'lucide-react';
import { FeedingScheduleItem } from '../../types';
import { API_BASE } from '../../config/api';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdated: () => void;
  schedule: FeedingScheduleItem | null;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleUpdated,
  schedule,
}) => {
  const [scheduleType, setScheduleType] = useState<'Interval Tetap' | 'Berbasis AI'>('Interval Tetap');
  const [time, setTime] = useState<string>('07:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  const [duration, setDuration] = useState<string>('45');
  const [intensity, setIntensity] = useState<string>('80');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    if (schedule) {
      setScheduleType(schedule.schedule_type);
      setTime(schedule.feeding_time.slice(0, 5));
      setSelectedDays(schedule.active_days);
      setDuration(String(schedule.duration_seconds));
      setIntensity(String(schedule.intensity_percent));
      setIsActive(schedule.is_active);
      setSubmitError(null);
    }
  }, [schedule]);

  if (!isOpen || !schedule) return null;

  const toggleDay = (d: string) => {
    if (selectedDays.includes(d)) {
      setSelectedDays(selectedDays.filter((x) => x !== d));
    } else {
      setSelectedDays([...selectedDays, d]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/feeding_schedules.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schedule.id,
          schedule_type: scheduleType,
          feeding_time: time,
          active_days: selectedDays,
          duration_seconds: parseInt(duration, 10),
          intensity_percent: parseInt(intensity, 10),
          is_active: isActive,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        onScheduleUpdated();
        onClose();
      } else {
        throw new Error(json.message || 'Gagal memperbarui jadwal');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui jadwal';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/feeding_schedules.php?id=${schedule.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        onScheduleUpdated();
        onClose();
      } else {
        throw new Error(json.message || 'Gagal menghapus jadwal');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus jadwal';
      setSubmitError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-tech text-slate-800">
              EDIT JADWAL PAKAN
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-mono-code">
              {submitError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code">
              KODE JADWAL
            </label>
            <input
              type="text"
              value={schedule.schedule_code}
              readOnly
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm font-mono-code font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code">
              TIPE PROTOKOL
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScheduleType('Interval Tetap')}
                className={`py-2.5 px-3 border rounded-md text-xs font-semibold text-center transition-all cursor-pointer ${
                  scheduleType === 'Interval Tetap'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Interval Tetap (Timer)
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('Berbasis AI')}
                className={`py-2.5 px-3 border rounded-md text-xs font-semibold text-center transition-all cursor-pointer ${
                  scheduleType === 'Berbasis AI'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Berbasis AI (Adaptif)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code">
              WAKTU PEMBERIAN (WIB)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-sm font-mono-code font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code">
              HARI AKTIF
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysList.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0ea5e9] text-white border-sky-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 tracking-wider uppercase font-mono-code block">
                DURASI (DETIK)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="300"
                className="w-full bg-white border border-slate-300 rounded-sm py-2 px-3 text-lg font-mono-code font-bold text-slate-900 shadow-2xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 tracking-wider uppercase font-mono-code block">
                INTENSITAS (%)
              </label>
              <input
                type="number"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                min="1"
                max="100"
                className="w-full bg-white border border-slate-300 rounded-sm py-2 px-3 text-lg font-mono-code font-bold text-slate-900 shadow-2xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono-code flex items-center gap-2">
              STATUS
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-sky-500 border-slate-300 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Jadwal</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white bg-[#0ea5e9] hover:bg-sky-600 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};