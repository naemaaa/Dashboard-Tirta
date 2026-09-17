// Tab 3: Harga Jual, Beli & Marjin Dagang
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
import { RotateCcw, TrendingUp, TrendingDown, DollarSign, Percent, ShieldCheck } from 'lucide-react';

export function Tab3HargaMarjin() {
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
    currentMetrics,
    deltas,
    historicalTrends,
    tab3PriceMatrix,
    tab3MarginRanking,
    tab3ScatterData,
    tab3RegionPrices = [],
    maxRegionPrice = 0,
    minRegionPrice = 0,
    tab3SpiData
  } = calculations;

  const currentKalender = REF_KALENDER.find(k => k.id_periode === selectedPeriode) || REF_KALENDER[REF_KALENDER.length - 1];

  const categoryColors = {
    'Beras & Padi-padian': '#2563eb',
    'Hortikultura & Sayuran': '#f59e0b',
    'Peternakan & Daging': '#10b981',
    'Minyak & Olahan': '#8b5cf6'
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Slicers Bar */}
      <div className="clean-card p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Transmisi Harga & Marjin Tataniaga Pangan DIY
          </h2>
          <p className="text-[11px] text-slate-500">
            Monitoring kestabilan harga komoditas pangan, marjin tataniaga & disparitas wilayah DIY
          </p>
        </div>

        {/* Page Slicers */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
          >
            <option value="Semua">All Periode</option>
            {REF_KALENDER.map((k) => (
              <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
            ))}
          </select>

          <select
            value={selectedKomoditas}
            onChange={(e) => setSelectedKomoditas(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
          >
            <option value="Semua">All Komoditas</option>
            {REF_KOMODITAS.map(k => (
              <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
            ))}
          </select>

          <select
            value={selectedWilayah}
            onChange={(e) => setSelectedWilayah(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
          >
            <option value="Semua Wilayah DIY">All Wilayah</option>
            {REF_WILAYAH.map(w => (
              <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
            ))}
          </select>

          <select
            value={selectedKlaster}
            onChange={(e) => setSelectedKlaster(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
          >
            <option value="semua">All Responden</option>
            {REF_KLASTER_RESPONDEN.map(kl => (
              <option key={kl.id} value={kl.id}>{kl.label}</option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Reset Filter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 5 Price KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="clean-card p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rerata Harga Beli</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            Rp {Math.round(currentMetrics.avgHargaBeli).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tingkat Distributor</div>
        </div>

        <div className="clean-card p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rerata Harga Jual</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            Rp {Math.round(currentMetrics.avgHargaJual).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tingkat Grosir / Pedagang</div>
        </div>

        <div className="clean-card p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Spread Marjin</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            Rp {Math.round(currentMetrics.marginRp).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Selisih Jual - Beli</div>
        </div>

        <div className="clean-card p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Persentase Marjin</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {currentMetrics.marginPct.toFixed(1)}%
          </div>
          <div className="mt-1">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentMetrics.marginPct > 5 ? 'bg-emerald-50 text-emerald-700' :
              currentMetrics.marginPct >= 1 ? 'bg-amber-50 text-amber-700' :
              'bg-rose-50 text-rose-700'
            }`}>
              {currentMetrics.marginLabel}
            </span>
          </div>
        </div>

        <div className="clean-card p-3.5 bg-white">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Dinamika vs Mgg Lalu</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
            <span>{deltas.hargaJualDelta >= 0 ? '+' : ''}{deltas.hargaJualDelta.toFixed(1)}%</span>
            {deltas.hargaJualDelta >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pergerakan Harga Jual</div>
        </div>
      </div>

      {/* 3. Executive Intelligence Insight Box */}
      <ExecutiveIntelligenceBox tabId="tab3" title="Executive Intelligence · Analisis Harga & Transmisi Marjin" />

      {/* 4. Matriks Harga & Marjin */}
      <div className="clean-card p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Matriks Harga & Marjin Tataniaga per Komoditas × Wilayah
            </h3>
            <p className="text-[11px] text-slate-500">Harga Beli, Jual (Rp/kg), dan Marjin (%) per Wilayah DIY</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-72">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 text-[10px] font-semibold sticky top-0 z-20">
              <tr className="border-b border-slate-200">
                <th rowSpan="2" className="px-3 py-2 border-r border-slate-200 bg-slate-50 sticky left-0 z-30">Komoditas</th>
                {REF_WILAYAH.map(w => (
                  <th key={w.id_kab_kota} colSpan="3" className="px-2 py-1 text-center border-r border-slate-200">{w.nama_kab_kota.replace('Kab. ', '')}</th>
                ))}
                <th colSpan="3" className="px-2 py-1 text-center bg-slate-100 font-bold">Rata-rata DIY</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[9.5px] text-slate-500">
                {REF_WILAYAH.map(w => (
                  <React.Fragment key={`sub-p-${w.id_kab_kota}`}>
                    <th className="px-1.5 py-1 text-right">Beli</th>
                    <th className="px-1.5 py-1 text-right">Jual</th>
                    <th className="px-1.5 py-1 text-right font-bold border-r border-slate-200">M%</th>
                  </React.Fragment>
                ))}
                <th className="px-1.5 py-1 text-right bg-slate-100 font-medium">Beli</th>
                <th className="px-1.5 py-1 text-right bg-slate-100 font-medium">Jual</th>
                <th className="px-1.5 py-1 text-right bg-slate-100 font-bold">M%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tab3PriceMatrix.map(row => {
                const isSelected = row.komoditas === selectedKomoditas;
                return (
                  <tr
                    key={row.id_komoditas}
                    onClick={() => setSelectedKomoditas(row.komoditas)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60 font-semibold' : ''}`}
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap border-r border-slate-100 sticky left-0 bg-white font-medium text-slate-800">
                      {row.komoditas.replace(' (Ton)', '')}
                    </td>
                    {REF_WILAYAH.map(w => {
                      const p = row.wilayahPrices[w.nama_kab_kota] || { hargaBeli: 0, hargaJual: 0, marginPct: 0 };
                      const badge = p.marginPct > 5 ? 'text-emerald-700' : p.marginPct >= 1 ? 'text-amber-700' : 'text-rose-600';
                      return (
                        <React.Fragment key={`p-${w.id_kab_kota}`}>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-slate-400">{p.hargaBeli ? p.hargaBeli.toLocaleString('id-ID') : '-'}</td>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-slate-700">{p.hargaJual ? p.hargaJual.toLocaleString('id-ID') : '-'}</td>
                          <td className={`px-1.5 py-1.5 text-right font-mono text-[10.5px] border-r border-slate-100 font-semibold ${badge}`}>{p.marginPct}%</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-slate-50 text-slate-500">{row.avgBeliAll.toLocaleString('id-ID')}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-slate-50 font-medium text-slate-900">{row.avgJualAll.toLocaleString('id-ID')}</td>
                    <td className={`px-1.5 py-1.5 text-right font-mono font-bold text-[10.5px] bg-slate-50 ${row.avgMarginPct > 5 ? 'text-emerald-700' : row.avgMarginPct >= 1 ? 'text-amber-700' : 'text-rose-600'}`}>{row.avgMarginPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Tren Harga & Ranking Marjin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="clean-card p-4 lg:col-span-7 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tren Harga Beli vs Jual ({selectedKomoditas.replace(' (Ton)', '')})
              </h3>
              <p className="text-[11px] text-slate-500">Perkembangan harga historis mingguan (Rp/kg)</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-amber-700"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Beli</span>
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Jual</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  formatter={(val, name) => [`Rp ${Number(val).toLocaleString('id-ID')}`, name === 'hargaBeli' ? 'Harga Beli' : 'Harga Jual']}
                />
                <ReferenceLine y={13500} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="hargaBeli" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3.5, fill: '#d97706' }} />
                <Line type="monotone" dataKey="hargaJual" stroke="#059669" strokeWidth={2.5} dot={{ r: 3.5, fill: '#059669' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-4 lg:col-span-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Peringkat Marjin (%)
              </h3>
              <p className="text-[11px] text-slate-500">Persentase spread per komoditas</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tab3MarginRanking} margin={{ top: 10, right: 10, left: -15, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="komoditas" angle={-30} textAnchor="end" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px' }}
                  formatter={(val) => [`${val}%`, 'Marjin']}
                />
                <Bar dataKey="marginPct" radius={[3, 3, 0, 0]}>
                  {tab3MarginRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.marginPct > 8 ? '#059669' : entry.marginPct > 4 ? '#d97706' : '#e11d48'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. Scatter & Disparitas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="clean-card p-4 lg:col-span-7 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matriks Posisi: Harga Beli vs Jual & Volume
              </h3>
              <p className="text-[11px] text-slate-500">Ukuran bubble mencerminkan total volume (Ton)</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="hargaBeli" name="Harga Beli" tickFormatter={(v) => `Rp${(v/1000).toFixed(0)}k`} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="hargaJual" name="Harga Jual" tickFormatter={(v) => `Rp${(v/1000).toFixed(0)}k`} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="volume" range={[40, 250]} name="Volume" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '10px' }}
                  formatter={(val, name) => [name === 'Volume' ? `${val} T` : `Rp ${Number(val).toLocaleString('id-ID')}`, name]}
                />
                <Scatter name="Komoditas" data={tab3ScatterData} fill="#2563eb">
                  {tab3ScatterData.map((entry, index) => (
                    <Cell key={`cell-sc-${index}`} fill={categoryColors[entry.kelompok] || '#2563eb'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Disparitas Wilayah: {selectedKomoditas.replace(' (Ton)', '')}
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Spasial</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Tingkat harga jual per kabupaten/kota</p>
            <div className="space-y-2">
              {tab3RegionPrices.map((item, idx) => {
                const isMax = item.hargaJual === maxRegionPrice && maxRegionPrice > 0;
                const isMin = item.hargaJual === minRegionPrice && minRegionPrice > 0;
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-700 font-medium">
                        {item.wilayah.replace('Kab. ', '')}
                        {isMax && <span className="ml-1.5 text-[9px] text-rose-600 bg-rose-50 border border-rose-200/60 px-1 py-0.2 rounded font-bold">Tertinggi</span>}
                        {isMin && <span className="ml-1.5 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1 py-0.2 rounded font-bold">Terendah</span>}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        Rp {item.hargaJual.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${isMax ? 'bg-rose-500' : isMin ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${Math.max(20, (item.hargaJual / (maxRegionPrice || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-medium">
            <span>Spread Harga: Rp {(maxRegionPrice - minRegionPrice).toLocaleString('id-ID')}/kg</span>
            <span className="text-emerald-700 font-semibold">Terkendali</span>
          </div>
        </div>
      </div>

    </div>
  );
}
