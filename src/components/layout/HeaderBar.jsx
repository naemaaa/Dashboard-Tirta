// Clean, Minimalist Header Bar
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { RefreshCw, UploadCloud, ShieldCheck, Landmark } from 'lucide-react';

export function HeaderBar() {
  const { lastSyncTime, syncSource, refreshData, isLoading, setDataModalOpen, data, selectedPeriode } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentPeriod = (data?.REF_KALENDER || []).find(k => k.id_periode === selectedPeriode) || (data?.REF_KALENDER || [])[(data?.REF_KALENDER || []).length - 1];
  const periodLabel = currentPeriod ? currentPeriod.label_singkat : '2026-W38';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
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
                Data Terverifikasi ({periodLabel})
              </span>
            </div>
            <p className="text-[11px] text-[#667085] hidden sm:block">
              Kantor Perwakilan Bank Indonesia DIY &bull; PSEKUIN UPN Veteran Yogyakarta
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block mr-1">
            <span className="text-[11px] text-[#667085] font-medium block">
              {syncSource} &bull; {lastSyncTime}
            </span>
          </div>

          <button
            onClick={() => setDataModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#344054] bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl transition-colors shadow-2xs"
            title="Kelola Sumber Data Excel / OneDrive"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#667085]" />
            <span className="hidden sm:inline">Sumber Data Excel</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A2E5C] hover:bg-[#071D3D] rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh / Sinkronisasi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#DCEAFA] ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || isLoading ? 'Sinkron...' : 'Refresh'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
