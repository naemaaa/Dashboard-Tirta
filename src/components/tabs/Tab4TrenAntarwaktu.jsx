// Tab 4: Tren Antarwaktu dan Perubahan Periode
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useMemo } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS } from '../../data/seedData';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { formatDecimal, formatPercent, formatRupiah } from '../../utils/formatters';
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
  TrendingUp,
  TrendingDown
} from 'lucide-react';

class Tab4ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tab4 Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
          <h3 className="text-base font-bold">Terjadi Kesalahan pada Render Tab 4 (Tren Antarwaktu)</h3>
          <p className="text-xs font-mono bg-white p-3 rounded-lg border border-rose-200 overflow-x-auto">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-700 transition-colors"
          >
            Coba Muat Ulang Tab
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Tab4TrenAntarwaktu() {
  return (
    <Tab4ErrorBoundary>
      <Tab4TrenAntarwaktuContent />
    </Tab4ErrorBoundary>
  );
}

function Tab4TrenAntarwaktuContent() {
  const calculations = useCalculations();
  const { selectedPeriode } = useDashboardStore();

  const {
    deltas = {},
    historicalTrends = [],
    tab4RegionalDeltas = [],
    tab4CommodityEvolution = {},
    dominantUnit,
    isMultiPeriode,
    jumlahPeriode,
  } = calculations || {};

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');
  const isLiter = dominantUnit === 'Liter';
  const priceUnitTitle = isLiter ? 'Rp/liter' : 'Rp/kg';

  // Palette 15 komoditas multi-series (§2.5)
  const commColors = [
    '#1E74C7', '#17B6A7', '#0284C7', '#C89B3C', '#98A2B3', '#0A2E5C',
    '#F97316', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6',
    '#F59E0B', '#EF4444', '#06B6D4'
  ];

  const allCommodityNames = useMemo(() => {
    return REF_KOMODITAS.map(k => k.nama_komoditas.replace(' (Ton)', '').replace(' (Liter)', ''));
  }, []);

  const historicalTrendsWithDeltas = useMemo(() => {
    return (historicalTrends || []).map((curr, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : null;
      const volMasukDelta = prev && prev.volMasuk > 0 ? ((curr.volMasuk - prev.volMasuk) / prev.volMasuk) * 100 : 0;
      const volKeluarDelta = prev && prev.volKeluar > 0 ? ((curr.volKeluar - prev.volKeluar) / prev.volKeluar) * 100 : 0;
      const hargaJualDelta = prev && prev.hargaJual > 0 ? ((curr.hargaJual - prev.hargaJual) / prev.hargaJual) * 100 : 0;
      return {
        ...curr,
        volMasukDelta,
        volKeluarDelta,
        hargaJualDelta
      };
    });
  }, [historicalTrends]);

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={true} title="Tab 4 — Tren Antarwaktu & Dinamika Deret Waktu" subtitle="Perkembangan volume, harga, serta margin perdagangan antar minggu pengamatan" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="space-y-3">
        
        {/* Top: 5 Delta KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#12539E] flex items-center justify-center shrink-0">
              <ArrowRightCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Perubahan Masuk</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
                {deltas.volMasukDelta >= 0 ? '+' : ''}{formatPercent(deltas.volMasukDelta, 2)}
              </div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[rgba(23,182,167,0.12)] text-[#17B6A7] flex items-center justify-center shrink-0">
              <ArrowLeftCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Perubahan Keluar</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
                {deltas.volKeluarDelta >= 0 ? '+' : ''}{formatPercent(deltas.volKeluarDelta, 2)}
              </div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              deltas.neracaDelta >= 0 ? 'bg-[rgba(18,183,106,0.12)] text-[#12B76A]' : 'bg-[rgba(240,68,56,0.12)] text-[#F04438]'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Perubahan Selisih</div>
              <div className={`text-base sm:text-lg font-bold tabular-nums ${deltas.neracaDelta >= 0 ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>
                {deltas.neracaDelta >= 0 ? '+' : ''}{formatDecimal(deltas.neracaDelta, 2)} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span>
              </div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center font-bold text-xs shrink-0">
              Rp
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Perubahan Harga</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
                {deltas.hargaJualDelta >= 0 ? '+' : ''}{formatPercent(deltas.hargaJualDelta, 2)}
              </div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[rgba(18,183,106,0.12)] text-[#12B76A] flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Perubahan Margin</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
                {deltas.marginDelta !== 0 ? `${deltas.marginDelta >= 0 ? '+' : ''}${formatPercent(deltas.marginDelta, 2)}` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-periode disclaimer */}
        {isMultiPeriode && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-700 font-medium">
            <span>⚠</span>
            <span>
              Mode multi-periode aktif ({jumlahPeriode} minggu). Delta di atas membandingkan
              <strong> rata-rata per minggu</strong> vs periode tunggal sebelumnya — bukan perbandingan week-on-week murni.
            </span>
          </div>
        )}

        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab4" title="Executive Intelligence · Analisis Dinamika & Proyeksi Antarwaktu" />

        {/* Middle Row (3 Panels): Trend Volume | Trend Harga | Selisih Perkembangan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Panel 1: Trend Volume Arus Antar Waktu */}
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between" id="chart-tab4-vol-trend">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Trend Volume Arus
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{unitLabel}</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatDecimal(v, 2)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val, name) => [`${formatDecimal(val, 2)} ${unitLabel}`, name]}
                    />
                    <Line type="monotone" dataKey="volMasuk" name="Arus Masuk" stroke="#1E74C7" strokeWidth={2.5} dot={{ r: 3, fill: '#1E74C7' }} />
                    <Line type="monotone" dataKey="volKeluar" name="Arus Keluar" stroke="#17B6A7" strokeWidth={2.5} dot={{ r: 3, fill: '#17B6A7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs font-medium text-[#344054] pt-2 border-t border-[#F2F4F7]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E74C7]"></span> Arus Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17B6A7]"></span> Arus Keluar</span>
            </div>
          </div>

          {/* Panel 2: Trend Harga Antar Waktu */}
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between" id="chart-tab4-price-trend">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Trend Harga Antar Waktu
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{priceUnitTitle}</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: 18, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp ${formatDecimal(v/1000, 1)} rb`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val, name) => [formatRupiah(val, 2), name]}
                    />
                    <Line type="monotone" dataKey="hargaJual" name="Harga Jual" stroke="#1E74C7" strokeWidth={2.5} dot={{ r: 3, fill: '#1E74C7' }} />
                    <Line type="monotone" dataKey="hargaBeli" name="Harga Beli" stroke="#C89B3C" strokeWidth={2.5} dot={{ r: 3, fill: '#C89B3C' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs font-medium text-[#344054] pt-2 border-t border-[#F2F4F7]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span> Harga Jual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]"></span> Harga Beli</span>
            </div>
          </div>

          {/* Panel 3: Selisih Perkembangan (Vertical Bar Chart) */}
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between" id="chart-tab4-selisih-reg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Selisih Perkembangan
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{unitLabel}</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tab4RegionalDeltas} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="wilayah" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatDecimal(v, 2)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val) => [`${formatDecimal(val, 2)} ${unitLabel}`, 'Selisih Perkembangan']}
                    />
                    <Bar dataKey="selisihPerkembangan" radius={[4, 4, 0, 0]}>
                      {tab4RegionalDeltas.map((entry, idx) => (
                        <Cell key={`b-${idx}`} fill={entry.selisihPerkembangan >= 0 ? '#12B76A' : '#F04438'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs font-medium text-[#344054] pt-2 border-t border-[#F2F4F7]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]"></span> Pertumbuhan (+)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F04438]"></span> Penurunan (-)</span>
            </div>
          </div>

        </div>

        {/* Bottom Panel: Evolusi Volume per Komoditas (Stacked/Grouped Area/Line Chart) */}
        <div className="clean-card p-5 bg-white relative z-20" id="chart-tab4-comm-evo">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Evolusi Arus Masuk per Komoditas Pangan
              </h3>
              <p className="text-xs text-[#667085]">Dinamika pasokan mingguan komoditas utama DIY</p>
            </div>
            <span className="text-xs text-[#667085] bg-[#F2F4F7] px-2.5 py-1 rounded-full font-medium">Deret Waktu Mingguan</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tab4CommodityEvolution} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="periodeLabel" tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatDecimal(v, 2)} />
                <Tooltip
                  wrapperStyle={{ zIndex: 99999 }}
                  contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  formatter={(val, name) => [`${formatDecimal(val, 2)} Ton`, name]}
                />
                {allCommodityNames.map((comm, idx) => (
                  <Area
                    key={comm}
                    type="monotone"
                    dataKey={comm}
                    stackId="1"
                    stroke={commColors[idx % commColors.length]}
                    fill={commColors[idx % commColors.length]}
                    fillOpacity={0.65}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[10.5px] font-medium text-[#344054] mt-3 pt-3 border-t border-[#F2F4F7]">
            {allCommodityNames.map((comm, idx) => (
              <span key={comm} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: commColors[idx % commColors.length] }}></span>
                {comm}
              </span>
            ))}
          </div>
        </div>

        {/* Tabel Ringkasan Perubahan Periode ke Periode (Historis Lengkap dengan WoW Deltas) */}
        <div className="clean-card p-5 bg-white relative z-10" id="table-tab4-summary">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Ringkasan Perubahan Periode ke Periode
              </h3>
              <p className="text-xs text-[#667085]">
                Dinamika perkembangan volume, harga, dan marjin antar minggu pengamatan beserta persentase perubahan (WoW)
              </p>
            </div>
            <span className="text-xs text-[#667085] bg-[#F2F4F7] px-2.5 py-1 rounded-full font-medium">Historis Lengkap</span>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl max-h-72">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#344054] font-semibold text-[10.5px] border-b border-[#E2E8F0] sticky top-0">
                <tr>
                  <th className="px-3 py-2 bg-[#F8FAFC]">Periode</th>
                  <th className="px-3 py-2 text-right">Arus Masuk ({unitLabel})</th>
                  <th className="px-3 py-2 text-right text-[#1E74C7]">Δ Masuk (WoW)</th>
                  <th className="px-3 py-2 text-right">Arus Keluar ({unitLabel})</th>
                  <th className="px-3 py-2 text-right text-[#0284C7]">Δ Keluar (WoW)</th>
                  <th className="px-3 py-2 text-right font-bold">Selisih Net ({unitLabel})</th>
                  <th className="px-3 py-2 text-right text-slate-500">Rerata Harga Beli</th>
                  <th className="px-3 py-2 text-right">Rerata Harga Jual</th>
                  <th className="px-3 py-2 text-right text-amber-600">Δ Harga (WoW)</th>
                  <th className="px-3 py-2 text-right font-bold text-[#0D3E77]">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7] bg-white text-[10.5px]">
                {[...historicalTrendsWithDeltas].reverse().map((row) => {
                  const isMasukPos = row.volMasukDelta >= 0;
                  const isKeluarPos = row.volKeluarDelta >= 0;
                  const isHargaPos = row.hargaJualDelta >= 0;
                  return (
                    <tr key={row.id_periode} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-3 py-2 font-bold text-[#101828]">{row.id_periode}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{formatDecimal(row.volMasuk, 2)}</td>
                      <td className={`px-3 py-2 text-right font-mono font-bold ${isMasukPos ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>
                        {row.volMasukDelta !== 0 ? `${isMasukPos ? '+' : ''}${formatDecimal(row.volMasukDelta, 1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{formatDecimal(row.volKeluar, 2)}</td>
                      <td className={`px-3 py-2 text-right font-mono font-bold ${isKeluarPos ? 'text-[#1E74C7]' : 'text-amber-600'}`}>
                        {row.volKeluarDelta !== 0 ? `${isKeluarPos ? '+' : ''}${formatDecimal(row.volKeluarDelta, 1)}%` : '—'}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono font-bold ${row.neraca >= 0 ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>
                        {row.neraca > 0 ? `+${formatDecimal(row.neraca, 2)}` : formatDecimal(row.neraca, 2)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{formatRupiah(row.hargaBeli)}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-800">{formatRupiah(row.hargaJual)}</td>
                      <td className={`px-3 py-2 text-right font-mono font-bold ${isHargaPos ? 'text-amber-600' : 'text-[#12B76A]'}`}>
                        {row.hargaJualDelta !== 0 ? `${isHargaPos ? '+' : ''}${formatDecimal(row.hargaJualDelta, 1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#0D3E77]">{formatPercent(row.marginPct, 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
