// Tab 1: Ringkasan Utama & Neraca Arus
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_KALENDER, REF_WILAYAH, REF_KLASTER_RESPONDEN } from '../../data/seedData';
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
  Scale,
  Percent,
  Coins,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export function Tab1RingkasanUtama() {
  const calculations = useCalculations();
  const {
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    selectedKlaster,
    setSelectedPeriode,
    setSelectedKomoditas,
    setSelectedWilayah,
    setSelectedKlaster
  } = useDashboardStore();

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
    butterflyData
  } = calculations;

  // Donut data with high-contrast executive styling
  const pasokanDonut = [
    { name: 'Luar DIY', value: Number((currentMetrics.volMasuk * (pctLuarDiy / 100)).toFixed(2)), color: '#2563eb' },
    { name: 'Dalam DIY (Internal)', value: Number((currentMetrics.volMasuk * (pctLokalMasuk / 100)).toFixed(2)), color: '#0f172a' },
  ];

  const tujuanDonut = [
    { name: 'Dalam DIY (Internal)', value: Number((currentMetrics.volKeluar * (pctLokalKeluar / 100)).toFixed(2)), color: '#059669' },
    { name: 'Luar DIY', value: Number((currentMetrics.volKeluar * (pctReekspor / 100)).toFixed(2)), color: '#0f172a' },
  ];

  return (
    <div className="space-y-4">
      
      {/* 1. TOP SLICER BAR & SELISIH VOLUME CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* 4 Slicers in single row */}
        <div className="lg:col-span-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 clean-card p-3 bg-white">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Periode</label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
            >
              <option value="semua">All</option>
              {REF_KLASTER_RESPONDEN.map(kl => (
                <option key={kl.id} value={kl.id}>{kl.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Right: Selisih Volume Highlight Card */}
        <div className="lg:col-span-2 clean-card p-3 flex items-center gap-3 bg-white">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${currentMetrics.neracaBersih >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Selisih Volume</div>
            <div className={`text-lg font-extrabold tracking-tight ${currentMetrics.neracaBersih >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {currentMetrics.neracaBersih >= 0 ? '+' : ''}{currentMetrics.neracaBersih.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton
            </div>
          </div>
        </div>

      </div>

      {/* 2. 6 KPI CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Volume Masuk */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ArrowRightCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume Masuk</div>
            <div className="text-base font-extrabold text-slate-900">
              {currentMetrics.volMasuk.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton
            </div>
          </div>
        </div>

        {/* Card 2: Volume Keluar */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ArrowLeftCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume Keluar</div>
            <div className="text-base font-extrabold text-slate-900">
              {currentMetrics.volKeluar.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton
            </div>
          </div>
        </div>

        {/* Card 3: Harga Jual */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            Rp
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Harga Jual</div>
            <div className="text-base font-extrabold text-slate-900">
              Rp {Math.round(currentMetrics.avgHargaJual).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Card 4: Harga Beli */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            Rp
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Harga Beli</div>
            <div className="text-base font-extrabold text-slate-900">
              Rp {Math.round(currentMetrics.avgHargaBeli).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Card 5: Margin % */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Margin</div>
            <div className="text-base font-extrabold text-slate-900">
              {currentMetrics.marginPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Card 6: Margin Harga (Rp) */}
        <div className="clean-card p-3.5 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Margin Harga</div>
            <div className="text-base font-extrabold text-slate-900">
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
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tren Arus Pasokan & Penjualan (Ton)
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Mingguan</span>
            </div>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrends} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(val, name) => [`${val} Ton`, name === 'volMasuk' ? 'Volume Masuk' : 'Volume Keluar']}
                  />
                  <Line type="monotone" dataKey="volKeluar" name="Volume Keluar" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3.5, fill: '#ea580c' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="volMasuk" name="Volume Masuk" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3.5, fill: '#2563eb' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-medium mt-1 text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> Volume Keluar</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Volume Masuk</span>
          </div>
        </div>

        {/* Center: Neraca Arus per Komoditas dan Kabupaten/Kota */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Neraca Arus per Komoditas & Kab/Kota
              </h3>
              <span className="text-[10px] text-slate-400">Ton</span>
            </div>
            <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-56">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 text-[10px] font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5">Komoditas</th>
                    <th className="px-1.5 py-1.5 text-right">Bantul</th>
                    <th className="px-1.5 py-1.5 text-right">Gunungkidul</th>
                    <th className="px-1.5 py-1.5 text-right">Kota Yk</th>
                    <th className="px-1.5 py-1.5 text-right">Kulon Progo</th>
                    <th className="px-1.5 py-1.5 text-right">Sleman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[10.5px]">
                  {matrixNeraca.map((row) => (
                    <tr key={row.id_komoditas} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-1 font-medium text-slate-800 whitespace-nowrap">{row.nama_komoditas.replace(' (Ton)', '')}</td>
                      {['Kab. Bantul', 'Kab. Gunungkidul', 'Kota Yogyakarta', 'Kab. Kulon Progo', 'Kab. Sleman'].map(w => {
                        const val = row.wilayah[w] || 0;
                        const isNeg = val < -0.1;
                        return (
                          <td key={w} className={`px-1.5 py-1 text-right font-mono ${isNeg ? 'text-rose-600 bg-rose-50/50 font-semibold' : val > 0.1 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
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
          <div className="text-[10px] text-slate-400 text-right mt-1 pt-1 border-t border-slate-100">Nilai netto dalam satuan Ton (Surplus / Defisit)</div>
        </div>

        {/* Right: 2 Donut Charts (Komposisi Pasokan & Penjualan) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
          
          {/* Donut 1: Komposisi Pasokan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between">
            <h3 className="text-[11px] font-bold text-slate-800 text-center leading-tight uppercase tracking-wider">
              Komposisi Pasokan
            </h3>
            <div className="h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pasokanDonut} cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={3} dataKey="value">
                    {pasokanDonut.map((entry, idx) => <Cell key={`p-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                    formatter={(val) => [`${val} Ton`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-extrabold text-slate-900">{pctLuarDiy.toFixed(0)}%</span>
                <span className="text-[8px] text-slate-400 font-medium">Luar DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Luar DIY</span>
                <span className="font-mono font-semibold text-slate-900">{pctLuarDiy.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-slate-900">{pctLokalMasuk.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Donut 2: Komposisi Penjualan */}
          <div className="clean-card p-3 bg-white flex flex-col justify-between">
            <h3 className="text-[11px] font-bold text-slate-800 text-center leading-tight uppercase tracking-wider">
              Komposisi Penjualan
            </h3>
            <div className="h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tujuanDonut} cx="50%" cy="50%" innerRadius={30} outerRadius={46} paddingAngle={3} dataKey="value">
                    {tujuanDonut.map((entry, idx) => <Cell key={`t-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                    formatter={(val) => [`${val} Ton`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-extrabold text-slate-900">{pctLokalKeluar.toFixed(0)}%</span>
                <span className="text-[8px] text-slate-400 font-medium">Lokal DIY</span>
              </div>
            </div>
            <div className="space-y-1 text-[9.5px] text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Dalam DIY</span>
                <span className="font-mono font-semibold text-slate-900">{pctLokalKeluar.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Re-ekspor</span>
                <span className="font-mono font-semibold text-slate-900">{pctReekspor.toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ROW: Top Sumber Pasokan | Top Tujuan Penjualan | Butterfly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Panel 1: Top Sumber Pasokan (Ton) */}
        <div className="clean-card p-4 lg:col-span-3 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top Sumber Pasokan (Ton)
              </h3>
              <span className="text-[10px] text-slate-400">Origin</span>
            </div>
            <div className="space-y-2 mt-3">
              {top5Origins.map((item, idx) => {
                const maxVol = top5Origins[0]?.volume || 1;
                const widthPct = Math.max(10, (item.volume / maxVol) * 100);
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 truncate max-w-[130px] font-medium">{item.name}</span>
                      <span className="font-mono font-bold text-slate-900">{item.volume}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-100 mt-2">
            <span>0</span>
            <span>100</span>
            <span>200+ Ton</span>
          </div>
        </div>

        {/* Panel 2: Top Tujuan Penjualan (Ton) */}
        <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top Tujuan Penjualan (Ton)
              </h3>
              <span className="text-[10px] text-slate-400">Destination</span>
            </div>
            <div className="space-y-2 mt-3">
              {top5Destinations.map((item, idx) => {
                const maxVol = top5Destinations[0]?.volume || 1;
                const widthPct = Math.max(10, (item.volume / maxVol) * 100);
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-700 truncate max-w-[140px] font-medium">{item.name}</span>
                      <span className="font-mono font-bold text-slate-900">{item.volume}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full bg-teal-600 transition-all duration-300" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-100 mt-2">
            <span>0</span>
            <span>50</span>
            <span>100+ Ton</span>
          </div>
        </div>

        {/* Panel 3: Arus Masuk vs Arus Keluar (Butterfly Mirrored Chart) */}
        <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Arus Masuk vs Arus Keluar
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Butterfly Matrix</span>
            </div>
            <div className="space-y-1.5 mt-2 max-h-56 overflow-y-auto pr-1">
              {butterflyData.map((item) => {
                const maxVol = Math.max(...butterflyData.map(b => Math.max(b.volMasuk, b.volKeluar))) || 1;
                const leftPct = (item.volKeluar / maxVol) * 100;
                const rightPct = (item.volMasuk / maxVol) * 100;

                return (
                  <div key={item.id_komoditas} className="grid grid-cols-12 items-center gap-1.5 text-xs py-0.5">
                    {/* Commodity Label */}
                    <div className="col-span-4 text-slate-700 text-[11px] truncate font-medium">
                      {item.komoditas}
                    </div>

                    {/* Butterfly Bar: Left (Keluar) vs Right (Masuk) */}
                    <div className="col-span-8 flex items-center h-5">
                      {/* Left bar (Keluar) */}
                      <div className="flex-1 flex items-center justify-end">
                        <div className="bg-orange-600 h-4 rounded-l flex items-center justify-end px-1.5 shadow-2xs" style={{ width: `${Math.max(12, leftPct)}%` }}>
                          <span className="text-[9px] font-bold text-white">{item.volKeluar}</span>
                        </div>
                      </div>
                      <div className="w-0.5 h-5 bg-slate-300"></div>
                      {/* Right bar (Masuk) */}
                      <div className="flex-1 flex items-center justify-start">
                        <div className="bg-blue-600 h-4 rounded-r flex items-center justify-start px-1.5 shadow-2xs" style={{ width: `${Math.max(12, rightPct)}%` }}>
                          <span className="text-[9px] font-bold text-white">{item.volMasuk}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-medium text-slate-600 pt-2 border-t border-slate-100 mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600"></span> Volume Keluar</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Volume Masuk</span>
          </div>
        </div>

      </div>

    </div>
  );
}
