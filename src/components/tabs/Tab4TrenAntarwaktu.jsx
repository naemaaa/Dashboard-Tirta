// Tab 4: Tren Antarwaktu dan Perubahan Periode
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER, REF_KLASTER_RESPONDEN } from '../../data/seedData';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  ArrowRightCircle,
  ArrowLeftCircle,
  Scale,
  Percent,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  RotateCcw
} from 'lucide-react';

export function Tab4TrenAntarwaktu() {
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
    resetFilters
  } = useDashboardStore();

  const {
    deltas,
    historicalTrends,
    tab4RegionalDeltas,
    tab4CommodityEvolution
  } = calculations;

  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = () => {
    setIsResetting(true);
    resetFilters();
    setTimeout(() => setIsResetting(false), 500);
  };

  const commColors = ['#2563eb', '#0284c7', '#d97706', '#ea580c', '#8b5cf6', '#059669'];

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Slicers Bar */}
      <div className="clean-card p-4 bg-white space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200/60">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Tren Antarwaktu & Perubahan Periode Komoditas DIY
                </h2>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200">
                  Analisis Longitudinal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluasi tren historis pasokan masuk, keluar, neraca kumulatif & dinamika harga antar-minggu
              </p>
            </div>
          </div>
        </div>

        {/* 5-Column Precision Slicer & Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Periode</label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Periode</option>
              {REF_KALENDER.map((k) => (
                <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Komoditas</label>
            <select
              value={selectedKomoditas}
              onChange={(e) => setSelectedKomoditas(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Komoditas</option>
              {REF_KOMODITAS.map(k => (
                <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Wilayah</label>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua Wilayah DIY">All Wilayah</option>
              {REF_WILAYAH.map(w => (
                <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Responden</label>
            <select
              value={selectedKlaster}
              onChange={(e) => setSelectedKlaster(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="semua">All Responden</option>
              {REF_KLASTER_RESPONDEN.map(kl => (
                <option key={kl.id} value={kl.id}>{kl.label}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleReset}
              className="w-full h-[38px] flex items-center justify-center gap-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Reset Semua Filter ke Nilai Default"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="space-y-3">
        
        {/* Top: 5 Delta KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ArrowRightCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perubahan Masuk</div>
              <div className="text-base font-extrabold text-slate-900">
                {deltas.volMasukDelta >= 0 ? '+' : ''}{deltas.volMasukDelta.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ArrowLeftCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perubahan Keluar</div>
              <div className="text-base font-extrabold text-slate-900">
                {deltas.volKeluarDelta >= 0 ? '+' : ''}{deltas.volKeluarDelta.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${deltas.neracaDelta >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perubahan Selisih</div>
              <div className={`text-base font-extrabold ${deltas.neracaDelta >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {deltas.neracaDelta >= 0 ? '+' : ''}{deltas.neracaDelta.toFixed(0)} Ton
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              Rp
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perubahan Harga</div>
              <div className="text-base font-extrabold text-slate-900">
                {deltas.hargaJualDelta >= 0 ? '+' : ''}{deltas.hargaJualDelta.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perubahan Margin</div>
              <div className="text-base font-extrabold text-slate-900">
                {deltas.marginDelta !== 0 ? `${deltas.marginDelta >= 0 ? '+' : ''}${deltas.marginDelta.toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab4" title="Executive Intelligence · Analisis Dinamika & Proyeksi Antarwaktu" />

        {/* Middle Row (3 Panels): Trend Volume | Trend Harga | Selisih Perkembangan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Panel 1: Trend Volume Arus Antar Waktu */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Trend Volume Arus
                </h3>
                <span className="text-[10px] text-slate-400">Ton</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                      formatter={(val, name) => [`${val} Ton`, name]}
                    />
                    <Line type="monotone" dataKey="volMasuk" name="Arus Masuk" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
                    <Line type="monotone" dataKey="volKeluar" name="Arus Keluar" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, fill: '#ea580c' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-3 text-[10px] font-medium text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Arus Masuk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Arus Keluar</span>
            </div>
          </div>

          {/* Panel 2: Trend Harga Antar Waktu */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Trend Harga Antar Waktu
                </h3>
                <span className="text-[10px] text-slate-400">Rp/kg</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                      formatter={(val, name) => [`Rp ${Number(val).toLocaleString('id-ID')}`, name]}
                    />
                    <Line type="monotone" dataKey="hargaJual" name="Harga Jual" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: '#059669' }} />
                    <Line type="monotone" dataKey="hargaBeli" name="Harga Beli" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3, fill: '#d97706' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-3 text-[10px] font-medium text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Harga Jual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600"></span> Harga Beli</span>
            </div>
          </div>

          {/* Panel 3: Selisih Perkembangan (Vertical Bar Chart) */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Selisih Perkembangan
                </h3>
                <span className="text-[10px] text-slate-400">Ton</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tab4RegionalDeltas} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="wilayah" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                      formatter={(val) => [`${val > 0 ? '+' : ''}${val} Ton`, 'Selisih']}
                    />
                    <Bar dataKey="deltaNet" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">Perkembangan per kabupaten</div>
          </div>

        </div>

        {/* Row 3 (2 Panels): Peringkat Komoditas Evolution & Perubahan Arus per Kab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Peringkat Komoditas Berdasarkan Volume dari Waktu ke Waktu */}
          <div className="clean-card p-4 lg:col-span-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Peringkat Komoditas Berdasarkan Volume Waktu ke Waktu
                </h3>
                <span className="text-[10px] text-slate-400">Stream</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tab4CommodityEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }} />
                    {Object.keys(tab4CommodityEvolution[0] || {})
                      .filter(k => k !== 'label')
                      .map((k, idx) => (
                        <Area key={k} type="monotone" dataKey={k} name={k} stackId="1" stroke={commColors[idx % commColors.length]} fill={commColors[idx % commColors.length]} fillOpacity={0.6} />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">Volume evolusi komoditas (Ton)</div>
          </div>

          {/* Right: Perubahan Arus per Kabupaten/Kota */}
          <div className="clean-card p-4 lg:col-span-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Perubahan Arus per Kabupaten/Kota
                </h3>
                <span className="text-[10px] text-slate-400">Clustered</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tab4RegionalDeltas} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="wilayah" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }} />
                    <Bar dataKey="arusMasuk" name="Arus Masuk" fill="#2563eb" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="arusKeluar" name="Arus Keluar" fill="#0f172a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-medium text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Arus Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Arus Keluar</span>
            </div>
          </div>

        </div>

        {/* Bottom Row: Ringkasan Perubahan Periode ke Periode Table */}
        <div className="clean-card p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ringkasan Perubahan Periode ke Periode
            </h3>
            <span className="text-[10px] text-slate-400">Historis</span>
          </div>
          <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-48">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-2.5 py-1.5">Periode</th>
                  <th className="px-2 py-1.5 text-right">Arus Masuk</th>
                  <th className="px-2 py-1.5 text-right">Arus Keluar</th>
                  <th className="px-2 py-1.5 text-right">Selisih Volume (Ton)</th>
                  <th className="px-2 py-1.5 text-right">Rata-Rata Harga Beli</th>
                  <th className="px-2 py-1.5 text-right">Rata-Rata Harga Jual</th>
                  <th className="px-2 py-1.5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {[...historicalTrends].reverse().map((row) => (
                  <tr key={row.id_periode} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2.5 py-1.5 text-slate-900 font-bold">{row.label}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600">{row.volMasuk}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600">{row.volKeluar}</td>
                    <td className={`px-2 py-1.5 text-right font-mono font-bold ${row.neraca > 0.1 ? 'text-emerald-700' : row.neraca < -0.1 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {row.neraca > 0 ? row.neraca : row.neraca < 0 ? `(${Math.abs(row.neraca)})` : '-'}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-700">Rp {row.hargaBeli.toLocaleString('id-ID')}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-700">Rp {row.hargaJual.toLocaleString('id-ID')}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600">{row.marginPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
