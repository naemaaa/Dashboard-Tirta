// Clean, Minimalist Header Bar — Bank Indonesia KPw DIY
// Pure Read-Only Public Insight Dashboard with Direct 1-Click Refresh Button

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { PageExportButton } from '../common/PageExportButton';
import { ONEDRIVE_MASTER_URL, ONEDRIVE_EWS_URL } from '../../config/env.js';
import { RefreshCw, ShieldCheck, Landmark } from 'lucide-react';

export function HeaderBar() {
  const {
    lastSyncTime,
    syncSource,
    refreshData,
    refreshEwsData,
    isLoading,
    data,
    selectedPeriode,
    activeTab
  } = useDashboardStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentPeriod = (data?.REF_KALENDER || []).find(k => k.id_periode === selectedPeriode) || (data?.REF_KALENDER || [])[(data?.REF_KALENDER || []).length - 1];
  const periodLabel = currentPeriod ? currentPeriod.label_singkat : '2026';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'tab7') {
        await refreshEwsData(ONEDRIVE_EWS_URL);
      } else {
        await refreshData(ONEDRIVE_MASTER_URL);
      }
    } catch (err) {
      console.error('Direct refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding & Titles */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#0A2E5C] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Landmark className="w-5 h-5 text-[#C89B3C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#101828] tracking-tight m-0">
                Dashboard Komoditas DIY
              </h1>
              <span className="text-[11px] font-semibold text-[#0D3E77] bg-[#DCEAFA] px-2 py-0.5 rounded-full border border-[#B9D5F4]">
                2026
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#ABEFC6]">
                <ShieldCheck className="w-3 h-3 text-[#12B76A]" />
                Data Terverifikasi BI DIY
              </span>
            </div>
            <p className="text-[11px] text-[#667085] hidden sm:block">
              Tim Pengendalian Inflasi Daerah DIY &bull; Kantor Perwakilan Bank Indonesia DIY &bull; PSEKUIN UPN Veteran Yogyakarta
            </p>
          </div>
        </div>

        {/* Right: Actions (Exact match to User Screenshot: Status Pill + Refresh Button) */}
        <div className="flex items-center gap-2.5">
          
          {/* Active Period Status Pill (Matching Screenshot: 🟢 2026-W38) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF8FF] border border-[#B2DDFF] text-xs font-bold text-[#0D3E77]">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse shrink-0" />
            <span>{periodLabel}</span>
          </div>

          {/* Direct 1-Click Refresh Button (Matching Screenshot: 🔄 Refresh) */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0D3E77] hover:text-[#0A2E5C] bg-white hover:bg-[#F2F7FD] active:bg-[#E1EFFE] border border-[#B3D4F2] rounded-full transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Sinkronkan data terbaru dari database resmi BI DIY"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1E74C7] ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || isLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>

          {/* Export Report Action */}
          <PageExportButton />

        </div>

      </div>
    </header>
  );
}
