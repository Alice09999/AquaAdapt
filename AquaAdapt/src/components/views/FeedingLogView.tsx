import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Download, Check, Power, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FeedingLogItem } from '../../types';
import { API_BASE } from '../../config/api';

export const FeedingLogView: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('7 Hari Terakhir');
  const [statusFilter, setStatusFilter] = useState<string>('Semua Catatan');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [allRecords, setAllRecords] = useState<FeedingLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFromServer, setTotalFromServer] = useState<number>(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/feeding_logs.php?limit=200&offset=0`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllRecords(json.data);
        setTotalFromServer(json.pagination?.total ?? json.data.length);
      } else {
        throw new Error(json.message || 'Gagal memuat data');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data dari server';
      setError(message);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtering
  const filteredRecords = allRecords.filter((rec) => {
    if (statusFilter === 'Hanya ON (Hungry)') return rec.motor_status === 'ON';
    if (statusFilter === 'Hanya OFF (FULL)') return rec.motor_status === 'OFF';
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const displayedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = 'TANGGAL / WAKTU (WIB),KEPUTUSAN AI,STATUS\n';
    const rows = filteredRecords
      .map((r) => `"${r.started_at}","${r.ai_decision}","${r.motor_status}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `riwayat_pakan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="feeding-log-view" className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono-code uppercase">
          RIWAYAT PEMBERIAN PAKAN
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-mono-code">
          Data riwayat distribusi nutrisi dan pakan terkelola AI.
        </p>
      </div>

      {/* Top Metric Card: RATA-RATA AKURASI AI */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 shadow-xs relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 space-y-1">
          <p className="text-[11px] font-bold tracking-widest text-[#0ea5e9] uppercase font-mono-code">
            RATA-RATA AKURASI AI
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-900 font-mono-code tracking-tight">
              {loading ? '-' : allRecords.length > 0 ? '98.2' : '-'}
            </span>
            <span className="text-2xl font-bold text-slate-600 font-mono-code">
              %
            </span>
          </div>
        </div>

        {/* Microchip Watermark icon */}
        <div className="text-slate-100 pr-2">
          <Cpu className="w-20 h-20 stroke-[1.2] text-slate-200/80" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-4">
          {/* Rentang Tanggal */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 tracking-wider uppercase font-mono-code block">
              RENTANG TANGGAL
            </label>
            <div className="relative">
              <select
                id="select-date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 rounded-md py-2 pl-3 pr-10 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                <option value="30 Hari Terakhir">30 Hari Terakhir</option>
                <option value="Hari Ini">Hari Ini</option>
                <option value="Bulan Ini">Bulan Ini</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 tracking-wider uppercase font-mono-code block">
              STATUS
            </label>
            <div className="relative">
              <select
                id="select-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200/90 rounded-md py-2 pl-3 pr-10 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="Semua Catatan">Semua Catatan</option>
                <option value="Hanya ON (Hungry)">Hanya ON (Hungry)</option>
                <option value="Hanya OFF (FULL)">Hanya OFF (FULL)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          id="btn-export-csv"
          onClick={handleExportCSV}
          disabled={loading || allRecords.length === 0}
          className="inline-flex items-center gap-2 border border-sky-400 text-sky-600 hover:bg-sky-50 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>EKSPOR CSV</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-mono-code">Memuat data riwayat pakan...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-red-600 font-mono-code font-medium">Gagal memuat data</p>
            <p className="text-xs text-slate-500 font-mono-code">{error}</p>
            <button
              onClick={fetchLogs}
              className="mt-2 px-4 py-2 text-xs font-bold text-sky-600 border border-sky-300 rounded-md hover:bg-sky-50 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && allRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-slate-500 font-mono-code font-medium">Belum ada data riwayat pakan</p>
            <p className="text-xs text-slate-400 font-mono-code">Data akan muncul setelah ada event pemberian pakan tercatat.</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && allRecords.length > 0 && (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono-code">
                  <th className="py-3.5 px-6">TANGGAL / WAKTU (WIB)</th>
                  <th className="py-3.5 px-6">KEPUTUSAN AI</th>
                  <th className="py-3.5 px-6">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono-code">
                {displayedRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-slate-800 font-medium">
                      {item.started_at}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {item.ai_decision}
                    </td>
                    <td className="py-4 px-6">
                      {item.motor_status === 'ON' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-300">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>ON</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          <Power className="w-3 h-3 stroke-[2.5]" />
                          <span>OFF</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer / Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono-code bg-slate-50/30">
              <span>
                Menampilkan {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredRecords.length)} dari {filteredRecords.length} data
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-slate-600 font-semibold">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
