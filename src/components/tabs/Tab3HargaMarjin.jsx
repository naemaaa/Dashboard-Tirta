import React from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_WILAYAH } from '../../data/seedData';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
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
import { TrendingUp, TrendingDown, DollarSign, Percent, ShieldCheck } from 'lucide-react';

export function Tab3HargaMarjin() {
  const calculations = useCalculations();
  const {
    selectedKomoditas = 'Beras Medium I',
    setSelectedKomoditas
  } = useDashboardStore();

  const komoditasLabel = (selectedKomoditas || 'Beras Medium I').replace(' (Ton)', '').replace(' (Liter)', '');

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
  } = calculations;

  const categoryColors = {
    'Beras & Padi-padian': '#1E74C7',
    'Hortikultura & Sayuran': '#17B6A7',
    'Peternakan & Daging': '#C89B3C',
    'Minyak & Olahan': '#7DB4E8'
  };

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={false} />

      {/* 2. 5 Price KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Rerata Harga Beli</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight tabular-nums">
            Rp {Math.round(currentMetrics.avgHargaBeli).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1">Tingkat Distributor</div>
        </div>

        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Rerata Harga Jual</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight tabular-nums">
            Rp {Math.round(currentMetrics.avgHargaJual).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1">Tingkat Grosir / Pedagang</div>
        </div>

        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Spread Marjin</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight tabular-nums">
            Rp {Math.round(currentMetrics.marginRp).toLocaleString('id-ID')}
            <span className="text-xs font-normal text-[#667085] ml-1">/kg</span>
          </div>
          <div className="text-xs text-[#667085] mt-1">Selisih Jual - Beli</div>
        </div>

        <div className="clean-card p-4 bg-white">
          <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">Persentase Marjin</div>
          <div className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight tabular-nums">
            {currentMetrics.marginPct.toFixed(1)}%
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
            <span>{deltas.hargaJualDelta >= 0 ? '+' : ''}{deltas.hargaJualDelta.toFixed(1)}%</span>
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
      <div className="clean-card p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              Matriks Harga & Marjin Tataniaga per Komoditas × Wilayah
            </h3>
            <p className="text-xs text-[#667085]">Harga Beli, Jual (Rp/kg), dan Marjin (%) per Wilayah DIY</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-72">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F9FAFB] text-[#344054] text-[10px] font-semibold sticky top-0 z-20">
              <tr className="border-b border-[#E4E7EC]">
                <th rowSpan="2" className="px-3 py-2 border-r border-[#E4E7EC] bg-[#F9FAFB] sticky left-0 z-30">Komoditas</th>
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
                    <td className="px-3 py-1.5 whitespace-nowrap border-r border-[#E4E7EC] sticky left-0 bg-white font-medium text-[#101828]">
                      {row.komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}
                    </td>
                    {REF_WILAYAH.map(w => {
                      const p = row.wilayahPrices[w.nama_kab_kota] || { hargaBeli: 0, hargaJual: 0, marginPct: 0 };
                      const badge = p.marginPct > 5 ? 'text-[#12B76A]' : p.marginPct >= 1 ? 'text-[#F79009]' : 'text-[#F04438]';
                      return (
                        <React.Fragment key={`p-${w.id_kab_kota}`}>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-[#98A2B3]">{p.hargaBeli ? p.hargaBeli.toLocaleString('id-ID') : '-'}</td>
                          <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] text-[#344054]">{p.hargaJual ? p.hargaJual.toLocaleString('id-ID') : '-'}</td>
                          <td className={`px-1.5 py-1.5 text-right font-mono text-[10.5px] border-r border-[#E4E7EC] font-semibold ${badge}`}>{p.marginPct}%</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-[#F9FAFB] text-[#667085]">{row.avgBeliAll.toLocaleString('id-ID')}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono text-[10.5px] bg-[#F9FAFB] font-medium text-[#101828]">{row.avgJualAll.toLocaleString('id-ID')}</td>
                    <td className={`px-1.5 py-1.5 text-right font-mono font-bold text-[10.5px] bg-[#F9FAFB] ${row.avgMarginPct > 5 ? 'text-[#12B76A]' : row.avgMarginPct >= 1 ? 'text-[#F79009]' : 'text-[#F04438]'}`}>{row.avgMarginPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Tren Harga & Ranking Marjin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="clean-card p-5 lg:col-span-7 bg-white">
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
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} tickFormatter={v => `Rp ${(v/1000).toFixed(0)} rb`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  formatter={(val, name) => [`Rp ${Number(val).toLocaleString('id-ID')}`, name === 'hargaBeli' ? 'Harga Beli' : 'Harga Jual']}
                />
                <ReferenceLine y={13500} stroke="#D0D5DD" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="hargaBeli" stroke="#C89B3C" strokeWidth={2.5} dot={{ r: 3.5, fill: '#C89B3C' }} />
                <Line type="monotone" dataKey="hargaJual" stroke="#1E74C7" strokeWidth={2.5} dot={{ r: 3.5, fill: '#1E74C7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-5 lg:col-span-5 bg-white">
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
                <XAxis dataKey="komoditas" angle={-30} textAnchor="end" tick={{ fontSize: 9, fill: '#667085' }} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  formatter={(val) => [`${val}%`, 'Marjin']}
                />
                <Bar dataKey="marginPct" radius={[4, 4, 0, 0]}>
                  {tab3MarginRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.marginPct > 8 ? '#12B76A' : entry.marginPct > 4 ? '#17B6A7' : '#F04438'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. Scatter & Disparitas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="clean-card p-5 lg:col-span-7 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Matriks Posisi: Harga Beli vs Jual & Volume
              </h3>
              <p className="text-xs text-[#667085]">Ukuran bubble mencerminkan total volume (Ton)</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                <XAxis type="number" dataKey="hargaBeli" name="Harga Beli" tickFormatter={(v) => `Rp ${(v/1000).toFixed(0)} rb`} tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="hargaJual" name="Harga Jual" tickFormatter={(v) => `Rp ${(v/1000).toFixed(0)} rb`} tick={{ fontSize: 9, fill: '#667085' }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="volume" range={[40, 250]} name="Volume" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#071D3D] border border-[#1E74C7] rounded-xl p-3 shadow-xl text-xs text-white">
                          <div className="font-bold text-white border-b border-white/15 pb-1 mb-1.5">{d.komoditas || 'Komoditas'}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-4 text-slate-300"><span>Harga Beli:</span> <span className="font-mono text-white font-semibold">Rp {Number(d.hargaBeli).toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between gap-4 text-slate-300"><span>Harga Jual:</span> <span className="font-mono text-white font-semibold">Rp {Number(d.hargaJual).toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between gap-4 text-slate-300"><span>Volume:</span> <span className="font-mono text-white font-semibold">{d.volume} {d.satuan || 'Ton'}</span></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Komoditas" data={tab3ScatterData} fill="#1E74C7">
                  {tab3ScatterData.map((entry, index) => (
                    <Cell key={`cell-sc-${index}`} fill={categoryColors[entry.kelompok] || '#1E74C7'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-5 lg:col-span-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                Disparitas Wilayah: {komoditasLabel}
              </h3>
              <span className="text-[10px] font-semibold text-[#0D3E77] bg-[#DCEAFA] px-2.5 py-0.5 rounded-full border border-[#B3D4F2]">Spasial</span>
            </div>
            <p className="text-xs text-[#667085] mb-3">Tingkat harga jual per kabupaten/kota</p>
            <div className="space-y-2.5">
              {tab3RegionPrices.map((item, idx) => {
                const isMax = item.hargaJual === maxRegionPrice && maxRegionPrice > 0;
                const isMin = item.hargaJual === minRegionPrice && minRegionPrice > 0;
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#344054] font-medium">
                        {item.wilayah.replace('Kab. ', '')}
                        {isMax && <span className="ml-1.5 text-[9px] text-[#F04438] bg-[#FEF3F2] border border-[#FECDCA] px-1.5 py-0.2 rounded-full font-bold">Tertinggi</span>}
                        {isMin && <span className="ml-1.5 text-[9px] text-[#12B76A] bg-[rgba(18,183,106,0.1)] border border-[#12B76A]/20 px-1.5 py-0.2 rounded-full font-bold">Terendah</span>}
                      </span>
                      <span className="font-mono font-bold text-[#101828]">
                        Rp {item.hargaJual.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-[#F2F4F7] h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${isMax ? 'bg-[#F04438]' : isMin ? 'bg-[#12B76A]' : 'bg-[#1E74C7]'}`} style={{ width: `${Math.max(20, (item.hargaJual / (maxRegionPrice || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] text-xs text-[#667085] flex justify-between font-medium">
            <span>Spread Harga: Rp {(maxRegionPrice - minRegionPrice).toLocaleString('id-ID')}/kg</span>
            <span className="text-[#12B76A] font-semibold">Terkendali</span>
          </div>
        </div>
      </div>

    </div>
  );
}
