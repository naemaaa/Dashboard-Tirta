// Tab 5: Kualitas Data dan Monitoring Konsistensi Data
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER, REF_KLASTER_RESPONDEN } from '../../data/seedData';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  Sigma,
  Trash2,
  Tag,
  AlertTriangle,
  Calendar,
  Globe,
  Check,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

export function Tab5KualitasData() {
  const calculations = useCalculations();
  const {
    selectedPeriode,
    setSelectedPeriode,
    selectedKomoditas,
    setSelectedKomoditas,
    selectedWilayah,
    setSelectedWilayah,
    selectedKlaster,
    setSelectedKlaster
  } = useDashboardStore();

  const {
    qualityMetrics,
    qualitySummaryTable,
    qualityByRegion,
    qualityByCommodity,
    qualityIssues
  } = calculations;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
      
      {/* 1. LEFT SIDEBAR: 4 Vertical Stacked Slicers */}
      <div className="lg:col-span-2 space-y-2.5">
        <div className="clean-card p-3 bg-white">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5 uppercase tracking-wider pb-1.5 border-b border-slate-100">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Data</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Periode</label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua">All</option>
                {REF_KALENDER.map((k) => (
                  <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Komoditas</label>
              <select
                value={selectedKomoditas}
                onChange={(e) => setSelectedKomoditas(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua">All</option>
                {REF_KOMODITAS.map(k => (
                  <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kabupaten</label>
              <select
                value={selectedWilayah}
                onChange={(e) => setSelectedWilayah(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua Wilayah DIY">All</option>
                {REF_WILAYAH.map(w => (
                  <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Responden</label>
              <select
                value={selectedKlaster}
                onChange={(e) => setSelectedKlaster(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="semua">All</option>
                {REF_KLASTER_RESPONDEN.map(kl => (
                  <option key={kl.id} value={kl.id}>{kl.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Right 10 Columns) */}
      <div className="lg:col-span-10 space-y-3">
        
        {/* Top: 6 Quality KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sigma className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Record Aktif</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.activeRecords}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Trash2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Record Hapus</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.deletedRecords}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Harga Kosong</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.missingPriceCount}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Anomali Satuan</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.unitAnomalyCount}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Periode Kosong</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.missingPeriodCount}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Wilayah Non-Std</div>
              <div className="text-base font-extrabold text-slate-900">{qualityMetrics.invalidRegionCount}</div>
            </div>
          </div>

        </div>

        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab5" title="Executive Intelligence · Audit & Tata Kelola Kualitas Data" />

        {/* Middle Row (3 Panels): Ringkasan Isu | Jumlah Isu per Jenis | Kelengkapan per Kab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Panel 1: Ringkasan Isu Kualitas Data Table */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ringkasan Isu Kualitas Data
                </h3>
                <span className="text-[10px] text-slate-400">Audit</span>
              </div>
              <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-48">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5">Jenis Isu</th>
                      <th className="px-2 py-1.5 text-right">Jumlah Record</th>
                      <th className="px-2 py-1.5 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {qualitySummaryTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2 py-1.5 text-slate-800 font-medium">{row.isu}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-slate-600">{row.count}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-slate-900 font-bold">{row.pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel 2: Jumlah Isu per Jenis (Horizontal Bar Chart) */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Jumlah Isu per Jenis
                </h3>
                <span className="text-[10px] text-slate-400">Distribusi</span>
              </div>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={qualitySummaryTable.slice(0, 4)} margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="isu" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Panel 3: Kelengkapan Data per Kabupaten/Kota */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kelengkapan per Kab/Kota
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">100% Target</span>
              </div>
              <div className="h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={qualityByRegion} margin={{ top: 5, right: 35, left: 45, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="wilayah" type="category" tick={{ fontSize: 9, fill: '#334155' }} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val) => [`${val}%`, 'Kelengkapan']}
                    />
                    <Bar dataKey="kelengkapan" fill="#059669" radius={[0, 3, 3, 0]} label={{ position: 'right', fill: '#047857', fontSize: 9, fontWeight: 700, formatter: v => `${v.toFixed(0)}%` }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-100">
              <span>0% Target</span>
              <span>100% Valid</span>
            </div>
          </div>

        </div>

        {/* Bottom Row (3 Panels): Kelengkapan per Komoditas | Record Bermasalah | Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Kelengkapan Data per Komoditas */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kelengkapan per Komoditas
                </h3>
                <span className="text-[10px] text-slate-400">Coverage</span>
              </div>
              <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-48">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0">
                    <tr className="border-b border-slate-200">
                      <th className="px-2 py-1.5">Nama Komoditas</th>
                      <th className="px-2 py-1.5 text-right">Lengkap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {qualityByCommodity.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2 py-1 text-slate-800 font-medium">{row.komoditas.replace(' (Ton)', '')}</td>
                        <td className="px-2 py-1 text-right font-mono text-emerald-700 font-bold">{row.kelengkapan.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Center: Record Bermasalah Table */}
          <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Record Bermasalah
                </h3>
                <span className="text-[10px] text-slate-400">Log Anomali</span>
              </div>
              <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-48">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-1.5 py-1">Periode</th>
                      <th className="px-1.5 py-1">nama_responden</th>
                      <th className="px-1.5 py-1">Komoditas</th>
                      <th className="px-1.5 py-1">Kab/Kota</th>
                      <th className="px-1.5 py-1">Jenis Isu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {qualityIssues.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-1.5 py-1 text-slate-500 font-mono text-[9px]">{item.periode}</td>
                        <td className="px-1.5 py-1 font-medium text-slate-900 truncate max-w-[80px]">{item.nama_responden}</td>
                        <td className="px-1.5 py-1 text-slate-600 truncate max-w-[70px]">{item.komoditas}</td>
                        <td className="px-1.5 py-1 text-slate-600 truncate max-w-[70px]">{item.kab_kota.replace('Kab. ', '')}</td>
                        <td className="px-1.5 py-1">
                          <span className="text-[9px] text-rose-700 bg-rose-50 border border-rose-200/60 px-1 py-0.2 rounded font-bold">
                            {item.jenis_isu}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Checklist Rekomendasi / Protokol */}
          <div className="clean-card p-4 lg:col-span-3 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Protokol Tata Kelola
                </h3>
                <span className="text-[10px] text-slate-400">SOP</span>
              </div>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">Standarisasi satuan volumetrik (Ton) seluruh komoditas.</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">Validasi dan pencegahan harga kosong (Rp/Kg).</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">Harmonisasi nama dan kode wilayah standar BPS.</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">Audit kualitas dan sinkronisasi data mingguan.</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              BI KPw DIY &bull; PSEKUIN
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
