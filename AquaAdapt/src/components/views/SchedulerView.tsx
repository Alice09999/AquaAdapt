import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { FeedingScheduleItem } from '../../types';
import { API_BASE } from '../../config/api';
import { EditScheduleModal } from '../modals/EditScheduleModal';

interface SchedulerViewProps {
  onOpenNewScheduleModal: () => void;
  refreshKey?: number;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  onOpenNewScheduleModal,
  refreshKey,
}) => {
  const [duration, setDuration] = useState<string>('045');
  const [intensity, setIntensity] = useState<string>('080');

  const [schedules, setSchedules] = useState<FeedingScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editSchedule, setEditSchedule] = useState<FeedingScheduleItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/feeding_schedules.php`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSchedules(json.data);
      } else {
        throw new Error(json.message || 'Gagal memuat jadwal');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data dari server';
      setError(message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules, refreshKey]);

  const handleToggleActive = async (schedule: FeedingScheduleItem) => {
    try {
      const res = await fetch(`${API_BASE}/feeding_schedules.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule.id, is_active: !schedule.is_active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === schedule.id ? { ...s, is_active: !s.is_active } : s))
        );
      }
    } catch {
      // silently fail, keep current state
    }
  };

  const handleOpenEdit = (schedule: FeedingScheduleItem) => {
    setEditSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditSchedule(null);
  };

  const handleEditSuccess = () => {
    fetchSchedules();
    handleEditClose();
  };

  const handleDelete = async (schedule: FeedingScheduleItem) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/feeding_schedules.php?id=${schedule.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
      }
    } catch {
      // silently fail
    }
  };

  return (
    <>
      <div id="scheduler-view" className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-tech uppercase">
            PROTOKOL PENJADWAL
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola jadwal interval tetap dan pemberian pakan otomatis berbasis AI.
          </p>
        </div>
        <button
          id="btn-tambah-jadwal-baru"
          onClick={onOpenNewScheduleModal}
          className="inline-flex items-center gap-1.5 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>JADWAL BARU</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              MATRIKS JADWAL [7-HARI]
            </h2>
            <div className="flex items-center gap-5 text-[11px] font-mono-code">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3.5 h-3.5 bg-sky-200 border border-sky-300 rounded-xs inline-block" />
                <span>INTERVAL TETAP</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3.5 h-3.5 border-2 border-dashed border-sky-400 bg-sky-50 rounded-xs inline-block" />
                <span>BERBASIS AI</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">SEN 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">SEL 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">RAB 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">KAM 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">JUM 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">SAB 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">MIN 00:00</span>
                  <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm animate-pulse" />
                </div>
              </div>
            ) : (
              (() => {
                const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                const dayLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
                return dayLabels.map((label, idx) => {
                  const dayName = days[idx];
                  const daySchedules = schedules.filter(s => s.active_days.includes(dayName));
                  const intervalSchedules = daySchedules.filter(s => s.schedule_type === 'Interval Tetap').sort((a, b) => a.feeding_time.localeCompare(b.feeding_time));
                  const aiSchedules = daySchedules.filter(s => s.schedule_type === 'Berbasis AI').sort((a, b) => a.feeding_time.localeCompare(b.feeding_time));

                  return (
                    <div key={label} className="flex items-center gap-4">
                      <span className="w-20 text-xs font-mono-code font-semibold text-slate-600 shrink-0">{label} 00:00</span>
                      <div className="flex-1 h-9 bg-slate-100/90 border border-slate-200/80 rounded-sm relative overflow-hidden flex items-center">
                        {intervalSchedules.length === 0 && aiSchedules.length === 0 && (
                          <span className="text-[10px] text-slate-400 font-mono-code absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Tidak ada jadwal</span>
                        )}
                        {intervalSchedules.map((sched, i) => (
                          <div
                            key={`interval-${sched.id}`}
                            className="absolute h-full bg-sky-200 border-x border-sky-300 flex items-center justify-center text-[10px] text-sky-700 font-mono-code font-semibold px-1"
                            style={{
                              left: `${i * 25}%`,
                              width: '20%'
                            }}
                            title={`Interval Tetap: ${sched.feeding_time}`}
                          >
                            {sched.feeding_time.slice(0, 5)}
                          </div>
                        ))}
                        {aiSchedules.map((sched, i) => (
                          <div
                            key={`ai-${sched.id}`}
                            className="absolute h-full border-2 border-dashed border-sky-400 bg-sky-50/70 flex items-center justify-center text-[10px] text-sky-600 font-mono-code font-semibold px-2"
                            style={{
                              left: `${intervalSchedules.length * 25 + i * 25}%`,
                              width: '20%'
                            }}
                            title={`Jendela AI: ${sched.feeding_time}`}
                          >
                            AI
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              PROTOKOL AKTIF
            </h2>

            {loading && (
              <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono-code">Memuat jadwal...</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center py-6 gap-2">
                <p className="text-xs text-red-600 font-mono-code">Gagal memuat</p>
                <button onClick={fetchSchedules} className="text-xs text-sky-600 font-mono-code font-bold hover:underline cursor-pointer">
                  Coba Lagi
                </button>
              </div>
            )}

            {!loading && !error && schedules.length === 0 && (
              <div className="flex flex-col items-center py-6 gap-2">
                <p className="text-xs text-slate-500 font-mono-code">Belum ada jadwal</p>
                <p className="text-[10px] text-slate-400 font-mono-code">Klik &quot;Jadwal Baru&quot; untuk menambahkan.</p>
              </div>
            )}

            {!loading && !error && schedules.length > 0 && (
              <div className="overflow-hidden">
                <table className="w-full text-left text-xs font-mono-code">
<thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">TIPE</th>
                  <th className="pb-2 text-right">STATUS</th>
                  <th className="pb-2 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sched) => (
                  <tr key={sched.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">
                      {sched.schedule_code}
                    </td>
                    <td className={`py-3 ${sched.schedule_type === 'Berbasis AI' ? 'text-[#0ea5e9] font-medium' : 'text-slate-700'}`}>
                      {sched.schedule_type}
                    </td>
                    <td className="py-3 text-right">
                      {sched.is_active ? (
                        <span className="inline-block bg-[#0ea5e9] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider">
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider">
                          SIAGA
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(sched);
                          }}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-colors cursor-pointer"
                          title="Edit jadwal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sched);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                          title="Hapus jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              PARAMETER CEPAT
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 tracking-wider uppercase font-mono-code block">
                  DURASI (DETIK)
                </label>
                <input
                  type="text"
                  id="input-param-durasi"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm py-2 px-3 text-lg font-mono-code font-bold text-slate-900 shadow-2xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 tracking-wider uppercase font-mono-code block">
                  INTENSITAS (%)
                </label>
                <input
                  type="text"
                  id="input-param-intensitas"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm py-2 px-3 text-lg font-mono-code font-bold text-slate-900 shadow-2xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EditScheduleModal
      isOpen={isEditModalOpen}
      onClose={handleEditClose}
      onScheduleUpdated={handleEditSuccess}
      schedule={editSchedule}
    />
    </>
  );
};
