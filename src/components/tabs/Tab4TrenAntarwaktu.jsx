// Tab 4: Tren Antarwaktu dan Perubahan Periode
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
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
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export function Tab4TrenAntarwaktu() {
  const calculations = useCalculations();

  const {
    deltas,
    historicalTrends,
    tab4RegionalDeltas,
    tab4CommodityEvolution,
    dominantUnit,
    isMultiPeriode,
    jumlahPeriode,
  } = calculations;

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');

  // Palette multi-series (§2.5)
  const commColors = ['#1E74C7', '#17B6A7', '#7DB4E8', '#C89B3C', '#98A2B3', '#0A2E5C'];

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={false} />

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
                {deltas.volMasukDelta >= 0 ? '+' : ''}{deltas.volMasukDelta.toFixed(1)}%
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
                {deltas.volKeluarDelta >= 0 ? '+' : ''}{deltas.volKeluarDelta.toFixed(1)}%
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
                {deltas.neracaDelta >= 0 ? '+' : ''}{deltas.neracaDelta.toFixed(0)} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span>
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
                {deltas.hargaJualDelta >= 0 ? '+' : ''}{deltas.hargaJualDelta.toFixed(1)}%
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
                {deltas.marginDelta !== 0 ? `${deltas.marginDelta >= 0 ? '+' : ''}${deltas.marginDelta.toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-periode disclaimer: delta cards are avg-vs-single when multiple periods are selected */}
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
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between">
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
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val, name) => [`${val} ${unitLabel}`, name]}
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
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Trend Harga Antar Waktu
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Rp/kg</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: 18, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp ${(v/1000).toFixed(0)} rb`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val, name) => [`Rp ${Number(val).toLocaleString('id-ID')}`, name]}
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
          <div className="clean-card p-5 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Selisih Perkembangan
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{unitLabel}</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tab4RegionalDeltas} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="wilayah" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      formatter={(val) => [`${val > 0 ? '+' : ''}${val} ${unitLabel}`, 'Selisih']}
                    />
                    <Bar dataKey="deltaNet" fill="#1E74C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">Perkembangan per kabupaten</div>
          </div>

        </div>

        {/* Row 3 (2 Panels): Peringkat Komoditas Evolution & Perubahan Arus per Kab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Peringkat Komoditas Berdasarkan Volume dari Waktu ke Waktu */}
          <div className="clean-card p-5 lg:col-span-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Peringkat Komoditas Berdasarkan Volume Waktu ke Waktu
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Stream</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tab4CommodityEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="label" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    {Object.keys(tab4CommodityEvolution[0] || {})
                      .filter(k => k !== 'label')
                      .map((k, idx) => (
                        <Area key={k} type="monotone" dataKey={k} name={k} stackId="1" stroke={commColors[idx % commColors.length]} fill={commColors[idx % commColors.length]} fillOpacity={0.6} />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">Volume evolusi komoditas ({unitLabel})</div>
          </div>

          {/* Right: Perubahan Arus per Kabupaten/Kota */}
          <div className="clean-card p-5 lg:col-span-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Perubahan Arus per Kabupaten/Kota
                </h3>
                <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Clustered</span>
              </div>
              <div className="h-48 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tab4RegionalDeltas} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                    <XAxis dataKey="wilayah" angle={-35} textAnchor="end" tick={{ fontSize: 8, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Kab. ', '')} />
                    <YAxis tick={{ fontSize: 8, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="arusMasuk" name="Arus Masuk" fill="#1E74C7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="arusKeluar" name="Arus Keluar" fill="#0A2E5C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs font-medium text-[#344054] pt-2 border-t border-[#F2F4F7]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span> Arus Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0A2E5C]"></span> Arus Keluar</span>
            </div>
          </div>

        </div>

        {/* Bottom Row: Ringkasan Perubahan Periode ke Periode Table */}
        <div className="clean-card p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              Ringkasan Perubahan Periode ke Periode
            </h3>
            <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Historis</span>
          </div>
          <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-48">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9FAFB] text-[#344054] font-semibold border-b border-[#E4E7EC] sticky top-0">
                <tr>
                  <th className="px-3 py-2">Periode</th>
                  <th className="px-2.5 py-2 text-right">Arus Masuk</th>
                  <th className="px-2.5 py-2 text-right">Arus Keluar</th>
                  <th className="px-2.5 py-2 text-right">Selisih Volume ({unitLabel})</th>
                  <th className="px-2.5 py-2 text-right">Rerata Harga Beli</th>
                  <th className="px-2.5 py-2 text-right">Rerata Harga Jual</th>
                  <th className="px-2.5 py-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7] bg-white font-medium">
                {[...historicalTrends].reverse().map((row) => (
                  <tr key={row.id_periode} className="hover:bg-[#F2F7FD] transition-colors">
                    <td className="px-3 py-2 text-[#101828] font-bold">{row.label}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-[#667085]">{row.volMasuk}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-[#667085]">{row.volKeluar}</td>
                    <td className={`px-2.5 py-2 text-right font-mono font-bold ${row.neraca > 0.1 ? 'text-[#12B76A]' : row.neraca < -0.1 ? 'text-[#F04438]' : 'text-[#98A2B3]'}`}>
                      {row.neraca > 0 ? row.neraca : row.neraca < 0 ? `(${Math.abs(row.neraca)})` : '-'}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono text-[#344054]">Rp {row.hargaBeli.toLocaleString('id-ID')}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-[#344054]">Rp {row.hargaJual.toLocaleString('id-ID')}</td>
                    <td className="px-2.5 py-2 text-right font-mono text-[#667085]">{row.marginPct}%</td>
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
