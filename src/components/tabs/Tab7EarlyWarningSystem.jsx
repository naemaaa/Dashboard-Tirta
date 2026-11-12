// Tab 7: Early Warning System (EWS) Arus dan Harga Pangan DIY
// Bank Indonesia KPw DIY · TPID DIY · PSEKUIN UPN Veteran Yogyakarta
//
// ✅ ARSITEKTUR: Tab ini 100% INDEPENDEN dari useCalculations dan global filters.
//    Memiliki 2 Sub-Tab dengan 2 sumber OneDrive terpisah:
//      - Sub-Tab 1 (Lama): Early Warning System (ALPS PIHPS 2019–2026)
//        Sumber: Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx (Link 1)
//      - Sub-Tab 2 (Baru): Hubungan Harga PIHPS & Arus Perdagangan (Mingguan 2026)
//        Sumber: Dashboard Hubungan Harga dan Arus Perdagangan.xlsx (Link 2)

import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { calculateEwsMetrics } from '../../calculations/ewsCalculations';
import { ONEDRIVE_EWS_URL, ONEDRIVE_HARGA_ARUS_URL } from '../../config/env';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Landmark,
  SlidersHorizontal,
  RefreshCw,
  Database,
  Table2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info
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
  ComposedChart,
  Bar
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

function fmtRp(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
  return `Rp ${Math.round(Number(v)).toLocaleString('id-ID')}`;
}

