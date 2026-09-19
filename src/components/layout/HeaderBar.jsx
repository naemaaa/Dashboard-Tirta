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
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding & Titles */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Landmark className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
                Dashboard Komoditas DIY
              </h1>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                2026
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Data Terverifikasi ({periodLabel})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Kantor Perwakilan Bank Indonesia DIY &bull; PSEKUIN UPN Veteran Yogyakarta
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block mr-1">
            <span className="text-[11px] text-slate-500 font-medium block">
              {syncSource} &bull; {lastSyncTime}
            </span>
          </div>

          <button
            onClick={() => setDataModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Kelola Sumber Data Excel / OneDrive"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sumber Data Excel</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh / Sinkronisasi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || isLoading ? 'Sinkron...' : 'Refresh'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
