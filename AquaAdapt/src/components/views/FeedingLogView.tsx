import React, { useState } from 'react';
import { Cpu, Download, Check, Power, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeedingRecord } from '../../types';

export const FeedingLogView: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('7 Hari Terakhir');
  const [statusFilter, setStatusFilter] = useState<string>('Semua Catatan');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Feeding records
  const allRecords: FeedingRecord[] = [
    { id: '1', timestamp: '2023-10-27 17:00:00', aiDecision: 'Hungry', status: 'ON' },
    { id: '2', timestamp: '2023-10-27 07:00:00', aiDecision: 'FULL', status: 'OFF' },
    { id: '3', timestamp: '2023-10-26 17:00:00', aiDecision: 'Hungry', status: 'ON' },
    { id: '4', timestamp: '2023-10-26 07:00:00', aiDecision: 'FULL', status: 'OFF' },
    { id: '5', timestamp: '2023-10-25 17:00:00', aiDecision: 'Hungry', status: 'ON' },
    { id: '6', timestamp: '2023-10-25 07:00:00', aiDecision: 'FULL', status: 'OFF' },
    { id: '7', timestamp: '2023-10-24 17:00:00', aiDecision: 'Hungry', status: 'ON' },
    { id: '8', timestamp: '2023-10-24 07:00:00', aiDecision: 'FULL', status: 'OFF' },
    { id: '9', timestamp: '2023-10-23 17:00:00', aiDecision: 'Hungry', status: 'ON' },
    { id: '10', timestamp: '2023-10-23 07:00:00', aiDecision: 'FULL', status: 'OFF' },
  ];

  // Filtering
  const filteredRecords = allRecords.filter((rec) => {
    if (statusFilter === 'Hanya ON (Hungry)') return rec.status === 'ON';
    if (statusFilter === 'Hanya OFF (FULL)') return rec.status === 'OFF';
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const displayedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = 'TANGGAL / WAKTU (WIB),KEPUTUSAN AI,STATUS\n';
    const rows = filteredRecords
      .map((r) => `"${r.timestamp}","${r.aiDecision}","${r.status}"`)
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
              98.2
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
          className="inline-flex items-center gap-2 border border-sky-400 text-sky-600 hover:bg-sky-50 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>EKSPOR CSV</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
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
                  {item.timestamp}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-900">
                  {item.aiDecision}
                </td>
                <td className="py-4 px-6">
                  {item.status === 'ON' ? (
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
          <span>Menampilkan 1-{displayedRecords.length} dari 142 data</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
