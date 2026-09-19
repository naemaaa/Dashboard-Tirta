import React, { useState, useMemo } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER } from '../../data/seedData';
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
  RotateCcw,
  ArrowLeftRight
} from 'lucide-react';

export function Tab2DetailArus() {
  const calculations = useCalculations();
  const {
    selectedPeriode,
    setSelectedPeriode,
    tab2Komoditas,
    tab2Kabupaten,
    tab2Responden,
    setTab2Filters,
    resetFilters
  } = useDashboardStore();

  const {
    currentMetrics,
    tab2GroupedMatrix,
    tab2Decomposition,
    butterflyData,
    respondents
  } = calculations;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    resetFilters();
    setTab2Filters({ tab2Komoditas: 'Semua', tab2Kabupaten: 'Semua', tab2Responden: 'Semua' });
    setTimeout(() => setIsResetting(false), 500);
  };

  const filteredRespondents = useMemo(() => {
    return respondents.filter(r => {
      const matchSearch =
        r.nama_responden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id_responden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kabupaten.toLowerCase().includes(searchTerm.toLowerCase());

      const matchKab = tab2Kabupaten === 'Semua' || r.kabupaten === tab2Kabupaten;
      const matchResp =
        tab2Responden === 'Semua' ||
        (tab2Responden === 'Pedagang Besar' && r.tipe_responden.includes('Pedagang')) ||
        (tab2Responden === 'Produsen' && r.tipe_responden.includes('Produsen'));

      return matchSearch && matchKab && matchResp;
    });
  }, [respondents, searchTerm, tab2Kabupaten, tab2Responden]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredRespondents.length / itemsPerPage) || 1;
  const paginatedRespondents = filteredRespondents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selisihData = useMemo(() => {
    return butterflyData.map(b => ({
      name: b.komoditas,
      selisih: b.neraca,
      isPositive: b.neraca >= 0
    })).sort((a, b) => b.selisih - a.selisih);
  }, [butterflyData]);

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Slicers Bar */}
      <div className="clean-card p-4 bg-white space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Detail Arus Komoditas DIY (Masuk vs Keluar)
                </h2>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  Neraca & Matriks Arus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Analisis komparasi volume pasokan masuk, pasokan keluar, disparitas komoditas dan direktori responden
              </p>
            </div>
          </div>
        </div>

        {/* 5-Column Precision Slicer & Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Periode</label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Periode</option>
              {REF_KALENDER.map((k) => (
                <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Komoditas</label>
            <select
              value={tab2Komoditas}
              onChange={(e) => setTab2Filters({ tab2Komoditas: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Komoditas</option>
              {REF_KOMODITAS.map(k => (
                <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kabupaten</label>
            <select
              value={tab2Kabupaten}
              onChange={(e) => setTab2Filters({ tab2Kabupaten: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Wilayah</option>
              {REF_WILAYAH.map(w => (
                <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Responden</label>
            <select
              value={tab2Responden}
              onChange={(e) => setTab2Filters({ tab2Responden: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Responden</option>
              <option value="Pedagang Besar">Pedagang Besar</option>
              <option value="Produsen">Produsen</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleReset}
              className="w-full h-[38px] flex items-center justify-center gap-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Reset Semua Filter ke Nilai Default"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="space-y-3">
        
        {/* Top: 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ArrowRightCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume Masuk</div>
              <div className="text-base font-extrabold text-slate-900">{currentMetrics.volMasuk.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ArrowLeftCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume Keluar</div>
              <div className="text-base font-extrabold text-slate-900">{currentMetrics.volKeluar.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${currentMetrics.neracaBersih >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Selisih Volume</div>
              <div className={`text-base font-extrabold ${currentMetrics.neracaBersih >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currentMetrics.neracaBersih >= 0 ? '+' : ''}{currentMetrics.neracaBersih.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Ton
              </div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Responden</div>
              <div className="text-base font-extrabold text-slate-900">{filteredRespondents.length}</div>
            </div>
          </div>

          <div className="clean-card p-3 flex items-center gap-2.5 bg-white">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sigma className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Data Terekam</div>
              <div className="text-base font-extrabold text-slate-900">{currentMetrics.countRecords * 2}</div>
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
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Arus Masuk, Keluar, & Selisih per Komoditas × Kab/Kota
                    </h3>
                    <span className="text-[10px] text-slate-400">Ton</span>
                  </div>
                  <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-60">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 text-[10px] font-semibold sticky top-0">
                        <tr className="border-b border-slate-200">
                          <th rowSpan="2" className="px-2.5 py-1.5 border-r border-slate-200 bg-slate-50">Komoditas</th>
                          {REF_WILAYAH.map(w => (
                            <th key={w.id_kab_kota} colSpan="3" className="px-1.5 py-1 text-center border-r border-slate-200">{w.nama_kab_kota.replace('Kab. ', '')}</th>
                          ))}
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[9px] text-slate-500">
                          {REF_WILAYAH.map(w => (
                            <React.Fragment key={`sub-${w.id_kab_kota}`}>
                              <th className="px-1 py-0.5 text-right">Masuk</th>
                              <th className="px-1 py-0.5 text-right">Keluar</th>
                              <th className="px-1 py-0.5 text-right font-bold border-r border-slate-200">Selisih</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-[10px]">
                        {tab2GroupedMatrix.map(row => (
                          <tr key={row.id_komoditas} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2.5 py-1 font-medium text-slate-800 whitespace-nowrap border-r border-slate-100">{row.komoditas.replace(' (Ton)', '')}</td>
                            {REF_WILAYAH.map(w => {
                              const c = row.wilayahData[w.nama_kab_kota] || { masuk: 0, keluar: 0, selisih: 0 };
                              return (
                                <React.Fragment key={`c-${w.id_kab_kota}`}>
                                  <td className="px-1 py-1 text-right font-mono text-slate-500">{c.masuk || '-'}</td>
                                  <td className="px-1 py-1 text-right font-mono text-slate-500">{c.keluar || '-'}</td>
                                  <td className={`px-1 py-1 text-right font-mono border-r border-slate-100 ${c.selisih > 0 ? 'text-emerald-700 font-bold' : c.selisih < 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
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
                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                  Data volume masuk, keluar dan selisih bersih agregat
                </div>
              </div>

              {/* Right: Butterfly Chart */}
              <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Arus Masuk vs Keluar ({selectedPeriode})
                    </h3>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="flex items-center gap-1 text-blue-700 font-semibold"><span className="w-2 h-2 rounded bg-blue-700"></span>Masuk</span>
                      <span className="flex items-center gap-1 text-orange-600 font-semibold"><span className="w-2 h-2 rounded bg-orange-600"></span>Keluar</span>
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
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(val) => `${Math.abs(val)}`} />
                        <YAxis type="category" dataKey="komoditas" tick={{ fontSize: 9 }} width={65} />
                        <Tooltip
                          formatter={(value, name) => [`${Math.abs(value).toLocaleString('id-ID')} Ton`, name === 'volKeluar' ? 'Keluar' : 'Masuk']}
                          labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="volMasuk" fill="#1D4ED8" radius={[0, 4, 4, 0]} name="volMasuk" />
                        <Bar dataKey={(entry) => -entry.volKeluar} fill="#EA580C" radius={[4, 0, 0, 4]} name="volKeluar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                  Perbandingan simetris volume masuk (kanan) vs keluar (kiri)
                </div>
              </div>

            </div>

            {/* Bottom Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              
              {/* Panel 1: Selisih Komoditas Chart */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Selisih Komoditas (Net)</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selisihData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 15, left: 35, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis type="number" tick={{ fontSize: 9 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={55} />
                        <Tooltip formatter={(val) => [`${val.toLocaleString('id-ID')} Ton`, 'Selisih']} />
                        <Bar dataKey="selisih" radius={[0, 4, 4, 0]}>
                          {selisihData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isPositive ? '#059669' : '#E11D48'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                  Hijau: Surplus (Masuk &gt; Keluar) &bull; Merah: Defisit
                </div>
              </div>

              {/* Panel 2: Decomposition Tree Mock */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Dekomposisi Wilayah: {tab2Komoditas.replace(' (Ton)', '')}
                  </h3>
                  
                  <div className="border border-slate-200/80 rounded-lg p-2.5 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
                      <span>Total DIY ({tab2Komoditas.replace(' (Ton)', '')})</span>
                      <span className="font-mono text-emerald-700">
                        {tab2Decomposition.reduce((s, d) => s + d.selisih, 0).toFixed(1)} Ton
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {tab2Decomposition.map((d) => (
                        <div key={d.wilayah} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200/60">
                          <span className="text-slate-700 font-medium">&bull; {d.wilayah}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[9px]">M: {d.masuk} | K: {d.keluar}</span>
                            <span className={`font-mono font-bold w-7 text-right ${d.isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>{d.selisih}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                  Pohon dekomposisi rantai pasok wilayah
                </div>
              </div>

              {/* Panel 3: Detail Responden Table */}
              <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detail Responden</h3>
                    <div className="relative w-28">
                      <Search className="w-3 h-3 text-slate-400 absolute left-1.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-5 pr-1.5 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200/80 rounded-lg max-h-40">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0">
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1">Nama Responden</th>
                          <th className="px-1.5 py-1">id_responden</th>
                          <th className="px-1.5 py-1">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedRespondents.map((resp) => (
                          <tr key={resp.id_responden} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-1 font-medium text-slate-900 truncate max-w-[100px]">{resp.nama_responden}</td>
                            <td className="px-1.5 py-1 font-mono text-slate-400 text-[9px] truncate max-w-[80px]">{resp.id_responden}</td>
                            <td className="px-1.5 py-1 text-slate-600 truncate max-w-[70px]">{resp.tipe_responden}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-500">
                  <span>{filteredRespondents.length} responden</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-0.5 border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-100 cursor-pointer">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="font-mono">{currentPage}/{totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-0.5 border border-slate-200 rounded disabled:opacity-30 hover:bg-slate-100 cursor-pointer">
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
