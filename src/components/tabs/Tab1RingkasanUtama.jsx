import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
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

export function Tab1RingkasanUtama() {
  const calculations = useCalculations();

  const {
    currentMetrics,
    historicalTrends,
    matrixNeraca,
    pctLuarDiy,
    pctLokalMasuk,
    pctReekspor,
    pctLokalKeluar,
    top5Origins,
    top5Destinations,
    butterflyData,
    dominantUnit,
    isMultiPeriode,
    jumlahPeriode,
  } = calculations;

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');
  const multiPerLabel = isMultiPeriode ? `Rata-rata/minggu (${jumlahPeriode} periode)` : null;

  // Donut data with BI Design System palette (§2.5)
  const pasokanDonut = [
    { name: 'Luar DIY', value: Number((currentMetrics.volMasuk * (pctLuarDiy / 100)).toFixed(2)), color: '#1E74C7' },
    { name: 'Dalam DIY (Internal)', value: Number((currentMetrics.volMasuk * (pctLokalMasuk / 100)).toFixed(2)), color: '#7DB4E8' },
  ];

  const tujuanDonut = [
    { name: 'Dalam DIY (Internal)', value: Number((currentMetrics.volKeluar * (pctLokalKeluar / 100)).toFixed(2)), color: '#17B6A7' },
    { name: 'Luar DIY', value: Number((currentMetrics.volKeluar * (pctReekspor / 100)).toFixed(2)), color: '#0A2E5C' },
  ];

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={true} />

      {/* 2. 6 KPI CARDS ROW (§5.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Volume Masuk */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#12539E] flex items-center justify-center shrink-0">
            <ArrowRightCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Volume Masuk</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              {currentMetrics.volMasuk.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span>
            </div>
            {multiPerLabel && <div className="text-[9px] text-[#1E74C7] font-semibold">{multiPerLabel}</div>}
          </div>
        </div>

        {/* Card 2: Volume Keluar */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[rgba(23,182,167,0.12)] text-[#17B6A7] flex items-center justify-center shrink-0">
            <ArrowLeftCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Volume Keluar</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              {currentMetrics.volKeluar.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span>
            </div>
            {multiPerLabel && <div className="text-[9px] text-[#17B6A7] font-semibold">{multiPerLabel}</div>}
          </div>
        </div>

        {/* Card 3: Harga Jual */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center font-bold text-xs shrink-0">
            Rp
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Harga Jual</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              Rp {Math.round(currentMetrics.avgHargaJual).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Card 4: Harga Beli */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[rgba(200,155,60,0.12)] text-[#C89B3C] flex items-center justify-center font-bold text-xs shrink-0">
            Rp
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Harga Beli</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              Rp {Math.round(currentMetrics.avgHargaBeli).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Card 5: Margin % */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[rgba(18,183,106,0.12)] text-[#12B76A] flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Margin</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              {currentMetrics.marginPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Card 6: Margin Harga (Rp) */}
        <div className="clean-card p-4 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-[rgba(18,183,106,0.12)] text-[#12B76A] flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Margin Harga</div>
            <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">
              Rp {Math.round(currentMetrics.marginRp).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

      </div>

      {/* 3. EXECUTIVE INTELLIGENCE & INSIGHT NARRATIVE */}
      <ExecutiveIntelligenceBox tabId="tab1" title="Executive Intelligence · Ringkasan Arus & Rekomendasi TPID" />

      {/* 4. MIDDLE ROW: Tren Arus | Neraca Arus Matrix | 2 Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Left: Tren Arus Pasokan & Penjualan (Satuan: Ton) */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
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
                  <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(val, name) => [`${val} ${unitLabel}`, name === 'volMasuk' || name === 'Volume Masuk' ? 'Volume Masuk' : 'Volume Keluar']}
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
            <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-56">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F9FAFB] text-[#344054] text-[10px] font-semibold border-b border-[#E4E7EC] sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5">Komoditas</th>
                    <th className="px-1.5 py-1.5 text-right">Bantul</th>
                    <th className="px-1.5 py-1.5 text-right">Gunungkidul</th>
                    <th className="px-1.5 py-1.5 text-right">Kota Yk</th>
                    <th className="px-1.5 py-1.5 text-right">Kulon Progo</th>
                    <th className="px-1.5 py-1.5 text-right">Sleman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7] bg-white text-[10.5px]">
                  {matrixNeraca.map((row) => (
                    <tr key={row.id_komoditas} className="hover:bg-[#F2F7FD] transition-colors">
                      <td className="px-2 py-1 font-medium text-[#101828] whitespace-nowrap">{row.nama_komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}</td>
                      {['Kab. Bantul', 'Kab. Gunungkidul', 'Kota Yogyakarta', 'Kab. Kulon Progo', 'Kab. Sleman'].map(w => {
                        const val = row.wilayah[w] || 0;
                        const isNeg = val < -0.1;
                        return (
                          <td key={w} className={`px-1.5 py-1 text-right font-mono ${isNeg ? 'text-[#F04438] bg-[#FEF3F2] font-semibold' : val > 0.1 ? 'text-[#12B76A] font-semibold' : 'text-[#98A2B3]'}`}>
                            {val < 0 ? `(${Math.abs(val)})` : val > 0 ? val : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[10px] text-[#667085] text-right mt-1 pt-1 border-t border-[#F2F4F7]">Nilai netto dalam satuan {unitLabel} (Surplus / Defisit)</div>
        </div>

        {/* Right: 2 Donut Charts (Komposisi Pasokan & Penjualan) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
          
          {/* Donut 1: Komposisi Pasokan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between">
            <h3 className="text-[11px] font-bold text-[#101828] text-center leading-tight uppercase tracking-wider">
              Komposisi Pasokan
            </h3>
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
                    formatter={(val) => [`${val} ${unitLabel}`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-[#101828] tabular-nums">{pctLuarDiy.toFixed(0)}%</span>
                <span className="text-[8px] text-[#667085] font-medium">Luar DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-[#344054] pt-1 border-t border-[#F2F4F7]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E74C7]"></span> Luar DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{pctLuarDiy.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7DB4E8]"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{pctLokalMasuk.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Donut 2: Komposisi Penjualan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between">
            <h3 className="text-[11px] font-bold text-[#101828] text-center leading-tight uppercase tracking-wider">
              Komposisi Penjualan
            </h3>
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
                    formatter={(val) => [`${val} ${unitLabel}`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-[#101828] tabular-nums">{pctLokalKeluar.toFixed(0)}%</span>
                <span className="text-[8px] text-[#667085] font-medium">Lokal DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-[#344054] pt-1 border-t border-[#F2F4F7]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17B6A7]"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-[#101828]">{pctLokalKeluar.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0A2E5C]"></span> Re-ekspor</span>
                <span className="font-mono font-semibold text-[#101828]">{pctReekspor.toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ROW: Top Sumber Pasokan | Top Tujuan Penjualan | Butterfly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Panel 1: Top Sumber Pasokan */}
        <div className="clean-card p-4 lg:col-span-3 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Top Sumber Pasokan ({unitLabel})
              </h3>
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Origin</span>
            </div>
            <div className="space-y-2 mt-3">
              {top5Origins.map((item, idx) => {
                const maxVol = top5Origins[0]?.volume || 1;
                const widthPct = Math.max(10, (item.volume / maxVol) * 100);
                const rankColor = idx === 0 ? 'bg-[#C89B3C]' : idx === 1 ? 'bg-[#98A2B3]' : 'bg-[#B3D4F2]';
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full ${rankColor} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {idx + 1}
                        </span>
                        <span className="text-[#344054] truncate max-w-[120px] font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#101828]">{item.volume}</span>
                    </div>
                    <div className="w-full bg-[#F2F4F7] rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-[#1E74C7] transition-all duration-300" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-[#667085] flex justify-between pt-2 border-t border-[#F2F4F7] mt-2">
            <span>0</span>
            <span>100</span>
            <span>200+ {unitLabel}</span>
          </div>
        </div>

        {/* Panel 2: Top Tujuan Penjualan */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Top Tujuan Penjualan ({unitLabel})
              </h3>
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">Destination</span>
            </div>
            <div className="space-y-2 mt-3">
              {top5Destinations.map((item, idx) => {
                const maxVol = top5Destinations[0]?.volume || 1;
                const widthPct = Math.max(10, (item.volume / maxVol) * 100);
                const rankColor = idx === 0 ? 'bg-[#C89B3C]' : idx === 1 ? 'bg-[#98A2B3]' : 'bg-[#B3D4F2]';
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full ${rankColor} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {idx + 1}
                        </span>
                        <span className="text-[#344054] truncate max-w-[130px] font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#101828]">{item.volume}</span>
                    </div>
                    <div className="w-full bg-[#F2F4F7] rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-[#17B6A7] transition-all duration-300" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-[#667085] flex justify-between pt-2 border-t border-[#F2F4F7] mt-2">
            <span>0</span>
            <span>50</span>
            <span>100+ {unitLabel}</span>
          </div>
        </div>

        {/* Panel 3: Arus Masuk vs Arus Keluar (Butterfly Mirrored Chart) */}
        <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Arus Masuk vs Arus Keluar
              </h3>
              <span className="text-[10px] font-semibold text-[#0D3E77] bg-[#DCEAFA] px-2.5 py-0.5 rounded-full border border-[#B3D4F2]">Butterfly Matrix</span>
            </div>
            <div className="space-y-1.5 mt-2 max-h-56 overflow-y-auto pr-1">
              {butterflyData.map((item) => {
                const maxVol = Math.max(...butterflyData.map(b => Math.max(b.volMasuk, b.volKeluar))) || 1;
                const leftPct = (item.volKeluar / maxVol) * 100;
                const rightPct = (item.volMasuk / maxVol) * 100;

                return (
                  <div key={item.id_komoditas} className="grid grid-cols-12 items-center gap-1.5 text-xs py-0.5">
                    {/* Commodity Label */}
                    <div className="col-span-4 text-[#344054] text-[11px] truncate font-medium">
                      {item.komoditas}
                    </div>

                    {/* Butterfly Bar: Left (Keluar) vs Right (Masuk) */}
                    <div className="col-span-8 flex items-center h-5">
                      {/* Left bar (Keluar) */}
                      <div className="flex-1 flex items-center justify-end">
                        <div className="bg-[#17B6A7] h-4 rounded-l-md flex items-center justify-end px-1.5 shadow-2xs" style={{ width: `${Math.max(12, leftPct)}%` }}>
                          <span className="text-[9px] font-bold text-white tabular-nums">{item.volKeluar}</span>
                        </div>
                      </div>
                      <div className="w-0.5 h-5 bg-[#D0D5DD]"></div>
                      {/* Right bar (Masuk) */}
                      <div className="flex-1 flex items-center justify-start">
                        <div className="bg-[#1E74C7] h-4 rounded-r-md flex items-center justify-start px-1.5 shadow-2xs" style={{ width: `${Math.max(12, rightPct)}%` }}>
                          <span className="text-[9px] font-bold text-white tabular-nums">{item.volMasuk}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-xs font-medium text-[#344054] pt-2 border-t border-[#F2F4F7] mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17B6A7]"></span> Volume Keluar</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E74C7]"></span> Volume Masuk</span>
          </div>
        </div>

      </div>

    </div>
  );
}
