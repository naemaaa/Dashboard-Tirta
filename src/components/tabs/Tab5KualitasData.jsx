// Tab 5: Kualitas Data dan Monitoring Konsistensi Data
// Tim Pengendalian Inflasi Daerah DIY · Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER, REF_KLASTER_RESPONDEN } from '../../data/seedData';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { formatDecimal, formatPercent } from '../../utils/formatters';
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
    setSelectedKlaster,
    isRespondentUnlocked
  } = useDashboardStore();

  const {
    qualityMetrics = {},
    qualitySummaryTable = [],
    qualityByRegion = [],
    qualityByCommodity = [],
    qualityIssues = []
  } = calculations || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
      
      {/* 1. LEFT FILTER PANEL */}
      <div className="clean-card p-4 lg:col-span-3 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filter Monitoring</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Tab 5</span>
        </div>

        {/* Filter 1: Periode Slicer */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1E74C7]" />
            Periode Data:
          </label>
          <select
            value={Array.isArray(selectedPeriode) ? (selectedPeriode[0] || 'semua') : (selectedPeriode || 'semua')}
            onChange={(e) => setSelectedPeriode(e.target.value === 'semua' ? (REF_KALENDER[REF_KALENDER.length - 1]?.id_periode) : e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1E74C7] focus:ring-1 focus:ring-[#1E74C7]"
          >
            <option value="semua">Semua Periode</option>
            {REF_KALENDER.map(kal => (
              <option key={kal.id_periode} value={kal.id_periode}>
                {kal.nama_periode} ({kal.tgl_mulai})
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: Komoditas */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            Komoditas:
          </label>
          <select
            value={selectedKomoditas || 'semua'}
            onChange={(e) => setSelectedKomoditas(e.target.value === 'semua' ? 'Beras Medium I' : e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1E74C7] focus:ring-1 focus:ring-[#1E74C7]"
          >
            <option value="semua">Semua Komoditas (10 Utama)</option>
            {REF_KOMODITAS.map(k => (
              <option key={k.id_komoditas} value={k.nama_komoditas}>
                {k.nama_komoditas}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Kabupaten/Kota */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            Wilayah DIY:
          </label>
          <select
            value={selectedWilayah || 'Semua Wilayah DIY'}
            onChange={(e) => setSelectedWilayah(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1E74C7] focus:ring-1 focus:ring-[#1E74C7]"
          >
            <option value="Semua Wilayah DIY">Semua Wilayah DIY (5 Kab/Kota)</option>
            {REF_WILAYAH.map(w => (
              <option key={w.id_kab_kota} value={w.nama_kab_kota}>
                {w.nama_kab_kota}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Tipe Responden */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Klaster Responden:
          </label>
          <select
            value={selectedKlaster || 'semua'}
            onChange={(e) => setSelectedKlaster(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1E74C7] focus:ring-1 focus:ring-[#1E74C7]"
          >
            <option value="semua">Semua Klaster (PB & Produsen)</option>
            {REF_KLASTER_RESPONDEN.map(kl => (
              <option key={kl.id} value={kl.id}>
                {kl.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
          Filter ini mengisolasi evaluasi kelengkapan &amp; mendeteksi anomaly record dalam database.
        </div>
      </div>

      {/* 2. RIGHT DASHBOARD BODY */}
      <div className="lg:col-span-9 space-y-3">
        
        {/* Top: 4 Quality KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="clean-card p-3 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Record</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{qualityMetrics.totalRecords}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kelengkapan Data</div>
              <div className="text-base font-bold text-emerald-600 tabular-nums">
                {formatPercent(qualityMetrics.kelengkapanPercent, 2)}
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Terindikasi Anomali</div>
              <div className="text-base font-bold text-rose-600 tabular-nums">
                {qualityMetrics.anomaliCount} <span className="text-xs font-normal text-slate-400">({formatPercent(qualityMetrics.anomaliPercent, 2)})</span>
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 rounded-lg bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Entri Kosong</div>
              <div className="text-base font-bold text-[#0D3E77] tabular-nums">
                {qualityMetrics.emptyCount} <span className="text-xs font-normal text-slate-400">({formatPercent(qualityMetrics.emptyPercent, 2)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab5" title="Executive Intelligence · Diagnostic Quality Monitoring" />

        {/* Middle Section: Matriks Kelengkapan Data per Kab/Kota & Komoditas Table */}
        <div className="clean-card p-4 bg-white" id="table-tab5-quality">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matriks Kelengkapan & Consistensy Score (%) per Kab/Kota
              </h3>
              <p className="text-[10px] text-slate-500">
                Persentase pengisian laporan mingguan komoditas pangan utama
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl max-h-64">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 text-[10px] font-semibold sticky top-0">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2">Komoditas Pangan</th>
                  {REF_WILAYAH.map(w => (
                    <th key={w.id_kab_kota} className="px-2 py-2 text-center">{w.nama_kab_kota.replace('Kab. ', '')}</th>
                  ))}
                  <th className="px-2 py-2 text-right bg-slate-100 font-bold">Rata-rata DIY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                {qualitySummaryTable.map(row => (
                  <tr key={row.id_komoditas} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-1.5 font-medium text-slate-800 whitespace-nowrap">{row.komoditas.replace(' (Ton)', '')}</td>
                    {REF_WILAYAH.map(w => {
                      const score = row.wilayahScore[w.nama_kab_kota] || 0;
                      const isHigh = score >= 90;
                      const isMid = score >= 75 && score < 90;
                      return (
                        <td key={w.id_kab_kota} className="px-2 py-1.5 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isHigh ? 'bg-emerald-50 text-emerald-700' : isMid ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {formatPercent(score, 2)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                      {formatPercent(row.avgScore, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[10px] text-slate-400 text-center pt-2 mt-1 border-t border-slate-100">
            Skor 100% menandakan seluruh record responden terisi valid tanpa missing value
          </div>
        </div>

        {/* Bottom Section: 3 Quality Detail Cards (By Region, By Commodity, Issues Log) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Kelengkapan per Kab/Kota Chart */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between" id="chart-tab5-region">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kelengkapan per Kab/Kota
                </h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qualityByRegion} layout="vertical" margin={{ top: 0, right: 15, left: 35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={(val) => `${formatDecimal(val, 2)}%`} />
                    <YAxis type="category" dataKey="wilayah" tick={{ fontSize: 9, fill: '#64748B' }} width={55} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val) => [`${formatPercent(val, 2)}`, 'Kelengkapan']}
                    />
                    <Bar dataKey="kelengkapan" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Center: Kelengkapan per Komoditas Table */}
          <div className="clean-card p-4 lg:col-span-3 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  per Komoditas
                </h3>
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
                        <td className="px-2 py-1 text-right font-mono text-emerald-700 font-bold">{formatPercent(row.kelengkapan, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Record Bermasalah Table (RESPECTS 1 CREDENTIAL UNLOCK STATE) */}
          <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Record Bermasalah
                </h3>
              </div>
              <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-48">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-1.5 py-1">Periode</th>
                      <th className="px-1.5 py-1">Nama Responden</th>
                      <th className="px-1.5 py-1">Komoditas</th>
                      <th className="px-1.5 py-1">Kab/Kota</th>
                      <th className="px-1.5 py-1">Jenis Isu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {qualityIssues.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-1.5 py-1 text-slate-500 font-mono text-[9px]">{item.periode}</td>
                        <td className="px-1.5 py-1 font-medium text-slate-900 truncate max-w-[80px]">
                          {isRespondentUnlocked ? item.nama_responden : `Responden #${idx + 1}`}
                        </td>
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

        </div>

      </div>

    </div>
  );
}
