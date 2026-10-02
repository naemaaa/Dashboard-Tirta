// Tab 7: Early Warning System (EWS) Arus dan Harga Pangan DIY
// Bank Indonesia KPw DIY · TPID DIY · PSEKUIN UPN Veteran Yogyakarta
//
// ✅ ARSITEKTUR: Tab ini 100% INDEPENDEN dari useCalculations dan global filters.
//    Data dibaca langsung dari useDashboardStore.ewsDatabase dan dihitung sendiri.
//    Tidak ada cross-filtering dengan Tab 1-6.

import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { calculateEwsMetrics } from '../../calculations/ewsCalculations';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Landmark,
  SlidersHorizontal,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const ALPS_COLOR = {
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-700',    dot: '#F04438', border: 'border-l-[#F04438]' },
  WARNING:  { bg: 'bg-orange-100', text: 'text-orange-700', dot: '#F97316', border: 'border-l-[#F97316]' },
  WATCH:    { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: '#F59E0B', border: 'border-l-[#F59E0B]' },
  NORMAL:   { bg: 'bg-emerald-100',text: 'text-emerald-700',dot: '#059669', border: 'border-l-[#12B76A]' },
};

function pct(v, decimals = 2) {
  const n = Number(v) || 0;
  return n > 0 ? `+${n.toFixed(decimals)}%` : `${n.toFixed(decimals)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIPS
// ─────────────────────────────────────────────────────────────────────────────
function RiskTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = ALPS_COLOR[d.alps] || ALPS_COLOR.NORMAL;
  return (
    <div className="bg-[#071D3D] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1 max-w-[200px]">
      <p className="font-bold text-[#C89B3C] border-b border-white/10 pb-1 truncate">{d.komoditas}</p>
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[#DCEAFA]/80">ALPS:</span>
        <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${c.bg} ${c.text}`}>{d.alps}</span>
      </div>
      <p className="text-white/80">Current: <strong>{pct(d.current_pressure * 100, 1)}</strong></p>
      <p className="text-white/80">Forecast: <strong>{pct(d.forecast_pressure * 100, 1)}</strong></p>
    </div>
  );
}

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#071D3D] text-white p-3 rounded-xl shadow-2xl text-xs border border-white/20 min-w-[210px]">
      <p className="font-bold text-[#C89B3C] mb-2 pb-1 border-b border-white/15 text-xs">{label}</p>
      <div className="space-y-1.5">
        {payload.map(p => {
          const dotColor = p.color === '#0A2E5C' ? '#60A5FA' : p.color;
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30" style={{ backgroundColor: dotColor }} />
                <span className="text-white font-medium text-xs">{p.name}:</span>
              </span>
              <strong className="font-mono text-white text-xs font-bold">
                Rp {Number(p.value || 0).toLocaleString('id-ID')}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function Tab7EarlyWarningSystem() {
  // ── Baca LANGSUNG dari store (BUKAN dari useCalculations) ──────────────────
  const {
    ewsDatabase,
    ewsSyncTime,
    ewsSyncSource,
    setDataModalOpen,
    activeTab,
    refreshEwsData,
    isLoading,
  } = useDashboardStore();

  // ── Local EWS Slicers — TIDAK terhubung ke filter global ──────────────────
  const [ewsKomoditas, setEwsKomoditas] = useState('All');
  const [ewsTipeResponden, setEwsTipeResponden] = useState('All');

  // ── Hitung EWS Metrics LANGSUNG di sini, tanpa lewat useCalculations ───────
  const ewsMetrics = useMemo(() => {
    return calculateEwsMetrics(ewsDatabase, ewsKomoditas, ewsTipeResponden);
  }, [ewsDatabase, ewsKomoditas, ewsTipeResponden]);

  const {
    normalCount   = 0,
    watchCount    = 0,
    warningCount  = 0,
    criticalCount = 0,
    overallStatus = 'NORMAL',
    mostCriticalName = '-',
    heatmapData   = [],
    timeSeriesData = [],
    forecastData  = [],
  } = ewsMetrics;

  // ── Daftar komoditas dinamis dari data ────────────────────────────────────
  const komoditasList = useMemo(() => {
    const all = [...new Set(heatmapData.map(r => r.komoditas))].filter(Boolean);
    return all.length > 0 ? all : [
      'Bawang Merah Ukuran Sedang', 'Beras Kualitas Bawah I',
      'Beras Kualitas Medium I',    'Beras Kualitas Super I',
      'Cabai Merah Besar',          'Cabai Merah Keriting',
      'Cabai Rawit Hijau',          'Cabai Rawit Merah',
      'Daging Sapi Kualitas 1',     'Daging Ayam Ras',
      'Telur Ayam Ras',             'Bawang Putih Honan',
    ];
  }, [heatmapData]);

  const statusBg = overallStatus === 'CRITICAL' ? 'bg-red-500'
    : overallStatus === 'WARNING' ? 'bg-orange-500'
    : overallStatus === 'WATCH'   ? 'bg-amber-500'
    : 'bg-emerald-500';

  const isUsingDefault = !ewsDatabase;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="bg-[#0A2E5C] text-white rounded-2xl px-5 py-3 shadow-md border border-[#071D3D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#C89B3C] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white m-0 leading-tight">
              EARLY WARNING SYSTEM ARUS DAN HARGA PANGAN DIY
            </h1>
            <p className="text-[10px] text-[#B3D4F2] mt-0.5">
              {ewsSyncSource || 'Default Seed EWS Database'}
              {ewsSyncTime && ` · Synced: ${ewsSyncTime}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshEwsData(ONEDRIVE_EWS_URL)}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-[#C89B3C]/20 hover:bg-[#C89B3C]/30 border border-[#C89B3C]/40 text-[#C89B3C] text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            title="Sinkronkan data EWS dari server"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Mengunduh...' : 'Refresh EWS'}</span>
          </button>
          <span className="text-[10px] font-bold text-[#C89B3C] bg-white/10 px-3 py-1 rounded-full border border-[#C89B3C]/40 hidden sm:inline-block">
            BI TPID Early Warning Engine
          </span>
        </div>
      </div>

      {/* ── KPI Cards Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

        {/* Normal */}
        <div className="clean-card p-3 bg-white border-l-4 border-l-[#12B76A] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#667085] block">Jumlah Normal</span>
            <span className="text-2xl font-black text-[#101828] tabular-nums">{normalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#12B76A] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 fill-[#12B76A]" />
          </div>
        </div>

        {/* Watch */}
        <div className="clean-card p-3 bg-white border-l-4 border-l-[#F59E0B] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#667085] block">Watch</span>
            <span className="text-2xl font-black text-[#101828] tabular-nums">{watchCount}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 fill-[#F59E0B]" />
          </div>
        </div>

        {/* Warning */}
        <div className="clean-card p-3 bg-white border-l-4 border-l-[#F97316] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#667085] block">Warning</span>
            <span className="text-2xl font-black text-[#101828] tabular-nums">{warningCount}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#FFEDD5] text-[#F97316] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 fill-[#F97316]" />
          </div>
        </div>

        {/* Critical */}
        <div className="clean-card p-3 bg-white border-l-4 border-l-[#F04438] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#667085] block">Critical</span>
            <span className="text-2xl font-black text-[#F04438] tabular-nums">{criticalCount}</span>
          </div>
          <div className={`w-9 h-9 rounded-full bg-[#FEE4E2] text-[#F04438] flex items-center justify-center shrink-0 ${criticalCount > 0 ? 'animate-pulse' : ''}`}>
            <AlertOctagon className="w-4 h-4 fill-[#F04438]" />
          </div>
        </div>

        {/* Status EWS DIY */}
        <div className="clean-card p-3 bg-white border border-[#E2E8F0] flex flex-col justify-center items-center text-center gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-[#667085]">Status EWS DIY</span>
          <div className={`w-full py-1.5 rounded-xl ${statusBg} text-white font-black text-xs tracking-wider uppercase shadow-sm`}>
            {overallStatus}
          </div>
        </div>

        {/* Komoditas Paling Kritis */}
        <div className="clean-card p-3 bg-white border border-[#E2E8F0] flex flex-col justify-center items-center text-center gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-[#C53030]">Komoditas Paling Kritis</span>
          <div className="w-full py-1.5 px-2 rounded-xl bg-[#F97316] text-white font-bold text-[11px] truncate shadow-sm" title={mostCriticalName}>
            {mostCriticalName}
          </div>
        </div>

      </div>

      {/* Executive Intelligence AI Box for EWS */}
      <ExecutiveIntelligenceBox tabId="tab7" title="Executive Intelligence · Early Warning System & Risk Analytics" />

      {/* ── Middle Grid: Slicers | Heatmap Table | Risk Map ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left: Independent EWS Slicers */}
        <div className="lg:col-span-3 clean-card p-4 bg-white space-y-4 border border-[#E2E8F0]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E4E7EC]">
            <SlidersHorizontal className="w-4 h-4 text-[#0D3E77]" />
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Filter EWS</h3>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#344054] mb-1.5">Komoditas</label>
            <select
              value={ewsKomoditas}
              onChange={e => setEwsKomoditas(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D0D5DD] focus:border-[#1E74C7] text-xs font-medium text-[#101828] rounded-xl px-3 py-2 outline-none"
            >
              <option value="All">All</option>
              {komoditasList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#344054] mb-1.5">Tipe Responden</label>
            <select
              value={ewsTipeResponden}
              onChange={e => setEwsTipeResponden(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D0D5DD] focus:border-[#1E74C7] text-xs font-medium text-[#101828] rounded-xl px-3 py-2 outline-none"
            >
              <option value="All">All</option>
              <option value="PB">Pedagang Besar (PB)</option>
              <option value="PE">Pedagang Eceran (PE)</option>
              <option value="PROD">Produsen (PROD)</option>
            </select>
          </div>

          <div className="pt-1 text-[10px] text-[#0D3E77] leading-relaxed bg-[#F2F7FD] p-2.5 rounded-xl border border-[#B3D4F2] space-y-1">
            <p className="font-bold">💡 Prinsip Riset (Worst-Case Aggregation):</p>
            <p className="text-[#344054]">
              Pada mode <strong>All</strong>, sistem mengambil risiko tertinggi (terburuk) di antara PB, PE, dan PROD. Komoditas yang tampak normal di produsen namun tertekan di pedagang besar akan diangkat ke status pengawasan, sehingga jumlah <em>Normal</em> pada All secara logis lebih sedikit.
            </p>
          </div>

          {/* Data Source Info */}
          <div className="pt-1 text-[10px] leading-relaxed bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#344054]">
              <Database className="w-3 h-3 text-[#0D3E77]" />
              <span>Database 2 (EWS)</span>
            </div>
            <p className="text-[#667085]">
              {isUsingDefault
                ? '⚠️ Menggunakan seed data default. Muat file EWS Excel untuk data aktual.'
                : `✅ Database aktif: ${heatmapData.length} komoditas.`}
            </p>
          </div>
        </div>

        {/* Middle: Heatmap Table */}
        <div className="lg:col-span-5 clean-card p-4 bg-white flex flex-col border border-[#E2E8F0]">
          <h3 className="text-xs font-bold text-[#101828] tracking-tight pb-2 border-b border-[#E4E7EC] text-center mb-2">
            Early Warning System Harga Komoditas di DIY
          </h3>

          {heatmapData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#667085] text-xs">
              Tidak ada data EWS yang tersedia.
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E7EC] text-[10px] font-bold text-[#475467] bg-[#F8FAFC] sticky top-0">
                    <th className="py-2 px-2">Komoditas</th>
                    <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PB' ? 'bg-[#DCEAFA] text-[#0D3E77] font-extrabold' : ''}`}>Heatmap_PB</th>
                    <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PE' ? 'bg-[#DCEAFA] text-[#0D3E77] font-extrabold' : ''}`}>Heatmap_PE</th>
                    <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PROD' ? 'bg-[#FFEDD5] text-[#EA580C] font-extrabold' : ''}`}>Heatmap_PROD</th>
                    <th className="py-2 px-2 text-center">ALPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[11px]">
                  {heatmapData.map((row, idx) => {
                    const c = ALPS_COLOR[row.alps] || ALPS_COLOR.NORMAL;
                    return (
                      <tr key={row.id || idx} className={`hover:bg-[#F8FAFC] border-l-2 ${c.border}`}>
                        <td className="py-2 px-2 text-[#101828] font-medium text-[10px] max-w-[120px] truncate" title={row.komoditas}>
                          {row.komoditas}
                        </td>
                        <td className={`py-2 px-2 text-right font-mono ${ewsTipeResponden === 'PB' ? 'bg-blue-50/80 font-bold text-[#0D3E77]' : ''} ${row.heatmap_pb > 15 ? 'text-[#F04438]' : row.heatmap_pb > 0 ? 'text-[#D97706]' : 'text-[#344054]'}`}>
                          {pct(row.heatmap_pb)}
                        </td>
                        <td className={`py-2 px-2 text-right font-mono ${ewsTipeResponden === 'PE' ? 'bg-blue-50/80 font-bold text-[#0D3E77]' : ''} ${row.heatmap_pe > 15 ? 'text-[#F04438]' : row.heatmap_pe > 0 ? 'text-[#D97706]' : 'text-[#344054]'}`}>
                          {pct(row.heatmap_pe, 0)}
                        </td>
                        <td className={`py-2 px-2 text-right font-mono ${ewsTipeResponden === 'PROD' ? 'bg-orange-50/80 font-bold text-[#EA580C]' : ''} ${row.heatmap_prod > 15 ? 'text-[#F04438]' : row.heatmap_prod > 0 ? 'text-[#D97706]' : 'text-[#344054]'}`}>
                          {pct(row.heatmap_prod, 0)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.bg} ${c.text}`}>
                            {row.alps}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Risk Map Scatter */}
        <div className="lg:col-span-4 clean-card p-4 bg-white flex flex-col border border-[#E2E8F0]">
          <h3 className="text-xs font-bold text-[#101828] tracking-tight pb-2 border-b border-[#E4E7EC] text-center mb-2">
            Early Warning System Risk Map
          </h3>

          <div className="w-full flex-1" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="forecast_pressure"
                  name="Forecast Pressure"
                  domain={[-0.5, 0.5]}
                  tick={{ fontSize: 9, fill: '#64748B' }}
                  label={{ value: 'Forecast Pressure', position: 'bottom', offset: 10, fontSize: 10, fill: '#475467' }}
                />
                <YAxis
                  type="number"
                  dataKey="current_pressure"
                  name="Current Price Pressure"
                  domain={[-0.5, 0.5]}
                  tick={{ fontSize: 9, fill: '#64748B' }}
                  label={{ value: 'Current Price Pressure', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475467', dx: -5 }}
                />
                <ReferenceLine x={0} stroke="#94A3B8" strokeDasharray="4 4" />
                <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="4 4" />
                <Tooltip content={<RiskTooltip />} />
                {heatmapData.map((entry, i) => (
                  <Scatter
                    key={entry.id || i}
                    name={entry.komoditas}
                    data={[entry]}
                    fill={ALPS_COLOR[entry.alps]?.dot || '#1E74C7'}
                    r={6}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#E4E7EC] flex items-center flex-wrap gap-x-3 gap-y-1 text-[9px] text-[#667085]">
            {Object.entries(ALPS_COLOR).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: v.dot }} />
                {k}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Grid: Time Series | Forecast ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Time Series */}
        <div className="lg:col-span-6 clean-card p-4 bg-white flex flex-col border border-[#E2E8F0]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC] mb-2">
            <h3 className="text-xs font-bold text-[#101828] tracking-tight">
              Perkembangan Harga Tingkat Produsen dan Pedagang Besar
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-semibold shrink-0">
              <span className="flex items-center gap-1 text-[#1E74C7]"><span className="w-2 h-2 rounded-full bg-[#1E74C7]" /> PB</span>
              <span className="flex items-center gap-1 text-[#0A2E5C]"><span className="w-2 h-2 rounded-full bg-[#0A2E5C]" /> PE</span>
              <span className="flex items-center gap-1 text-[#EA580C]"><span className="w-2 h-2 rounded-full bg-[#EA580C]" /> PROD</span>
            </div>
          </div>

          {timeSeriesData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#667085] text-xs" style={{ minHeight: 200 }}>
              Tidak ada data time series EWS.
            </div>
          ) : (
            <div className="w-full" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 15, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: '#64748B' }}
                    interval={5}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#64748B' }}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                    domain={[0, 'auto']}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <Line
                    type="monotoneX"
                    dataKey="PB"
                    stroke="#1E74C7"
                    strokeWidth={ewsTipeResponden === 'PB' ? 3.2 : ewsTipeResponden === 'All' ? 1.8 : 1}
                    strokeOpacity={ewsTipeResponden === 'All' || ewsTipeResponden === 'PB' ? 1 : 0.25}
                    dot={false}
                    name="Pedagang Besar (PB)"
                  />
                  <Line
                    type="monotoneX"
                    dataKey="PE"
                    stroke="#0A2E5C"
                    strokeWidth={ewsTipeResponden === 'PE' ? 3.2 : ewsTipeResponden === 'All' ? 1.8 : 1}
                    strokeOpacity={ewsTipeResponden === 'All' || ewsTipeResponden === 'PE' ? 1 : 0.25}
                    dot={false}
                    name="Pedagang Eceran (PE)"
                  />
                  <Line
                    type="monotoneX"
                    dataKey="PROD"
                    stroke="#EA580C"
                    strokeWidth={ewsTipeResponden === 'PROD' ? 3.2 : ewsTipeResponden === 'All' ? 1.8 : 1}
                    strokeOpacity={ewsTipeResponden === 'All' || ewsTipeResponden === 'PROD' ? 1 : 0.25}
                    dot={false}
                    name="Produsen (PROD)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Forecast Chart */}
        <div className="lg:col-span-6 clean-card p-4 bg-white flex flex-col border border-[#E2E8F0]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC] mb-2">
            <h3 className="text-xs font-bold text-[#101828] tracking-tight">
              Proyeksi Tren Harga Komoditas
            </h3>
            <span className="text-[10px] font-bold text-[#1E74C7] bg-[#EFF8FF] px-2 py-0.5 rounded border border-[#B2DDFF] shrink-0">
              95% Confidence Band
            </span>
          </div>

          {forecastData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#667085] text-xs" style={{ minHeight: 200 }}>
              Tidak ada data proyeksi EWS.
            </div>
          ) : (
            <div className="w-full" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 5, right: 15, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: '#64748B' }}
                    interval={5}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#64748B' }}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                    domain={[0, 'auto']}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val, name) => val ? [`Rp ${Number(val).toLocaleString('id-ID')}`, name] : ['-', name]}
                    contentStyle={{ backgroundColor: '#071D3D', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#C89B3C', fontWeight: 'bold' }}
                  />
                  <Area type="monotoneX" dataKey="upperBound" stroke="none" fill="#94A3B8" fillOpacity={0.35} name="Batas Atas CI 95%" />
                  <Area type="monotoneX" dataKey="lowerBound" stroke="none" fill="#FFFFFF" fillOpacity={1} name="Batas Bawah CI 95%" />
                  <Line type="monotoneX" dataKey="actual"   stroke="#1E74C7" strokeWidth={2} dot={false} name="Harga Realisasi" />
                  <Line type="monotoneX" dataKey="forecast" stroke="#374151" strokeWidth={1.8} strokeDasharray="5 3" dot={false} name="Proyeksi" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
