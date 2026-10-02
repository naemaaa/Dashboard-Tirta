import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_WILAYAH } from '../../data/seedData';
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
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, ShieldCheck } from 'lucide-react';

export function Tab3HargaMarjin() {
  const calculations = useCalculations();
  const {
    selectedKomoditas = 'Beras Medium I',
    setSelectedKomoditas,
    selectedPeriode
  } = useDashboardStore();

  const komoditasLabel = (selectedKomoditas || 'Beras Medium I').replace(' (Ton)', '').replace(' (Liter)', '');

  const {
    currentMetrics = {},
    deltas = {},
    historicalTrends = [],
    tab3PriceMatrix = [],
    tab3MarginRanking = [],
    tab3ScatterData = [],
    tab3RegionPrices = [],
    maxRegionPrice = 0,
    minRegionPrice = 0,
  } = calculations || {};

  const categoryColors = {
    'Beras & Padi-padian': '#1E74C7',
    'Hortikultura & Sayuran': '#17B6A7',
    'Peternakan & Daging': '#C89B3C',
    'Minyak & Olahan': '#7DB4E8'
  };

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={true} title="Tab 3 — Harga & Marjin Tataniaga Distribusi" subtitle="Analisis disparitas harga beli/jual pedagang besar serta margin perdagangan DIY" />

      {/* 2. 5 Price KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="clean-card p-3.5 bg-white min-w-0">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1 truncate">Rerata Harga Beli</div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-[#101828] tracking-tight tabular-nums whitespace-nowrap">
            {formatRupiah(currentMetrics.avgHargaBeli, 2)}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1 truncate">Tingkat Distributor</div>
        </div>

        <div className="clean-card p-3.5 bg-white min-w-0">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1 truncate">Rerata Harga Jual</div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-[#101828] tracking-tight tabular-nums whitespace-nowrap">
            {formatRupiah(currentMetrics.avgHargaJual, 2)}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1 truncate">Tingkat Grosir / Pedagang</div>
        </div>

        <div className="clean-card p-3.5 bg-white min-w-0">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1 truncate">Spread Marjin</div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-[#101828] tracking-tight tabular-nums whitespace-nowrap">
            {formatRupiah(currentMetrics.marginRp, 2)}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1 truncate">Selisih Jual - Beli</div>
        </div>

        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Persentase Marjin</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight tabular-nums">
            {formatPercent(currentMetrics.marginPct, 2)}
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentMetrics.marginPct > 5 ? 'bg-[rgba(18,183,106,0.12)] text-[#12B76A]' :
              currentMetrics.marginPct >= 1 ? 'bg-[rgba(247,144,9,0.12)] text-[#F79009]' :
              'bg-[rgba(240,68,56,0.12)] text-[#F04438]'
            }`}>
              {currentMetrics.marginLabel}
            </span>
          </div>
        </div>

        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Dinamika vs Mgg Lalu</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight flex items-center gap-1.5 tabular-nums">
            <span>{deltas.hargaJualDelta >= 0 ? '+' : ''}{formatPercent(deltas.hargaJualDelta, 2)}</span>
            {deltas.hargaJualDelta >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#12B76A]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#F04438]" />
            )}
          </div>
          <div className="text-xs text-[#667085] mt-1">Pergerakan Harga Jual</div>
        </div>
      </div>

      {/* 3. Executive Intelligence Insight Box */}
      <ExecutiveIntelligenceBox tabId="tab3" title="Executive Intelligence · Analisis Harga & Transmisi Marjin" />

      {/* 4. Matriks Harga & Marjin */}
      <div className="clean-card p-5 bg-white" id="table-tab3-price-matrix">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              Matriks Harga & Marjin Tataniaga per Komoditas × Wilayah
            </h3>
            <p className="text-xs text-[#667085]">Harga Beli, Jual (Rp/kg), dan Marjin (%) per Wilayah DIY</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-[380px]">
          <table className="w-full text-xs text-left min-w-[960px]">
            <thead className="bg-[#F9FAFB] text-[#344054] text-[10px] font-semibold sticky top-0 z-20">
              <tr className="border-b border-[#E4E7EC]">
                <th rowSpan="2" className="px-3 py-2 border-r border-[#E4E7EC] bg-[#F9FAFB] sticky left-0 z-30 shadow-xs">Komoditas</th>
                {REF_WILAYAH.map(w => (
                  <th key={w.id_kab_kota} colSpan="3" className="px-2 py-1.5 text-center border-r border-[#E4E7EC]">{w.nama_kab_kota.replace('Kab. ', '')}</th>
                ))}
                <th colSpan="3" className="px-2 py-1.5 text-center bg-[#F2F4F7] font-bold">Rata-rata DIY</th>
              </tr>
              <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]/70 text-[9.5px] text-[#667085]">
                {REF_WILAYAH.map(w => (
                  <React.Fragment key={`sub-p-${w.id_kab_kota}`}>
                    <th className="px-1.5 py-1 text-right">Beli</th>
                    <th className="px-1.5 py-1 text-right">Jual</th>
                    <th className="px-1.5 py-1 text-right font-bold border-r border-[#E4E7EC]">M%</th>
                  </React.Fragment>
                ))}
                <th className="px-1.5 py-1 text-right bg-[#F2F4F7] font-medium">Beli</th>
                <th className="px-1.5 py-1 text-right bg-[#F2F4F7] font-medium">Jual</th>
                <th className="px-1.5 py-1 text-right bg-[#F2F4F7] font-bold">M%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7] bg-white">
              {tab3PriceMatrix.map(row => {
                const isSelected = row.komoditas === selectedKomoditas;
                return (
                  <tr
                    key={row.id_komoditas}
                    onClick={() => setSelectedKomoditas(row.komoditas)}
                    className={`hover:bg-[#F2F7FD] cursor-pointer transition-colors ${isSelected ? 'bg-[#F2F7FD] font-semibold' : ''}`}
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap border-r border-[#E4E7EC] sticky left-0 bg-white font-medium text-[#101828] z-10 shadow-xs">
                      {row.komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}
                    </td>
                    {REF_WILAYAH.map(w => {
                      const p = row.wilayahPrices[w.nama_kab_kota] || { hargaBeli: 0, hargaJual: 0, marginPct: 0 };
                      const badge = p.marginPct > 5 ? 'text-[#12B76A]' : p.marginPct >= 1 ? 'text-[#F79009]' : 'text-[#F04438]';
                      return (
                        <React.Fragment key={`p-${w.id_kab_kota}`}>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-[#98A2B3]">{p.hargaBeli ? formatDecimal(p.hargaBeli, 2) : '-'}</td>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-[#344054]">{p.hargaJual ? formatDecimal(p.hargaJual, 2) : '-'}</td>
                          <td className={`px-1.5 py-1.5 text-right font-mono text-[10.5px] border-r border-[#E4E7EC] font-semibold ${badge}`}>{formatPercent(p.marginPct, 2)}</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-[#F9FAFB] text-[#667085]">{formatDecimal(row.avgBeliAll, 2)}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-[#F9FAFB] font-medium text-[#101828]">{formatDecimal(row.avgJualAll, 2)}</td>
                    <td className={`px-1.5 py-1.5 text-right font-mono font-bold text-[10.5px] bg-[#F9FAFB] ${row.avgMarginPct > 5 ? 'text-[#12B76A]' : row.avgMarginPct >= 1 ? 'text-[#F79009]' : 'text-[#F04438]'}`}>{formatPercent(row.avgMarginPct, 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Tren Harga & Ranking Marjin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="clean-card p-5 lg:col-span-7 bg-white" id="chart-tab3-trend">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Tren Harga Beli vs Jual ({komoditasLabel})
              </h3>
              <p className="text-xs text-[#667085]">Perkembangan harga historis mingguan (Rp/kg)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#C89B3C]"><span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]"></span> Harga Beli</span>
              <span className="flex items-center gap-1.5 text-[#1E74C7]"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span> Harga Jual</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends} margin={{ top: 10, right: 15, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp ${formatDecimal(v/1000, 1)} rb`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  formatter={(val, name) => [formatRupiah(val, 2), name === 'hargaBeli' ? 'Harga Beli' : 'Harga Jual']}
                />
                <ReferenceLine y={13500} stroke="#D0D5DD" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="hargaBeli" stroke="#C89B3C" strokeWidth={2.5} dot={{ r: 3.5, fill: '#C89B3C' }} />
                <Line type="monotone" dataKey="hargaJual" stroke="#1E74C7" strokeWidth={2.5} dot={{ r: 3.5, fill: '#1E74C7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-5 lg:col-span-5 bg-white" id="chart-tab3-ranking">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Peringkat Marjin (%)
              </h3>
              <p className="text-xs text-[#667085]">Persentase spread per komoditas</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tab3MarginRanking} margin={{ top: 10, right: 10, left: -15, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 8.5, fill: '#667085' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={v => `${formatDecimal(v, 1)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  formatter={(val) => [`${formatPercent(val, 2)}`, 'Margin %']}
                />
                <Bar dataKey="marginPct" radius={[6, 6, 0, 0]}>
                  {tab3MarginRanking.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={categoryColors[entry.kategori] || '#1E74C7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. Disparitas Harga antar Kab/Kota (Per Komoditas) */}
      <div className="clean-card p-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              Disparitas Harga Jual antar Kabupaten/Kota — {komoditasLabel}
            </h3>
            <p className="text-xs text-[#667085]">Perbandingan harga rata-rata pedagang besar per wilayah DIY</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#667085]">Pilih Komoditas:</span>
            <select
              value={selectedKomoditas}
              onChange={e => setSelectedKomoditas(e.target.value)}
              className="bg-[#F9FAFB] border border-[#E4E7EC] text-[#101828] text-xs rounded-xl px-3 py-1.5 font-semibold outline-none"
            >
              {tab3PriceMatrix.map(c => (
                <option key={c.id_komoditas} value={c.komoditas}>{c.komoditas}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {tab3RegionPrices.map(rp => {
            const isHighest = rp.hargaJual === maxRegionPrice && maxRegionPrice > 0;
            const isLowest = rp.hargaJual === minRegionPrice && minRegionPrice > 0;
            const regName = (rp.wilayah || rp.kabupaten || '');
            return (
              <div
                key={regName}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHighest ? 'bg-[#FEF3F2] border-[#F04438]/40 ring-1 ring-[#F04438]/30' :
                  isLowest ? 'bg-[#ECFDF3] border-[#12B76A]/40 ring-1 ring-[#12B76A]/30' :
                  'bg-[#F9FAFB] border-[#E4E7EC]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#101828] truncate">{regName.replace('Kab. ', '')}</span>
                  {isHighest && <span className="text-[9px] font-bold bg-[#F04438] text-white px-1.5 py-0.5 rounded">Tertinggi</span>}
                  {isLowest && <span className="text-[9px] font-bold bg-[#12B76A] text-white px-1.5 py-0.5 rounded">Terendah</span>}
                </div>
                <div className="text-lg font-bold text-[#101828] tabular-nums mt-1">
                  {formatRupiah(rp.hargaJual, 2)}
                </div>
                <div className="text-[10px] text-[#667085] flex justify-between mt-1 pt-1 border-t border-black/5">
                  <span>Harga Beli:</span>
                  <span className="font-mono font-medium">{formatRupiah(rp.hargaBeli, 2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
