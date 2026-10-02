// Page-wide Excel & Full Tab Data Exporter with Password Authorization Modal
// Tim Pengendalian Inflasi Daerah DIY · Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_WILAYAH } from '../../data/seedData';
import { exportInsightfulExcel } from '../../utils/exportUtils';
import { PasswordModal } from './PasswordModal';
import { FileSpreadsheet, Download, ChevronDown, Sparkles, Lock, Unlock } from 'lucide-react';

export function PageExportButton({ tabId = null, className = '' }) {
  const calculations = useCalculations();
  const {
    activeTab,
    selectedPeriode,
    isRespondentUnlocked
  } = useDashboardStore();

  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const currentTab = tabId || activeTab || 'tab1';

  // Pull the correct field names from useCalculations
  const {
    currentMetrics = {},
    historicalTrends = [],
    matrixNeraca = [],
    butterflyData = [],
    tab2GroupedMatrix = [],
    tab2Decomposition = [],
    respondents = [],
    tab3PriceMatrix = [],
    tab3MarginRanking = [],
    tab3RegionPrices = [],
    tab4RegionalDeltas = [],
    tab4CommodityEvolution = [],
    qualitySummaryTable = [],
    qualityByCommodity = [],
    qualityIssues = [],
    qualityByRegion = [],
    top5Origins = [],
    top5Destinations = [],
  } = calculations;

  const getTabLabel = (id) => {
    switch (id) {
      case 'tab1': return 'Tab1_Ringkasan_Utama';
      case 'tab2': return 'Tab2_Detail_Masuk_Keluar';
      case 'tab3': return 'Tab3_Harga_Marjin';
      case 'tab4': return 'Tab4_Tren_Antarwaktu';
      case 'tab5': return 'Tab5_Kualitas_Data';
      default: return 'Laporan_Halaman';
    }
  };

  const maskRespondent = (r, idx) => ({
    'ID Responden': isRespondentUnlocked ? r.id_responden : '••••••••',
    'Nama Responden': isRespondentUnlocked ? r.nama_responden : `Responden #${idx + 1}`,
    'Tipe Responden': r.tipe_responden,
    'Kabupaten/Kota': r.kabupaten,
  });

  const buildExportParams = (periodeStr) => ({
    periodeLabel: periodeStr.replace('PER_', '').replace(/_/g, '-'),
    komoditas: (useDashboardStore.getState?.().selectedKomoditas || 'Semua Komoditas').replace(' (Ton)', '').replace(' (Liter)', ''),
    metrics: {
      volMasuk: currentMetrics.volMasuk ?? 0,
      volKeluar: currentMetrics.volKeluar ?? 0,
      neracaBersih: currentMetrics.neracaBersih ?? 0,
      hargaJual: currentMetrics.hargaJual ?? 0,
      hargaBeli: currentMetrics.hargaBeli ?? 0,
      marginPct: currentMetrics.marginPct ?? 0,
      countRespondents: respondents.length,
    },
    matrixNeraca,
    butterflyData,
    tab2GroupedMatrix,
    tab3PriceMatrix,
    tab3MarginRanking,
    historicalTrends,
    respondents,
    top5Origins,
    top5Destinations,
    isRespondentUnlocked,
    REF_WILAYAH,
  });

  // 1. Export Full Page/Tab into Multi-Sheet Excel Workbook
  const executeExportCurrentTab = () => {
    setDownloading(true);
    const periodeStr = Array.isArray(selectedPeriode) ? selectedPeriode.join('_') : (selectedPeriode || 'All');
    const fileName = `Laporan_${getTabLabel(currentTab)}_${periodeStr}.xlsx`;

    exportInsightfulExcel({
      ...buildExportParams(periodeStr),
      fileName,
    }).finally(() => {
      setDownloading(false);
      setIsOpen(false);
    });
  };

  // 2. Export Master Excel Workbook (ALL DATA)
  const executeExportMasterWorkbook = () => {
    setDownloading(true);
    const periodeStr = Array.isArray(selectedPeriode) ? selectedPeriode.join('_') : (selectedPeriode || 'All');
    const fileName = `Master_Laporan_TIRTA_Dashboard_2026_${periodeStr}.xlsx`;

    exportInsightfulExcel({
      ...buildExportParams(periodeStr),
      fileName,
    }).finally(() => {
      setDownloading(false);
      setIsOpen(false);
    });
  };

  // Guard action with Password Modal if locked
  const handleActionWithAuth = (actionFn) => {
    setIsOpen(false);
    if (isRespondentUnlocked) {
      actionFn();
    } else {
      setPendingAction(() => actionFn);
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <>
      <div className={`relative inline-block text-left ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0A2E5C] hover:bg-[#071D3D] rounded-xl shadow-xs transition-all cursor-pointer border border-[#1E74C7]/40 active:scale-98"
          title="Download laporan Excel (.xlsx) — Memerlukan PIN Otorisasi"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#C89B3C]" />
          <span>Download Full Page Excel</span>
          {isRespondentUnlocked ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#ECFDF3] text-[#027A48] px-1.5 py-0.5 rounded-md border border-[#ABEFC6]">
              <Unlock className="w-2.5 h-2.5 text-[#12B76A]" />
              Akses Terbuka
            </span>
          ) : (
            <Lock className="w-3 h-3 text-[#C89B3C]" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-white border border-[#E4E7EC] rounded-2xl shadow-xl p-2 text-xs space-y-1 animate-in fade-in duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#667085] uppercase tracking-wider border-b border-[#F2F4F7] flex items-center justify-between">
              <span>Opsi Download Laporan</span>
              <Sparkles className="w-3 h-3 text-[#C89B3C]" />
            </div>

            <button
              onClick={() => handleActionWithAuth(executeExportCurrentTab)}
              disabled={downloading}
              className="w-full text-left px-3 py-2.5 hover:bg-[#F2F7FD] rounded-xl transition-colors flex items-center gap-2.5 group cursor-pointer disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                <Download className="w-3.5 h-3.5 text-[#1E74C7]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#101828] flex items-center justify-between">
                  <span>1. Download Halaman Ini</span>
                  {!isRespondentUnlocked && <Lock className="w-3 h-3 text-[#C89B3C]" />}
                </div>
                <div className="text-[10px] text-[#667085]">Multi-sheet Excel berisi seluruh tabel di tab ini</div>
              </div>
            </button>

            <button
              onClick={() => handleActionWithAuth(executeExportMasterWorkbook)}
              disabled={downloading}
              className="w-full text-left px-3 py-2.5 hover:bg-[#F2F7FD] rounded-xl transition-colors flex items-center gap-2.5 group cursor-pointer border-t border-[#F2F4F7] disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#101828] flex items-center justify-between">
                  <span>2. Download Master Workbook</span>
                  {!isRespondentUnlocked && <Lock className="w-3 h-3 text-[#C89B3C]" />}
                </div>
                <div className="text-[10px] text-[#667085]">1 Berkas Excel gabungan seluruh Tab 1 s/d Tab 5</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Password Modal Prompt */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}
