import React, { useState, useMemo } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_WILAYAH } from '../../data/seedData';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import {
  ResponsiveContainer,
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
  Users,
  Sigma,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';

export function Tab2DetailArus() {
  const calculations = useCalculations();
  const {
    selectedPeriode,
    selectedKomoditas = 'Beras Medium I',
    selectedWilayah,
    selectedKlaster
  } = useDashboardStore();

  const {
    currentMetrics,
    tab2GroupedMatrix = [],
    tab2Decomposition = [],
    butterflyData = [],
    respondents = [],
    dominantUnit
  } = calculations;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');
  const komoditasLabel = (selectedKomoditas || 'Beras Medium I').replace(' (Ton)', '').replace(' (Liter)', '');

  // Filter respondents based on active filters
  const filteredRespondents = useMemo(() => {
    return respondents.filter(r => {
      if (selectedWilayah && selectedWilayah !== 'Semua' && selectedWilayah !== 'Semua Wilayah DIY') {
        const rowKab = (r.kabupaten || '').toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
        const selKab = selectedWilayah.toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
        if (rowKab !== selKab && r.kabupaten !== selectedWilayah) return false;
      }
      if (
        !selectedKlaster || selectedKlaster === 'semua' ||
        (selectedKlaster === 'pedagang_besar' && r.tipe_responden.includes('Pedagang')) ||
        (selectedKlaster === 'produsen' && r.tipe_responden.includes('Produsen'))
      ) {
        // match
      } else {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          r.nama_responden?.toLowerCase().includes(term) ||
          r.id_responden?.toLowerCase().includes(term) ||
          r.kabupaten?.toLowerCase().includes(term) ||
          r.tipe_responden?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [respondents, searchTerm, selectedWilayah, selectedKlaster]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredRespondents.length / itemsPerPage) || 1;
  const paginatedRespondents = filteredRespondents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selisihData = useMemo(() => {
    return butterflyData.map(b => ({
      name: (b.name || b.komoditas).replace(' (Ton)', '').replace(' (Liter)', ''),
      selisih: b.neraca,
      isPositive: b.neraca >= 0
    })).sort((a, b) => b.selisih - a.selisih);
  }, [butterflyData]);

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar showBadge={false} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="space-y-3">
        
        {/* Top: 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#12539E] flex items-center justify-center shrink-0">
              <ArrowRightCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Volume Masuk</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">{currentMetrics.volMasuk.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span></div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[rgba(23,182,167,0.12)] text-[#17B6A7] flex items-center justify-center shrink-0">
              <ArrowLeftCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Volume Keluar</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">{currentMetrics.volKeluar.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span></div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              currentMetrics.neracaBersih >= 0 ? 'bg-[rgba(18,183,106,0.12)] text-[#12B76A]' : 'bg-[rgba(240,68,56,0.12)] text-[#F04438]'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Selisih Volume</div>
              <div className={`text-base sm:text-lg font-bold tabular-nums ${currentMetrics.neracaBersih >= 0 ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>
                {currentMetrics.neracaBersih >= 0 ? '+' : ''}{currentMetrics.neracaBersih.toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-[#667085]">{unitLabel}</span>
              </div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#F2F4F7] text-[#344054] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Jumlah Responden</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">{filteredRespondents.length}</div>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center shrink-0">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">Data Terekam</div>
              <div className="text-base sm:text-lg font-bold text-[#101828] tabular-nums">{currentMetrics.countRecords * 2}</div>
            </div>
          </div>
        </div>

        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab2" title="Executive Intelligence · Analisis Detail Pasokan & Simpul Wilayah" />

        {/* Middle Row: Grouped Supply Chain Table & Butterfly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              
              {/* Left: Arus Masuk, Keluar, dan Selisih Table */}
              <div className="clean-card p-4 lg:col-span-7 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                      Arus Masuk, Keluar, & Selisih per Komoditas × Kab/Kota
                    </h3>
                    <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full font-medium">{unitLabel}</span>
                  </div>
                  <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-60">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F9FAFB] text-[#344054] text-[10px] font-semibold sticky top-0">
                        <tr className="border-b border-[#E4E7EC]">
                          <th rowSpan="2" className="px-2.5 py-2 border-r border-[#E4E7EC] bg-[#F9FAFB]">Komoditas</th>
                          {REF_WILAYAH.map(w => (
                            <th key={w.id_kab_kota} colSpan="3" className="px-1.5 py-1 text-center border-r border-[#E4E7EC]">{w.nama_kab_kota.replace('Kab. ', '')}</th>
                          ))}
                        </tr>
                        <tr className="border-b border-[#E4E7EC] bg-[#F2F4F7]/60 text-[9px] text-[#667085]">
                          {REF_WILAYAH.map(w => (
                            <React.Fragment key={`sub-${w.id_kab_kota}`}>
                              <th className="px-1 py-0.5 text-right">Masuk</th>
                              <th className="px-1 py-0.5 text-right">Keluar</th>
                              <th className="px-1 py-0.5 text-right font-bold border-r border-[#E4E7EC]">Selisih</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F4F7] bg-white text-[10px]">
                        {tab2GroupedMatrix.map(row => (
                          <tr key={row.id_komoditas} className="hover:bg-[#F2F7FD] transition-colors">
                            <td className="px-2.5 py-1.5 font-medium text-[#101828] whitespace-nowrap border-r border-[#E4E7EC]">{row.komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}</td>
                            {REF_WILAYAH.map(w => {
                              const c = row.wilayahData[w.nama_kab_kota] || { masuk: 0, keluar: 0, selisih: 0 };
                              return (
                                <React.Fragment key={`c-${w.id_kab_kota}`}>
                                  <td className="px-1 py-1 text-right font-mono text-[#667085]">{c.masuk || '-'}</td>
                                  <td className="px-1 py-1 text-right font-mono text-[#667085]">{c.keluar || '-'}</td>
                                  <td className={`px-1 py-1 text-right font-mono border-r border-[#E4E7EC] ${c.selisih > 0 ? 'text-[#12B76A] font-bold' : c.selisih < 0 ? 'text-[#F04438] font-bold' : 'text-[#98A2B3]'}`}>
                                    {c.selisih > 0 ? c.selisih : c.selisih < 0 ? `(${Math.abs(c.selisih)})` : '-'}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">
                  Data volume masuk, keluar dan selisih bersih agregat dalam satuan Ton
                </div>
              </div>

              {/* Right: Butterfly Chart */}
              <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                      Arus Masuk vs Keluar ({selectedPeriode})
                    </h3>
                    <div className="flex items-center gap-2.5 text-[10px]">
                      <span className="flex items-center gap-1 text-[#1E74C7] font-semibold"><span className="w-2 h-2 rounded-full bg-[#1E74C7]"></span>Masuk</span>
                      <span className="flex items-center gap-1 text-[#17B6A7] font-semibold"><span className="w-2 h-2 rounded-full bg-[#17B6A7]"></span>Keluar</span>
                    </div>
                  </div>

                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={butterflyData.slice(0, 7)}
                        stackOffset="sign"
                        margin={{ top: 5, right: 10, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F2F4F7" />
                        <XAxis type="number" tick={{ fontSize: 9, fill: '#667085' }} tickFormatter={(val) => `${Math.abs(val)}`} />
                        <YAxis type="category" dataKey="komoditas" tick={{ fontSize: 9, fill: '#667085' }} width={65} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                          itemStyle={{ color: '#ffffff' }}
                          labelStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(value, name) => [`${Math.abs(value).toLocaleString('id-ID')} Ton`, name === 'volKeluar' ? 'Keluar' : 'Masuk']}
                        />
                        <Bar dataKey="volMasuk" fill="#1E74C7" radius={[0, 4, 4, 0]} name="volMasuk" />
                        <Bar dataKey={(entry) => -entry.volKeluar} fill="#17B6A7" radius={[4, 0, 0, 4]} name="volKeluar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">
                  Perbandingan simetris volume masuk (kanan) vs keluar (kiri)
                </div>
              </div>

            </div>

            {/* Bottom Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              
              {/* Panel 1: Selisih Komoditas Chart */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">Selisih Komoditas (Net)</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selisihData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 15, left: 35, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                        <XAxis type="number" tick={{ fontSize: 9, fill: '#667085' }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#667085' }} width={55} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#071D3D', borderRadius: '10px', border: '1px solid #1E74C7', color: '#ffffff', fontSize: '11px' }}
                          itemStyle={{ color: '#ffffff' }}
                          labelStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(val) => [`${val.toLocaleString('id-ID')} ${unitLabel}`, 'Selisih']}
                        />
                        <Bar dataKey="selisih" radius={[0, 4, 4, 0]}>
                          {selisihData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isPositive ? '#12B76A' : '#F04438'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">
                  Hijau: Surplus (Masuk &gt; Keluar) &bull; Merah: Defisit
                </div>
              </div>

              {/* Panel 2: Decomposition Tree Mock */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
                    Dekomposisi Wilayah: {komoditasLabel}
                  </h3>
                  
                  <div className="border border-[#E4E7EC] rounded-xl p-3 bg-[#F9FAFB]/70">
                    <div className="flex items-center justify-between text-xs font-bold text-[#101828] border-b border-[#E4E7EC] pb-1.5 mb-2">
                      <span>Total DIY ({komoditasLabel})</span>
                      <span className="font-mono text-[#12B76A] font-bold">
                        {tab2Decomposition.reduce((s, d) => s + (Number(d.selisih) || 0), 0).toFixed(1)} {unitLabel}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {tab2Decomposition.map((d) => (
                        <div key={d.wilayah} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-[#E4E7EC]">
                          <span className="text-[#344054] font-medium">&bull; {d.wilayah}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#667085] text-[9.5px]">M: {d.masuk} | K: {d.keluar}</span>
                            <span className={`font-mono font-bold w-8 text-right ${d.isPositive ? 'text-[#12B76A]' : 'text-[#F04438]'}`}>{d.selisih}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#667085] text-center pt-2 border-t border-[#F2F4F7]">
                  Pohon dekomposisi rantai pasok wilayah
                </div>
              </div>

              {/* Panel 3: Detail Responden Table */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Detail Responden</h3>
                    <div className="relative w-28">
                      <Search className="w-3 h-3 text-[#667085] absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-6 pr-2 py-1 text-[10px] bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg outline-none focus:border-[#1E74C7]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl max-h-40">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-[#F9FAFB] text-[#344054] font-semibold sticky top-0">
                        <tr className="border-b border-[#E4E7EC]">
                          <th className="px-2.5 py-1.5">Nama Responden</th>
                          <th className="px-1.5 py-1.5">id_responden</th>
                          <th className="px-1.5 py-1.5">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F4F7] bg-white">
                        {paginatedRespondents.map((resp) => (
                          <tr key={resp.id_responden} className="hover:bg-[#F2F7FD] transition-colors">
                            <td className="px-2.5 py-1.5 font-medium text-[#101828] truncate max-w-[110px]">{resp.nama_responden}</td>
                            <td className="px-1.5 py-1.5 font-mono text-[#667085] text-[9px] truncate max-w-[80px]">{resp.id_responden}</td>
                            <td className="px-1.5 py-1.5 text-[#344054] truncate max-w-[70px]">{resp.tipe_responden}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F2F4F7] text-[10px] text-[#667085]">
                  <span>{filteredRespondents.length} responden</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 border border-[#E4E7EC] rounded-md disabled:opacity-30 hover:bg-[#F2F4F7] cursor-pointer">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="font-mono">{currentPage}/{totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 border border-[#E4E7EC] rounded-md disabled:opacity-30 hover:bg-[#F2F4F7] cursor-pointer">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

      </div>

    </div>
  );
}