function fmtNum(v, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
  return Number(v).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatShortDate(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
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
          const isVol = String(p.dataKey).includes('masuk') || String(p.dataKey).includes('keluar');
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30" style={{ backgroundColor: dotColor }} />
                <span className="text-white font-medium text-xs">{p.name}:</span>
              </span>
              <strong className="font-mono text-white text-xs font-bold">
                {isVol ? fmtNum(p.value, 2) : `Rp ${Number(p.value || 0).toLocaleString('id-ID')}`}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LagScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#071D3D] text-white p-3 rounded-xl shadow-xl border border-white/15 text-xs space-y-1">
      <p className="font-bold text-[#C89B3C] border-b border-white/10 pb-1">Minggu {d.label}</p>
      <p className="text-white/85">Δ Volume (t-1): <strong>{d.x > 0 ? `+${fmtNum(d.x, 2)}` : fmtNum(d.x, 2)} {d.satuan}</strong></p>
      <p className="text-white/85">Δ Harga (t): <strong>{d.y > 0 ? `+${fmtRp(d.y)}` : fmtRp(d.y)}</strong></p>
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
    hargaArusDatabase,
    hargaArusSyncTime,
    hargaArusSyncSource,
    refreshEwsData,
    isLoading,
  } = useDashboardStore();

  // ── Sub-Tab Switcher ('ews_lama' | 'harga_arus') ──────────────────────────
  const [subTab, setSubTab] = useState('ews_lama');

  // ── Sub-Tab 1: Local EWS Slicers (Lama: All, PB, PE, PROD) ────────────────
  const [ewsKomoditas, setEwsKomoditas] = useState('All');
  const [ewsTipeResponden, setEwsTipeResponden] = useState('All');

  // ── Sub-Tab 2: Hubungan Harga PIHPS & Arus Perdagangan State ──────────────
  const [selectedParentKom, setSelectedParentKom] = useState('Cabai Rawit');
  const [lagPairMode, setLagPairMode] = useState('masuk_pe'); // 'masuk_pe' | 'masuk_pb' | 'keluar_pe' | 'keluar_pb'
  const [pihpsMatrixLevel, setPihpsMatrixLevel] = useState('PE'); // 'PE' | 'PB' | 'MARGIN'
  const [pihpsSearch, setPihpsSearch] = useState('');

  // ── Hitung EWS Metrics (Sub-Tab 1 — Link 1) ───────────────────────────────
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
    allCommodities = [],
    heatmapData   = [],
    timeSeriesData = [],
    forecastData  = [],
  } = ewsMetrics;

  // ── Daftar komoditas dinamis untuk Sub-Tab 1 ──────────────────────────────
  const komoditasList = useMemo(() => {
    if (allCommodities.length > 0) return allCommodities;
    const all = [...new Set(heatmapData.map(r => r.komoditas))].filter(Boolean);
    return all.length > 0 ? all : [
      'Bawang Merah Ukuran Sedang', 'Beras Kualitas Bawah I',
      'Beras Kualitas Medium I',    'Beras Kualitas Super I',
      'Cabai Merah Besar',          'Cabai Merah Keriting',
      'Cabai Rawit Hijau',          'Cabai Rawit Merah',
      'Daging Sapi Kualitas 1',     'Daging Ayam Ras',
      'Telur Ayam Ras',             'Bawang Putih Honan',
    ];
  }, [allCommodities, heatmapData]);

  // ── Data untuk Sub-Tab 2 (Link 2: Hubungan Harga PIHPS & Arus Perdagangan)
  const analisis = hargaArusDatabase?.analisis || [];
  const mingguanByKomoditas = hargaArusDatabase?.mingguanByKomoditas || {};
  const pihpsHierarchy = hargaArusDatabase?.pihpsHierarchy || [];
  const metode = hargaArusDatabase?.metode || [];
  const metaHargaArus = hargaArusDatabase?.meta || {};

  const parentKomList = useMemo(() => {
    if (analisis.length > 0) return analisis.map(a => a.komoditas);
    return ['Beras', 'Bawang Merah', 'Bawang Putih', 'Cabai Merah', 'Cabai Rawit', 'Telur Ayam Ras', 'Daging Ayam Ras', 'Daging Sapi', 'Gula Pasir', 'Minyak Goreng'];
  }, [analisis]);

  const activeAnalisisRow = useMemo(() => {
    return analisis.find(a => a.komoditas === selectedParentKom) || analisis[0] || null;
  }, [analisis, selectedParentKom]);

  const activeMingguanSeries = useMemo(() => {
    return mingguanByKomoditas[selectedParentKom] || [];
  }, [mingguanByKomoditas, selectedParentKom]);

  const activeParentHierarchyRow = useMemo(() => {
    return pihpsHierarchy.find(r => r.isGroup && r.kelompok === selectedParentKom) || null;
  }, [pihpsHierarchy, selectedParentKom]);

  // ── Scatter data Lag 1 Minggu (ΔVolume t-1 vs ΔHarga t) ───────────────────
  const lagScatterData = useMemo(() => {
    if (!activeMingguanSeries || activeMingguanSeries.length < 3) return [];
    const pts = [];
    const satuan = activeAnalisisRow?.satuan || 'kg';
    for (let i = 2; i < activeMingguanSeries.length; i++) {
      const curr = activeMingguanSeries[i];
      const xVal = lagPairMode.startsWith('masuk') ? curr.deltaMasukLag1 : curr.deltaKeluarLag1;
      const yVal = lagPairMode.endsWith('pe') ? curr.deltaPE : curr.deltaPB;
      if (xVal !== null && xVal !== undefined && yVal !== null && yVal !== undefined) {
        pts.push({
          label: curr.time || curr.date,
          x: Number(xVal),
          y: Number(yVal),
          satuan,
        });
      }
    }
    return pts;
  }, [activeMingguanSeries, lagPairMode, activeAnalisisRow]);

  const activeLagCorrValue = useMemo(() => {
    if (!activeAnalisisRow) return 0;
    if (lagPairMode === 'masuk_pe') return activeAnalisisRow.korelasiMasukPe;
    if (lagPairMode === 'masuk_pb') return activeAnalisisRow.korelasiMasukPb;
    if (lagPairMode === 'keluar_pe') return activeAnalisisRow.korelasiKeluarPe;
    return activeAnalisisRow.korelasiKeluarPb;
  }, [activeAnalisisRow, lagPairMode]);

  const pihpsWeeks = useMemo(() => {
    if (metaHargaArus?.weeks && metaHargaArus.weeks.length > 0) return metaHargaArus.weeks;
    return [];
  }, [metaHargaArus]);

  const filteredPihpsHierarchy = useMemo(() => {
    if (!pihpsSearch.trim()) return pihpsHierarchy;
    const q = pihpsSearch.toLowerCase().trim();
    return pihpsHierarchy.filter(
      r => r.komoditas.toLowerCase().includes(q) || (r.kelompok || '').toLowerCase().includes(q)
    );
  }, [pihpsHierarchy, pihpsSearch]);

  const statusBg = overallStatus === 'CRITICAL' ? 'bg-red-500'
    : overallStatus === 'WARNING' ? 'bg-orange-500'
    : overallStatus === 'WATCH'   ? 'bg-amber-500'
    : 'bg-emerald-500';

  const isUsingDefault = !ewsDatabase;

  const activeSyncSource = subTab === 'ews_lama'
    ? (ewsSyncSource || 'OneDrive Dashboard ALPS PIHPS (Jan 2019 – Sept 2026)')
    : (hargaArusSyncSource || 'OneDrive Hubungan Harga & Arus (2026-09-21)');

  const activeSyncTime = subTab === 'ews_lama' ? ewsSyncTime : hargaArusSyncTime;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="bg-[#0A2E5C] text-white rounded-2xl px-5 py-3 shadow-md border border-[#071D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#C89B3C] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white m-0 leading-tight">
              EARLY WARNING SYSTEM ARUS DAN HARGA PANGAN DIY
            </h1>
            <p className="text-[10px] text-[#B3D4F2] mt-0.5">
              {activeSyncSource}
              {activeSyncTime && ` · Synced: ${activeSyncTime}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshEwsData(subTab === 'ews_lama' ? ONEDRIVE_EWS_URL : ONEDRIVE_HARGA_ARUS_URL)}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-[#C89B3C]/20 hover:bg-[#C89B3C]/30 border border-[#C89B3C]/40 text-[#C89B3C] text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            title="Sinkronkan data EWS dari OneDrive"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Mengunduh...' : 'Refresh EWS'}</span>
          </button>
          <span className="text-[10px] font-bold text-[#C89B3C] bg-white/10 px-3 py-1 rounded-full border border-[#C89B3C]/40 hidden sm:inline-block">
            BI TPID Early Warning Engine
          </span>
        </div>
      </div>

      {/* ── Sub-Tab Navigation Switcher ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-1.5 border border-[#E4E7EC] shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab('ews_lama')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'ews_lama'
                ? 'bg-[#0A2E5C] text-white shadow-xs'
                : 'text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7]'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${subTab === 'ews_lama' ? 'text-[#C89B3C]' : 'text-[#667085]'}`} />
            <span>1. Early Warning System (ALPS PIHPS)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              subTab === 'ews_lama' ? 'bg-white/15 text-[#C89B3C]' : 'bg-[#F2F4F7] text-[#475467]'
            }`}>
              2019–2026 &bull; PB, PE &amp; PROD
            </span>
          </button>

          <button
            onClick={() => setSubTab('harga_arus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'harga_arus'
                ? 'bg-[#0A2E5C] text-white shadow-xs'
                : 'text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7]'
            }`}
          >
            <Table2 className={`w-3.5 h-3.5 ${subTab === 'harga_arus' ? 'text-[#C89B3C]' : 'text-[#667085]'}`} />
            <span>2. Hubungan Harga PIHPS &amp; Arus Perdagangan</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              subTab === 'harga_arus' ? 'bg-white/15 text-[#C89B3C]' : 'bg-[#F2F4F7] text-[#475467]'
            }`}>
              Mingguan 2026 &bull; PE &amp; PB
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 pr-2 text-[11px] text-[#667085]">
          {subTab === 'ews_lama' ? (
            <span>Sumber: <strong className="text-[#101828]">Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx</strong></span>
          ) : (
            <span>Sumber: <strong className="text-[#101828]">Dashboard Hubungan Harga dan Arus Perdagangan.xlsx</strong></span>
          )}
        </div>
      </div>

      {/* Skor ALPS di tab ini dihitung ulang di dashboard: nilai Model_ALPS di workbook sumber belum terisi hasil hitung */}
      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[10.5px] text-amber-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Skor ALPS = estimasi dashboard.</strong> Dihitung ulang dari harga PIHPS dengan rumus ALPS (Residual / SD Residual),
          bukan angka resmi workbook. Nilai pada sheet Model_ALPS di file sumber belum terisi hasil hitung, sehingga angka dapat berbeda dari perhitungan resmi.
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: EARLY WARNING SYSTEM LAMA (LINK 1: DASHBOARD ALPS 2019–2026)
          Tampilan 100% sesuai versi semula (lengkap PB, PE, PROD, Risk Map, Time Series, Forecast)
         ═══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'ews_lama' && (
        <div className="space-y-4">

          {/* ── KPI Cards Row ──────────────────────────────────────────────── */}
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
                  <span>Database 2A (EWS ALPS)</span>
                </div>
                <p className="text-[#667085]">
                  {isUsingDefault
                    ? '⚠️ Menggunakan seed data default. Muat file EWS Excel untuk data aktual.'
                    : `✅ Database aktif: ${heatmapData.length} komoditas (Jan 2019 – Sep 2026).`}
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
                <div className="overflow-auto flex-1 max-h-[340px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] text-[10px] font-bold text-[#475467] bg-[#F8FAFC] sticky top-0">
                        <th className="py-2 px-2">Komoditas</th>
                        <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PB' ? 'bg-[#DCEAFA] text-[#0D3E77] font-extrabold' : ''}`}>Heatmap_PB</th>
                        <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PE' ? 'bg-[#DCEAFA] text-[#0D3E77] font-extrabold' : ''}`}>Heatmap_PE</th>
                        <th className={`py-2 px-2 text-right transition-colors ${ewsTipeResponden === 'PROD' ? 'bg-[#FFEDD5] text-[#EA580C] font-extrabold' : ''}`}>Heatmap_PROD</th>
                        <th className="py-2 px-2 text-center">ALPS (estimasi)</th>
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
                        interval={11}
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
                        interval={11}
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: HUBUNGAN HARGA PIHPS & ARUS PERDAGANGAN (LINK 2: MINGGUAN 2026)
         ═══════════════════════════════════════════════════════════════════════ */}
      {subTab === 'harga_arus' && (
        <div className="space-y-4">

          {/* Baris Kontrol & 4 Kartu Ringkasan Komoditas Terpilih */}
          <div className="clean-card p-4 bg-white border border-[#E2E8F0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EC]">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#101828] uppercase tracking-tight">
                  Ringkasan Hubungan Harga PIHPS (PE &amp; PB) dan Arus Perdagangan Mingguan DIY
                </h2>
                <p className="text-[11px] text-[#667085]">
                  Pilih komoditas utama di kanan atau klik langsung baris pada tabel di bawah untuk memperbarui grafik tren &amp; korelasi lag 1 minggu.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-[11px] font-bold text-[#344054] whitespace-nowrap">Komoditas Utama:</label>
                <select
                  value={selectedParentKom}
                  onChange={e => setSelectedParentKom(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#1E74C7] text-xs font-bold text-[#0D3E77] rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                >
                  {parentKomList.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeAnalisisRow && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Harga PE, PB & Marjin */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] border-l-4 border-l-[#0A2E5C] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#667085]">Harga PIHPS Terakhir ({activeAnalisisRow.komoditas})</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#DCEAFA] text-[#0D3E77]">
                      Rp / {activeAnalisisRow.satuan}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-[#667085] block">Eceran (PE)</span>
                      <span className="text-base font-black text-[#0A2E5C] font-mono">{fmtRp(activeAnalisisRow.peTerakhir)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#667085] block">Pedagang Besar (PB)</span>
                      <span className="text-sm font-bold text-[#1E74C7] font-mono">{fmtRp(activeAnalisisRow.pbTerakhir)}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-[#E4E7EC] flex items-center justify-between text-[10px]">
                    <span className="text-[#667085]">Selisih Marjin (PE – PB):</span>
                    <strong className="text-[#101828] font-mono">{fmtRp(activeAnalisisRow.selisihPePb)}</strong>
                  </div>
                </div>

                {/* Card 2: Pasokan Masuk, Keluar & Stok (Survei PB) */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] border-l-4 border-l-[#1E74C7] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#667085]">Arus Perdagangan PB ({activeAnalisisRow.satuan})</span>
                    <span className="text-[10px] font-semibold text-[#0D3E77]">{activeAnalisisRow.kabKotaPelapor || 2} Kab/Kota</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-[#667085] block">Masuk</span>
                      <span className="text-sm font-black text-[#12B76A] font-mono">{fmtNum(activeAnalisisRow.masukTerakhir, 2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#667085] block">Keluar</span>
                      <span className="text-sm font-black text-[#F97316] font-mono">{fmtNum(activeAnalisisRow.keluarTerakhir, 2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#667085] block">Stok Akhir</span>
                      <span className="text-sm font-black text-[#101828] font-mono">{fmtNum(activeAnalisisRow.stokTerakhir, 2)}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-[#E4E7EC] flex items-center justify-between text-[10px]">
                    <span className="text-[#667085]">Proyeksi Pasokan Masuk t+1 (Rata2 4M):</span>
                    <strong className="text-[#0D3E77] font-mono">{fmtNum(activeAnalisisRow.proyeksiMasuk, 2)} {activeAnalisisRow.satuan}</strong>
                  </div>
                </div>

                {/* Card 3: Proyeksi Harga PE t+1 & Evaluasi MAE Naif */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] border-l-4 border-l-[#C89B3C] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">Proyeksi Harga &amp; Perubahan 4 Minggu</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-[#667085] block">Proyeksi PE (t+1)</span>
                      <span className="text-base font-black text-[#101828] font-mono">{fmtRp(activeAnalisisRow.proyeksiPe)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#667085] block">Perubahan PE 4M</span>
                      <span className={`text-xs font-bold font-mono inline-flex items-center gap-0.5 ${activeAnalisisRow.perubahanPe4Minggu > 0 ? 'text-[#F04438]' : activeAnalisisRow.perubahanPe4Minggu < 0 ? 'text-[#12B76A]' : 'text-[#344054]'}`}>
                        {activeAnalisisRow.perubahanPe4Minggu > 0 ? <ArrowUpRight className="w-3 h-3" /> : activeAnalisisRow.perubahanPe4Minggu < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {activeAnalisisRow.perubahanPe4Minggu > 0 ? `+${fmtRp(activeAnalisisRow.perubahanPe4Minggu)}` : fmtRp(activeAnalisisRow.perubahanPe4Minggu)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-[#E4E7EC] flex items-center justify-between text-[10px]">
                    <span className="text-[#667085]">MAE Model Naif (4 Minggu):</span>
                    <strong className="text-[#101828] font-mono">{fmtRp(activeAnalisisRow.maeNaif)}</strong>
                  </div>
                </div>

                {/* Card 4: Matriks Korelasi Tertunda (Lag 1 Minggu, N = 15) */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] border-l-4 border-l-[#7C3AED] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#667085]">Korelasi Lag 1 Minggu (N={activeAnalisisRow.nPasangan || 15})</span>
                    <span className="text-[9px] font-semibold text-[#7C3AED] bg-purple-50 px-1.5 py-0.5 rounded">ΔVol(t-1) → ΔHarga(t)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Masuk→PE:</span>
                      <strong className={`font-mono ${activeAnalisisRow.korelasiMasukPe < -0.25 ? 'text-[#12B76A]' : activeAnalisisRow.korelasiMasukPe > 0.25 ? 'text-[#F04438]' : 'text-[#101828]'}`}>
                        {fmtNum(activeAnalisisRow.korelasiMasukPe, 3)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Masuk→PB:</span>
                      <strong className="font-mono text-[#101828]">{fmtNum(activeAnalisisRow.korelasiMasukPb, 3)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Keluar→PE:</span>
                      <strong className="font-mono text-[#101828]">{fmtNum(activeAnalisisRow.korelasiKeluarPe, 3)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Keluar→PB:</span>
                      <strong className="font-mono text-[#101828]">{fmtNum(activeAnalisisRow.korelasiKeluarPb, 3)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Baris Grafik: Tren Mingguan (Harga PE & PB vs Pasokan Masuk) + Scatter Korelasi Lag t-1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Grafik 1: Tren Mingguan Harga PE & PB vs Pasokan Masuk */}
            <div className="lg:col-span-7 clean-card p-4 bg-white border border-[#E2E8F0] flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC] mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[#101828]">
                    Tren Mingguan Harga PIHPS (PE &amp; PB) vs Volume Arus Perdagangan — {selectedParentKom}
                  </h3>
                  <p className="text-[10px] text-[#667085]">
                    Sumbu Kiri: Harga (Rp) &bull; Sumbu Kanan: Volume Masuk &amp; Keluar ({activeAnalisisRow?.satuan || 'kg'})
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#0A2E5C]"><span className="w-2.5 h-2.5 rounded-full bg-[#0A2E5C]" /> Harga PE</span>
                  <span className="flex items-center gap-1 text-[#1E74C7]"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]" /> Harga PB</span>
                  <span className="flex items-center gap-1 text-[#12B76A]"><span className="w-2.5 h-2.5 rounded-xs bg-[#12B76A]/60" /> Vol Masuk</span>
                </div>
              </div>

              <div className="w-full flex-1" style={{ minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={activeMingguanSeries} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      interval={1}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="price"
                      tick={{ fontSize: 9, fill: '#0A2E5C' }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="vol"
                      orientation="right"
                      tick={{ fontSize: 9, fill: '#12B76A' }}
                      tickFormatter={v => `${Number(v).toFixed(0)}`}
                      domain={[0, 'auto']}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Bar
                      yAxisId="vol"
                      dataKey="masuk"
                      name={`Volume Masuk (${activeAnalisisRow?.satuan || 'kg'})`}
                      fill="#12B76A"
                      fillOpacity={0.28}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="vol"
                      dataKey="keluar"
                      name={`Volume Keluar (${activeAnalisisRow?.satuan || 'kg'})`}
                      fill="#F97316"
                      fillOpacity={0.22}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="hargaPE"
                      name="Harga Eceran (PE)"
                      stroke="#0A2E5C"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#0A2E5C' }}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="hargaPB"
                      name="Harga Pedagang Besar (PB)"
                      stroke="#1E74C7"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={{ r: 2, fill: '#1E74C7' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 2: Scatter Plot Korelasi Tertunda (ΔVolume t-1 vs ΔHarga t) */}
            <div className="lg:col-span-5 clean-card p-4 bg-white border border-[#E2E8F0] flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC] mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[#101828]">
                    Uji Hubungan Perubahan Mingguan (Lag 1 Minggu) — {selectedParentKom}
                  </h3>
                  <p className="text-[10px] text-[#667085]">
                    Koefisien Korelasi Pearson <strong className="text-[#0D3E77]">r = {fmtNum(activeLagCorrValue, 3)}</strong> (N = {activeAnalisisRow?.nPasangan || 15} pasangan)
                  </p>
                </div>
                <select
                  value={lagPairMode}
                  onChange={e => setLagPairMode(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#D0D5DD] text-[10px] font-bold text-[#101828] rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="masuk_pe">Δ Masuk (t-1) vs Δ Harga PE (t)</option>
                  <option value="masuk_pb">Δ Masuk (t-1) vs Δ Harga PB (t)</option>
                  <option value="keluar_pe">Δ Keluar (t-1) vs Δ Harga PE (t)</option>
                  <option value="keluar_pb">Δ Keluar (t-1) vs Δ Harga PB (t)</option>
                </select>
              </div>

              <div className="w-full flex-1" style={{ minHeight: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 15, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Δ Volume (t-1)"
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      label={{
                        value: `Δ Volume ${lagPairMode.startsWith('masuk') ? 'Masuk' : 'Keluar'} Minggu Lalu (t-1)`,
                        position: 'bottom',
                        offset: 8,
                        fontSize: 10,
                        fill: '#475467'
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Δ Harga (t)"
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      tickFormatter={v => `${(v / 1000).toFixed(1)}K`}
                      label={{
                        value: `Δ Harga ${lagPairMode.endsWith('pe') ? 'PE' : 'PB'} Minggu Ini (t)`,
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                        fill: '#475467',
                        dx: -5
                      }}
                    />
                    <ReferenceLine x={0} stroke="#94A3B8" strokeDasharray="4 4" />
                    <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="4 4" />
                    <Tooltip content={<LagScatterTooltip />} />
                    <Scatter
                      name={selectedParentKom}
                      data={lagScatterData}
                      fill="#0A2E5C"
                      r={5}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-[#E4E7EC] text-[10px] text-[#475467] flex items-center justify-between">
                <span>
                  {activeLagCorrValue < -0.25
                    ? '📉 Korelasi negatif: kenaikan pasokan minggu lalu cenderung menahan/menurunkan harga minggu ini.'
                    : activeLagCorrValue > 0.25
                    ? '📈 Korelasi positif: kenaikan arus sejalan dengan tarikan permintaan & harga pasar.'
                    : '⚖️ Korelasi lemah: pergerakan harga minggu ini lebih dipengaruhi faktor non-arus lokal.'}
                </span>
              </div>
            </div>

          </div>

          {/* Tabel 1: Ringkasan Analisis 10 Komoditas Utama (Persis Sheet Dashboard & Analisis di OneDrive) */}
          <div className="clean-card p-4 bg-white border border-[#E2E8F0] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC]">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#101828]">
                  Tabel Rekapitulasi Analisis Harga PIHPS, Arus Perdagangan PB &amp; Proyeksi Mingguan (10 Komoditas Utama)
                </h3>
                <p className="text-[10px] text-[#667085]">
                  Sumber: Sheet <code className="bg-[#F2F4F7] px-1 py-0.5 rounded">Analisis</code> &amp; <code className="bg-[#F2F4F7] px-1 py-0.5 rounded">Dashboard</code> pada OneDrive &bull; Klik baris komoditas untuk memilih grafik di atas.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#0D3E77] bg-[#F2F7FD] px-2.5 py-1 rounded-full border border-[#B3D4F2] shrink-0">
                Posisi Akhir: {metaHargaArus?.lastPeriod || '2026-09-21'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[10px] font-bold text-[#475467] uppercase">
                    <th className="py-2.5 px-2.5">Komoditas</th>
                    <th className="py-2.5 px-2 text-center">Satuan</th>
                    <th className="py-2.5 px-2.5 text-right">Harga PE</th>
                    <th className="py-2.5 px-2.5 text-right">Harga PB</th>
                    <th className="py-2.5 px-2.5 text-right">Selisih PE–PB</th>
                    <th className="py-2.5 px-2.5 text-right">Masuk Terakhir</th>
                    <th className="py-2.5 px-2.5 text-right">Keluar Terakhir</th>
                    <th className="py-2.5 px-2.5 text-right">Stok Terakhir</th>
                    <th className="py-2.5 px-2.5 text-right">r(ΔMasuk t-1, ΔPE t)</th>
                    <th className="py-2.5 px-2.5 text-right">Proyeksi PE t+1</th>
                    <th className="py-2.5 px-2.5 text-right">Proyeksi Masuk t+1</th>
                    <th className="py-2.5 px-2.5 text-right">MAE Naif</th>
                    <th className="py-2.5 px-2.5 text-right">Δ PE 4 Minggu</th>
                    <th className="py-2.5 px-2 text-center">Pelapor Kab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {analisis.map(row => {
                    const isSelected = row.komoditas === selectedParentKom;
                    return (
                      <tr
                        key={row.komoditas}
                        onClick={() => setSelectedParentKom(row.komoditas)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F2F7FD] font-semibold border-l-3 border-l-[#0A2E5C]' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-2.5 font-bold text-[#0A2E5C] whitespace-nowrap">
                          {row.komoditas}
                        </td>
                        <td className="py-2 px-2 text-center text-[#667085]">{row.satuan}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-[#101828]">{fmtRp(row.peTerakhir)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#1E74C7]">{fmtRp(row.pbTerakhir)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#475467]">{fmtRp(row.selisihPePb)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#12B76A] font-semibold">{fmtNum(row.masukTerakhir, 2)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#F97316]">{fmtNum(row.keluarTerakhir, 2)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#344054]">{fmtNum(row.stokTerakhir, 2)}</td>
                        <td className={`py-2 px-2.5 text-right font-mono font-bold ${row.korelasiMasukPe < -0.25 ? 'text-[#12B76A]' : row.korelasiMasukPe > 0.25 ? 'text-[#F04438]' : 'text-[#344054]'}`}>
                          {fmtNum(row.korelasiMasukPe, 3)}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-semibold text-[#0D3E77]">{fmtRp(row.proyeksiPe)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#0D3E77]">{fmtNum(row.proyeksiMasuk, 2)}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#667085]">{fmtRp(row.maeNaif)}</td>
                        <td className={`py-2 px-2.5 text-right font-mono font-semibold ${row.perubahanPe4Minggu > 0 ? 'text-[#F04438]' : row.perubahanPe4Minggu < 0 ? 'text-[#12B76A]' : 'text-[#344054]'}`}>
                          {row.perubahanPe4Minggu > 0 ? `+${fmtRp(row.perubahanPe4Minggu)}` : fmtRp(row.perubahanPe4Minggu)}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-[#475467]">
                          {row.kabKotaPelapor}/5
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel 2: Matriks Historis Harga PIHPS DIY (Bentuk Tabel PIHPS I..X + Sub-Varian Kualitas · 17 Minggu) */}
          <div className="clean-card p-4 bg-white border border-[#E2E8F0] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-[#E4E7EC]">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#101828]">
                  Tabel Matriks Harga Pangan Strategis (PIHPS DIY) — Kelompok Utama (I–X) &amp; 21 Sub-Varian Kualitas
                </h3>
                <p className="text-[10px] text-[#667085]">
                  Disusun menyerupai tabel referensi PIHPS BI (Baris Sumber 2–32) lengkap dengan Expected Price ALPS, Skor ALPS, dan seri harga 17 minggu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Level Harga: PE / PB / Selisih */}
                <div className="inline-flex rounded-xl bg-[#F2F4F7] p-1 border border-[#E4E7EC]">
                  {[
                    { id: 'PE', label: 'Pedagang Eceran (PE)' },
                    { id: 'PB', label: 'Pedagang Besar (PB)' },
                    { id: 'MARGIN', label: 'Selisih (PE – PB)' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPihpsMatrixLevel(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        pihpsMatrixLevel === opt.id
                          ? 'bg-[#0A2E5C] text-white shadow-2xs'
                          : 'text-[#475467] hover:text-[#101828]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={pihpsSearch}
                  onChange={e => setPihpsSearch(e.target.value)}
                  placeholder="Cari komoditas / varian..."
                  className="bg-[#F8FAFC] border border-[#D0D5DD] focus:border-[#1E74C7] rounded-xl px-3 py-1 text-xs text-[#101828] outline-none w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#0A2E5C] text-white text-[10px] font-bold uppercase">
                    <th className="py-2.5 px-2 text-center sticky left-0 z-30 bg-[#0A2E5C] w-10">No</th>
                    <th className="py-2.5 px-3 sticky left-10 z-30 bg-[#0A2E5C] min-w-[210px] border-r border-white/15">
                      Komoditas (Rp)
                    </th>
                    <th className="py-2.5 px-2.5 text-right bg-[#0D3E77] border-r border-white/15 whitespace-nowrap">
                      Δ Mgg Terakhir
                    </th>
                    {pihpsWeeks.map(w => (
                      <th key={w} className="py-2.5 px-2 text-right font-mono whitespace-nowrap">
                        {formatShortDate(w)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {filteredPihpsHierarchy.map(row => {
                    const isParent = row.isGroup;
                    const activeStats = pihpsMatrixLevel === 'PB' ? row.statsPB : row.statsPE;
                    const wowPct = pihpsMatrixLevel === 'MARGIN' ? null : activeStats?.wowPct;

                    return (
                      <tr
                        key={row.barisSumber}
                        className={
                          isParent
                            ? 'bg-[#EAF3FC] font-bold text-[#0A2E5C]'
                            : 'bg-white hover:bg-[#F8FAFC] text-[#344054]'
                        }
                      >
                        <td
                          className={`py-2 px-2 text-center font-mono sticky left-0 z-10 ${
                            isParent ? 'bg-[#EAF3FC] font-black text-[#0A2E5C]' : 'bg-white text-[#667085]'
                          }`}
                        >
                          {row.no}
                        </td>
                        <td
                          className={`py-2 px-3 sticky left-10 z-10 border-r border-[#E4E7EC] whitespace-nowrap ${
                            isParent
                              ? 'bg-[#EAF3FC] font-extrabold text-[#0A2E5C]'
                              : 'bg-white pl-6 font-medium text-[#101828]'
                          }`}
                        >
                          {row.komoditas}
                        </td>
                        <td className={`py-2 px-2.5 text-right font-mono text-[10.5px] border-r border-[#E4E7EC] font-semibold ${
                          wowPct > 0 ? 'text-[#D92D20]' : wowPct < 0 ? 'text-[#059669]' : 'text-[#475467]'
                        }`}>
                          {wowPct !== null && wowPct !== undefined ? pct(wowPct, 2) : '-'}
                        </td>
                        {pihpsWeeks.map((w, wIdx) => {
                          const peVal = row.pricesPE?.[w];
                          const pbVal = row.pricesPB?.[w];
                          const cellVal = pihpsMatrixLevel === 'PE'
                            ? peVal
                            : pihpsMatrixLevel === 'PB'
                            ? pbVal
                            : (peVal !== undefined && pbVal !== undefined ? peVal - pbVal : null);

                          const prevW = wIdx > 0 ? pihpsWeeks[wIdx - 1] : null;
                          const prevVal = prevW
                            ? (pihpsMatrixLevel === 'PE'
                                ? row.pricesPE?.[prevW]
                                : pihpsMatrixLevel === 'PB'
                                ? row.pricesPB?.[prevW]
                                : ((row.pricesPE?.[prevW] ?? 0) - (row.pricesPB?.[prevW] ?? 0)))
                            : null;

                          const isUp = prevVal !== null && prevVal !== undefined && cellVal > prevVal;
                          const isDown = prevVal !== null && prevVal !== undefined && cellVal < prevVal;

                          return (
                            <td
                              key={w}
                              className={`py-2 px-2 text-right font-mono whitespace-nowrap ${
                                isUp ? 'text-[#D92D20] font-semibold' : isDown ? 'text-[#059669]' : ''
                              }`}
                            >
                              {cellVal !== null && cellVal !== undefined
                                ? Math.round(cellVal).toLocaleString('id-ID')
                                : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ringkasan Metodologi dari Sheet Metode */}
            {metode.length > 0 && (
              <div className="pt-2 border-t border-[#E4E7EC] flex items-start gap-2 text-[10.5px] text-[#475467] bg-[#F8FAFC] p-2.5 rounded-xl">
                <Info className="w-4 h-4 text-[#0D3E77] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0A2E5C]">Catatan Metodologi Workbook OneDrive &amp; ALPS:</span>
                  <p>
                    Data harga PIHPS (PE &amp; PB) disejajarkan pada tanggal awal minggu yang sama dengan agregasi mingguan Survei Pedagang Besar (17 minggu: 1 Juni – 21 September 2026). Indikator ALPS dihitung melalui model <em>out-of-sample</em> (<em>ALPS = Residual / SD Residual</em>). Skor ALPS merupakan estimasi dashboard, bukan angka resmi workbook.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
