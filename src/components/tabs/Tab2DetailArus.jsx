import React, { useState, useMemo } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_WILAYAH } from '../../data/seedData';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { formatDecimal } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';
import { PasswordModal } from '../common/PasswordModal';
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
  Lock,
  Unlock,
  FileSpreadsheet
} from 'lucide-react';

export function Tab2DetailArus() {
  const calculations = useCalculations();
  const {
    selectedPeriode,
    selectedKomoditas = 'Beras Medium I',
    selectedWilayah,
    selectedKlaster,
    isRespondentUnlocked
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const butterflyChartData = useMemo(() => {
    return (butterflyData || []).map(b => ({
      ...b,
      name: (b.komoditas || b.name || '').replace(' (Ton)', '').replace(' (Liter)', ''),
      masukNeg: -Math.abs(b.volMasuk || 0),
      volKeluar: Math.abs(b.volKeluar || 0)
    }));
  }, [butterflyData]);

  const selisihData = useMemo(() => {
    return butterflyData.map(b => ({
      name: (b.name || b.komoditas).replace(' (Ton)', '').replace(' (Liter)', ''),
      selisih: b.neraca,
      isPositive: b.neraca >= 0
    })).sort((a, b) => b.selisih - a.selisih);
  }, [butterflyData]);

  const handleExportRespondents = () => {
    exportToExcel(
      filteredRespondents.map(r => ({
        'ID Responden': isRespondentUnlocked ? r.id_responden : '••••••••',
        'Nama Responden / Usaha': isRespondentUnlocked ? r.nama_responden : 'Data Tersandi',
        'Tipe Responden': r.tipe_responden,
        'Kabupaten/Kota': r.kabupaten,
        'Status': r.status || 'Aktif'
      })),
      `Detail_Responden_TIRTA_${selectedPeriode}.xlsx`,
      'Detail Responden'
    );
  };

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar
        showBadge={true}
        title="Tab 2 — Detail Arus Masuk, Keluar & Dekomposisi Distrik"
        subtitle="Analisis perbandingan pasokan luar wilayah vs re-ekspor dan profil responden pedagang/produsen"
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="space-y-3">
        
        {/* Top: 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#DCEAFA] text-[#12539E] flex items-center justify-center shrink-0">
              <ArrowRightCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Total Arus Masuk
              </span>
              <span className="text-base font-bold text-slate-900 tabular-nums block">
                {formatDecimal(currentMetrics.volMasuk, 2)} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
              </span>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <ArrowLeftCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Total Arus Keluar
              </span>
              <span className="text-base font-bold text-slate-900 tabular-nums block">
                {formatDecimal(currentMetrics.volKeluar, 2)} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
              </span>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              currentMetrics.neracaBersih >= 0 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-rose-50 text-rose-600'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Selisih Net (Neraca)
              </span>
              <span className={`text-base font-bold tabular-nums block ${
                currentMetrics.neracaBersih >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {currentMetrics.neracaBersih > 0 ? `+${formatDecimal(currentMetrics.neracaBersih, 2)}` : formatDecimal(currentMetrics.neracaBersih, 2)} <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
              </span>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Jumlah Responden
              </span>
              <span className="text-base font-bold text-slate-900 tabular-nums block">
                {filteredRespondents.length} <span className="text-xs font-normal text-slate-500">Usaha</span>
              </span>
            </div>
          </div>

          <div className="clean-card p-4 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Komoditas Aktif
              </span>
              <span className="text-sm font-bold text-slate-900 truncate block max-w-[110px]" title={komoditasLabel}>
                {komoditasLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Intelligence Box */}
        <ExecutiveIntelligenceBox tabId="tab2" title="Executive Intelligence · Modul Arus & Dekomposisi Distrik" />

        {/* Middle Section: Butterfly Chart & Selisih Komoditas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Butterfly Chart */}
          <div className="clean-card p-4 lg:col-span-7 bg-white flex flex-col justify-between" id="chart-tab2-butterfly">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Profil Arus Masuk vs Keluar ({unitLabel})
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Membandingkan pasokan luar DIY (Kiri) vs penjualan re-ekspor (Kanan) per komoditas
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#1E74C7]">
                    <span className="w-2 h-2 rounded-full bg-[#1E74C7]"></span> Arus Masuk
                  </span>
                  <span className="flex items-center gap-1 text-[#0284C7]">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span> Arus Keluar
                  </span>
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={butterflyChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
                    stackOffset="sign"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={(val) => Math.abs(val)} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val, name) => [
                        `${Math.abs(val)} ${unitLabel}`,
                        name === 'masukNeg' ? 'Arus Masuk (Pasokan)' : 'Arus Keluar (Distribusi)'
                      ]}
                    />
                    <Bar dataKey="masukNeg" fill="#1E74C7" stackId="stack" radius={[4, 0, 0, 4]} />
                    <Bar dataKey="volKeluar" fill="#0284C7" stackId="stack" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 mt-2">
              Sisi kiri mewakili ketergantungan pasokan luar. Sisi kanan mewakili tingkat distribusi keluar DIY.
            </div>
          </div>

          {/* Right: Selisih Komoditas Chart */}
          <div className="clean-card p-4 lg:col-span-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Selisih Net per Komoditas ({unitLabel})
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Hijau = Surplus Net (Net Inflow), Merah = Defisit Net (Net Outflow)
                  </p>
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selisihData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748B' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val) => [`${val > 0 ? '+' : ''}${val} ${unitLabel}`, 'Selisih Net']}
                    />
                    <Bar dataKey="selisih" radius={[0, 4, 4, 0]}>
                      {selisihData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isPositive ? '#10B981' : '#F43F5E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 mt-2">
              Nilai positif mengindikasikan akumulasi stok lokal; negatif mengindikasikan net-exporter.
            </div>
          </div>

        </div>

        {/* Bottom Section: Matriks Arus & Daftar Responden */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left: Matriks Arus Masuk-Keluar per Kab/Kota */}
          <div className="clean-card p-4 lg:col-span-8 bg-white flex flex-col justify-between" id="table-tab2-matrix">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Matriks Arus Masuk, Keluar & Selisih per Kab/Kota ({unitLabel})
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Dekomposisi volume per kabupaten/kota di wilayah D.I. Yogyakarta
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-xl max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 text-[10px] font-semibold sticky top-0">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 bg-slate-100" rowSpan="2">Komoditas</th>
                      {REF_WILAYAH.map(w => (
                        <th key={w.id_kab_kota} colSpan="3" className="px-2 py-1 text-center border-l border-slate-200">
                          {w.nama_kab_kota.replace('Kab. ', '')}
                        </th>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 text-[9px]">
                      {REF_WILAYAH.map(w => (
                        <React.Fragment key={`${w.id_kab_kota}-sub`}>
                          <th className="px-1.5 py-1 text-right text-[#1E74C7] border-l border-slate-200">Masuk</th>
                          <th className="px-1.5 py-1 text-right text-[#0284C7]">Keluar</th>
                          <th className="px-1.5 py-1 text-right font-bold text-slate-900">Selisih</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-[10.5px]">
                    {tab2GroupedMatrix.map(row => (
                      <tr key={row.id_komoditas} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-1.5 font-medium text-slate-800 whitespace-nowrap bg-slate-50/30">
                          {row.komoditas.replace(' (Ton)', '').replace(' (Liter)', '')}
                        </td>
                        {REF_WILAYAH.map(w => {
                          const dataKab = row.wilayahData?.[w.nama_kab_kota] || { masuk: 0, keluar: 0, selisih: 0 };
                          const isSurplus = dataKab.selisih >= 0;
                          return (
                            <React.Fragment key={`${w.id_kab_kota}-val`}>
                              <td className="px-1.5 py-1.5 text-right font-mono text-[#1E74C7] border-l border-slate-100">
                                {dataKab.masuk > 0 ? formatDecimal(dataKab.masuk, 2) : '—'}
                              </td>
                              <td className="px-1.5 py-1.5 text-right font-mono text-[#0284C7]">
                                {dataKab.keluar > 0 ? formatDecimal(dataKab.keluar, 2) : '—'}
                              </td>
                              <td className={`px-1.5 py-1.5 text-right font-mono font-bold ${
                                dataKab.selisih === 0 ? 'text-slate-400' : isSurplus ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {dataKab.selisih !== 0 ? (isSurplus ? `+${formatDecimal(dataKab.selisih, 2)}` : formatDecimal(dataKab.selisih, 2)) : '—'}
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

            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 mt-2">
              Selisih = (Masuk - Keluar). Nilai positif menunjukkan surplus pasokan kabupaten.
            </div>
          </div>

          {/* Right: Responden List with Password Modal Trigger */}
          <div className="clean-card p-4 lg:col-span-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Responden Survei
                  </h3>
                  <p className="text-[10px] text-slate-500">Sampling pedagang &amp; produsen</p>
                </div>
                
                {/* Export & Lock Status Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportRespondents}
                    title="Export daftar responden ke Excel"
                    className="p-1 rounded-lg text-[#0D3E77] bg-[#F2F7FD] hover:bg-[#DCEAFA] border border-[#B3D4F2] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setShowPasswordModal(true)}
                    title={isRespondentUnlocked ? 'Identitas Terbuka (Authorized)' : 'Klik untuk Buka Password Otorisasi'}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isRespondentUnlocked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#0A2E5C] text-white hover:bg-[#071D3D] shadow-xs'
                    }`}
                  >
                    {isRespondentUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>Terbuka</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-[#C89B3C]" />
                        <span>Buka Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full mb-2">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Responden..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-7 pr-2 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#1E74C7]"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl max-h-40">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0">
                    <tr className="border-b border-slate-200">
                      <th className="px-2.5 py-1.5">Nama Responden</th>
                      <th className="px-1.5 py-1.5">id_responden</th>
                      <th className="px-1.5 py-1.5">Tipe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedRespondents.map((resp, idx) => (
                      <tr key={resp.id_responden || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2.5 py-1.5 font-medium text-slate-900 truncate max-w-[110px]">
                          {isRespondentUnlocked ? (
                            resp.nama_responden
                          ) : (
                            <span className="text-slate-400 font-mono select-none">
                              Responden #{((currentPage - 1) * itemsPerPage) + idx + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 font-mono text-slate-500 text-[9px] truncate max-w-[80px]">
                          {isRespondentUnlocked ? resp.id_responden : '••••••••'}
                        </td>
                        <td className="px-1.5 py-1.5 text-slate-600 truncate max-w-[70px]">{resp.tipe_responden}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination & Status Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <span>{filteredRespondents.length} responden</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-slate-200 rounded-md disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="font-mono">{currentPage}/{totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-slate-200 rounded-md disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Password Modal Popup Triggered Directly by Action Buttons */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Otorisasi Akses Responden TPID"
        subtitle="Masukkan Kata Sandi / PIN Otorisasi TPID BI DIY untuk membuka identitas responden tersandi."
      />

    </div>
  );
}
