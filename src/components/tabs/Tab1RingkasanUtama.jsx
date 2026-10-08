import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { formatDecimal, formatRupiah, formatPercent } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  ArrowRightCircle,
  ArrowLeftCircle,
  Percent,
  Coins,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

class Tab1ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Tab1 error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-mono text-xs">
          <h3 className="font-bold text-sm mb-2">Error Rendering Tab 1:</h3>
          <pre>{this.state.error?.toString()}</pre>
          <pre className="mt-2 text-[10px] text-red-500">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Tab1RingkasanUtama() {
  return (
    <Tab1ErrorBoundary>
      <Tab1RingkasanUtamaInner />
    </Tab1ErrorBoundary>
  );
}

function Tab1RingkasanUtamaInner() {
  const calculations = useCalculations();

  const {
    currentMetrics = {},
    historicalTrends = [],
    matrixNeraca = [],
    pctLuarDiy = 0,
    pctLokalMasuk = 0,
    pctReekspor = 0,
    pctLokalKeluar = 0,
    top5Origins = [],
    top5Destinations = [],
    butterflyData = [],
    dominantUnit,
    isMultiPeriode,
    jumlahPeriode,
  } = calculations || {};

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');
  const multiPerLabel = isMultiPeriode ? `Rata-rata/minggu (${jumlahPeriode} periode)` : null;

  // Donut data with BI Design System palette (§2.5)
  const volIn = currentMetrics?.volMasuk || 0;
  const volOut = currentMetrics?.volKeluar || 0;
  const pasokanDonut = [
    { name: 'Luar DIY', value: Number((volIn * ((pctLuarDiy || 0) / 100)).toFixed(2)), color: '#1E74C7' },
    { name: 'Dalam DIY (Internal)', value: Number((volIn * ((pctLokalMasuk || 0) / 100)).toFixed(2)), color: '#7DB4E8' },
  ];

  const tujuanDonut = [
    { name: 'Dalam DIY (Internal)', value: Number((volOut * ((pctLokalKeluar || 0) / 100)).toFixed(2)), color: '#17B6A7' },
    { name: 'Luar DIY', value: Number((volOut * ((pctReekspor || 0) / 100)).toFixed(2)), color: '#0A2E5C' },
  ];

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={true} title="Tab 1 — Ringkasan Utama & Agregat Neraca Komoditas" subtitle="Monitoring agregat volume pasokan, penjualan, serta tingkat margin perdagangan DIY" />

      {/* 2. 6 KPI CARDS ROW (§5.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Card 1: Volume Masuk */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#DCEAFA] text-[#12539E] flex items-center justify-center shrink-0">
            <ArrowRightCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Volume Masuk</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatDecimal(currentMetrics.volMasuk, 2)} <span className="text-[11px] font-normal text-[#667085]">{unitLabel}</span>
            </div>
            {multiPerLabel && <div className="text-[9px] text-[#1E74C7] font-semibold truncate">{multiPerLabel}</div>}
          </div>
        </div>

        {/* Card 2: Volume Keluar */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[rgba(23,182,167,0.12)] text-[#17B6A7] flex items-center justify-center shrink-0">
            <ArrowLeftCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Volume Keluar</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatDecimal(currentMetrics.volKeluar, 2)} <span className="text-[11px] font-normal text-[#667085]">{unitLabel}</span>
            </div>
            {multiPerLabel && <div className="text-[9px] text-[#17B6A7] font-semibold truncate">{multiPerLabel}</div>}
          </div>
        </div>

        {/* Card 3: Harga Jual */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center font-bold text-xs shrink-0">
            Rp
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Harga Jual</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatRupiah(currentMetrics.avgHargaJual, 2)}
            </div>
          </div>
        </div>

        {/* Card 4: Harga Beli */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[rgba(200,155,60,0.12)] text-[#C89B3C] flex items-center justify-center font-bold text-xs shrink-0">
            Rp
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Harga Beli</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatRupiah(currentMetrics.avgHargaBeli, 2)}
            </div>
          </div>
        </div>

        {/* Card 5: Margin % */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[rgba(18,183,106,0.12)] text-[#12B76A] flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Margin</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatPercent(currentMetrics.marginPct, 2)}
            </div>
          </div>
        </div>

        {/* Card 6: Margin Harga (Rp) */}
        <div className="clean-card p-3 sm:p-3.5 flex items-center gap-2.5 bg-white min-w-0">
          <div className="w-9 h-9 rounded-full bg-[rgba(18,183,106,0.12)] text-[#12B76A] flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider truncate">Margin Harga</div>
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#101828] tabular-nums whitespace-nowrap">
              {formatRupiah(currentMetrics.marginRp, 2)}
            </div>
          </div>
        </div>

      </div>

      {/* 3. EXECUTIVE INTELLIGENCE & INSIGHT NARRATIVE */}
      <ExecutiveIntelligenceBox tabId="tab1" title="Executive Intelligence · Ringkasan Arus & Rekomendasi TPID" />

      {/* 4. MIDDLE ROW: Tren Arus | Neraca Arus Matrix | 2 Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Left: Tren Arus Pasokan & Penjualan (Satuan: Ton) */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between" id="chart-tab1-trend">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Tren Arus Pasokan & Penjualan ({unitLabel})
              </h3>
              <span className="text-[10px] font-semibold text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full">Mingguan</span>
            </div>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrends} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={(val) => formatDecimal(val, 2)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(val, name) => [`${formatDecimal(val, 2)} ${unitLabel}`, name === 'volMasuk' || name === 'Volume Masuk' ? 'Volume Masuk' : 'Volume Keluar']}
                  />
                  <Line type="monotone" dataKey="volKeluar" name="Volume Keluar" stroke="#17B6A7" strokeWidth={2.5} dot={{ r: 3.5, fill: '#17B6A7' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="volMasuk" name="Volume Masuk" stroke="#1E74C7" strokeWidth={2.5} dot={{ r: 3.5, fill: '#1E74C7' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs font-medium mt-1 text-[#344054] pt-2 border-t border-[#F2F4F7]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#17B6A7]"></span> Volume Keluar</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span> Volume Masuk</span>
          </div>
        </div>

        {/* Center: Neraca Arus per Komoditas dan Kabupaten/Kota */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Neraca Arus per Komoditas & Kab/Kota
              </h3>
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{unitLabel}</span>
            </div>
            {/* Table Container */}
            <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-56">
              <table className="w-full text-xs text-left min-w-[500px]">
                <thead className="bg-[#F9FAFB] text-[#344054] text-[10px] font-semibold border-b border-[#E4E7EC] sticky top-0 z-20">
                  <tr>
                    <th className="px-2.5 py-1.5 sticky left-0 bg-[#F9FAFB] z-30 shadow-xs">Komoditas</th>
                    <th className="px-2 py-1.5 text-right">Bantul</th>
                    <th className="px-2 py-1.5 text-right">Gunungkidul</th>
                    <th className="px-2 py-1.5 text-right">Kota Yk</th>
                    <th className="px-2 py-1.5 text-right">Kulon Progo</th>
                    <th className="px-2 py-1.5 text-right">Sleman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7] bg-white text-[10.5px]">
                  {matrixNeraca.map((row) => (
                    <tr key={row.id_komoditas} className="hover:bg-[#F2F7FD] transition-colors">
                      <td className="px-2.5 py-1 font-medium text-[#101828] whitespace-nowrap sticky left-0 bg-white z-10 shadow-xs border-r border-[#E4E7EC]">
                        {row.nama_komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}
                      </td>
                      {['Kab. Bantul', 'Kab. Gunungkidul', 'Kota Yogyakarta', 'Kab. Kulon Progo', 'Kab. Sleman'].map(w => {
                        const val = row.wilayah?.[w] || 0;
                        const isNeg = val < -0.01;
                        return (
                          <td key={w} className={`px-2 py-1 text-right font-mono ${isNeg ? 'text-[#F04438] bg-[#FEF3F2] font-semibold' : val > 0.01 ? 'text-[#12B76A] font-semibold' : 'text-[#98A2B3]'}`}>
                            {val < 0 ? `(${formatDecimal(Math.abs(val), 2)})` : val > 0 ? formatDecimal(val, 2) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[10px] text-[#667085] text-right mt-1 pt-1 border-t border-[#F2F4F7]">Nilai netto desimal x,xx dalam satuan {unitLabel} (Surplus / Defisit)</div>
        </div>

        {/* Right: 2 Donut Charts (Komposisi Pasokan & Penjualan) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
          
          {/* Donut 1: Komposisi Pasokan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between" id="chart-tab1-pasokan">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#101828] leading-tight uppercase tracking-wider">
                Komposisi Pasokan
              </h3>
            </div>
            <div className="h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pasokanDonut} cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={3} dataKey="value">
                    {pasokanDonut.map((entry, idx) => <Cell key={`p-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(val) => [`${formatDecimal(val, 2)} ${unitLabel}`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-[#101828] tabular-nums">{formatPercent(pctLuarDiy, 2)}</span>
                <span className="text-[8px] text-[#667085] font-medium">Luar DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-[#344054] pt-1 border-t border-[#F2F4F7]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E74C7]"></span> Luar DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{formatPercent(pctLuarDiy, 2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7DB4E8]"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{formatPercent(pctLokalMasuk, 2)}</span>
              </div>
            </div>
          </div>

          {/* Donut 2: Komposisi Penjualan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between" id="chart-tab1-penjualan">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#101828] leading-tight uppercase tracking-wider">
                Komposisi Penjualan
              </h3>
            </div>
            <div className="h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tujuanDonut} cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={3} dataKey="value">
                    {tujuanDonut.map((entry, idx) => <Cell key={`t-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(val) => [`${formatDecimal(val, 2)} ${unitLabel}`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-[#101828] tabular-nums">{formatPercent(pctLokalKeluar, 2)}</span>
                <span className="text-[8px] text-[#667085] font-medium">Dalam DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-[#344054] pt-1 border-t border-[#F2F4F7]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17B6A7]"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{formatPercent(pctLokalKeluar, 2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0A2E5C]"></span> Luar DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{formatPercent(pctReekspor, 2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ROW: Top 5 Asal Pasokan & Top 5 Tujuan Penjualan (Butterfly chart concept) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        
        {/* Top 5 Asal Pasokan (Pemasok Luar DIY Utama) */}
        <div className="clean-card p-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#F2F4F7] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span>
                <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Top 5 Daerah Asal Pasokan (Keseluruhan)
                </h4>
              </div>
              <span className="text-[10px] text-[#667085] font-mono font-semibold">Satuan: {unitLabel}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {(top5Origins || []).map((orig, idx) => (
                <div key={orig.name} className="flex items-center gap-3">
                  <span className="w-5 text-[11px] font-bold text-[#667085]">{idx + 1}.</span>
                  <span className="w-40 text-[11.5px] font-medium text-[#101828] truncate shrink-0" title={orig.name}>{orig.name}</span>
                  <div className="flex-1 bg-[#F2F4F7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1E74C7] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (orig.volume / (top5Origins[0]?.volume || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right font-mono font-bold text-[#101828]">
                    {formatDecimal(orig.volume, 2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Tujuan Distribusi (Penjualan Keluar DIY Utama) */}
        <div className="clean-card p-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#F2F4F7] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#17B6A7]"></span>
                <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Top 5 Daerah Tujuan Distribusi (Keseluruhan)
                </h4>
              </div>
              <span className="text-[10px] text-[#667085] font-mono font-semibold">Satuan: {unitLabel}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {(top5Destinations || []).map((dest, idx) => (
                <div key={dest.name} className="flex items-center gap-3">
                  <span className="w-5 text-[11px] font-bold text-[#667085]">{idx + 1}.</span>
                  <span className="w-40 text-[11.5px] font-medium text-[#101828] truncate shrink-0" title={dest.name}>{dest.name}</span>
                  <div className="flex-1 bg-[#F2F4F7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#17B6A7] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dest.volume / (top5Destinations[0]?.volume || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="w-16 text-right font-mono font-bold text-[#101828]">
                    {formatDecimal(dest.volume, 2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
