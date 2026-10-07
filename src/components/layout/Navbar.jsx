// Premium Executive Navbar (Single-line, perfectly aligned with max-w-7xl content grid)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  Landmark,
  RefreshCw,
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  TrendingUp,
  MapPin,
  AlertOctagon,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    lastSyncTime,
    refreshData,
    isLoading,
    data,
    selectedPeriode
  } = useDashboardStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'tab1', label: 'Ringkasan Utama', short: 'Ringkasan', icon: LayoutDashboard },
    { id: 'tab2', label: 'Detail Arus',      short: 'Arus',      icon: ArrowLeftRight  },
    { id: 'tab3', label: 'Harga & Marjin',  short: 'Harga',     icon: Coins           },
    { id: 'tab4', label: 'Tren Antarwaktu',  short: 'Tren',      icon: TrendingUp      },
    { id: 'tab5', label: 'Peta Arus',        short: 'Peta',      icon: MapPin          },
    { id: 'tab7', label: 'Early Warning',    short: 'EWS',       icon: AlertOctagon    },
    { id: 'tab8', label: 'Metadata & Metodologi', short: 'Metadata', icon: BookOpen    },
  ];

  const currentPeriod = (data?.REF_KALENDER || []).find(k => k.id_periode === selectedPeriode)
    || (data?.REF_KALENDER || []).at(-1);
  const periodBadge = currentPeriod?.label_singkat ?? '2026-W38';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <nav className="bg-white border-b border-[#E4E7EC] sticky top-0 z-50 shadow-2xs">
      {/* Container aligned EXACTLY with max-w-7xl content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#0A2E5C] text-white flex items-center justify-center shrink-0 shadow-xs border border-[#071D3D]/20">
              <Landmark className="w-4 h-4 text-[#C89B3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-[#101828] tracking-tight whitespace-nowrap">
                  Dashboard Komoditas DIY
                </span>
                <span className="text-[10px] font-bold text-[#0D3E77] bg-[#DCEAFA] px-2 py-0.5 rounded-full border border-[#B3D4F2] shrink-0">
                  2026
                </span>
              </div>
              <p className="text-[10.5px] text-[#667085] hidden xl:block leading-none mt-0.5 whitespace-nowrap">
               TPID DIY &bull;   BI KPw DIY&bull; PSEKUIN UPN
              </p>
            </div>
          </div>

          {/* 2. Center: Segmented Navigation Pills (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-full border border-[#E4E7EC] shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0D3E77] font-bold shadow-xs border border-[#D0D5DD]/40'
                      : 'text-[#667085] hover:text-[#101828] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1E74C7]' : 'text-[#98A2B3]'}`} />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Right: Status Badge & Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F7FD] border border-[#B3D4F2] text-[11px] text-[#0D3E77] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse shrink-0" />
              <span className="font-semibold">{periodBadge}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D3E77] bg-white hover:bg-[#F2F7FD] border border-[#D0D5DD] rounded-full transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh / Sinkronisasi Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1E74C7] ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{(isRefreshing || isLoading) ? 'Sinkron...' : 'Refresh'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(o => !o)}
              className="md:hidden p-1.5 text-[#344054] hover:text-[#101828] rounded-xl border border-[#E4E7EC] hover:bg-[#F2F4F7] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E7EC] py-2.5 space-y-1 bg-white">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#F2F7FD] text-[#0D3E77] font-bold border border-[#B3D4F2]'
                      : 'text-[#667085] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E74C7]' : 'text-[#98A2B3]'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#1E74C7]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
