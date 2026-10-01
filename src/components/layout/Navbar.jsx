// Polished Website Navbar (Clean, Single-line, Modern)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Landmark, RefreshCw, Menu, X } from 'lucide-react';

export function Navbar() {
  const { activeTab, setActiveTab, lastSyncTime, refreshData, isLoading, data, selectedPeriode } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'tab1', label: 'Ringkasan Utama' },
    { id: 'tab2', label: 'Detail Masuk vs Keluar' },
    { id: 'tab3', label: 'Harga & Marjin' },
    { id: 'tab4', label: 'Tren Antarwaktu' },
    { id: 'tab5', label: 'Peta Arus Pangan' },
  ];


  const currentPeriod = (data?.REF_KALENDER || []).find(k => k.id_periode === selectedPeriode) || (data?.REF_KALENDER || [])[(data?.REF_KALENDER || []).length - 1];
  const periodBadge = currentPeriod ? currentPeriod.label_singkat : '2026-W38';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <nav className="bg-white border-b border-[#E4E7EC] sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left: Brand Logo & Title (BI Institutional) */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-[#0A2E5C] text-white flex items-center justify-center shrink-0 shadow-sm border border-[#071D3D]/10">
              <Landmark className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#101828] tracking-tight whitespace-nowrap">
                  Dashboard Komoditas DIY
                </span>
                <span className="text-[10px] font-bold text-[#0D3E77] bg-[#DCEAFA] px-2 py-0.5 rounded-full border border-[#B3D4F2]">
                  2026
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5 whitespace-nowrap hidden sm:block">
                Bank Indonesia KPw DIY &bull; PSEKUIN UPN Veteran Yogyakarta
              </p>
            </div>
          </div>

          {/* 2. Center: Segmented Pill Navigation (§5.11) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#F2F4F7] p-1.5 rounded-full border border-[#E4E7EC] shrink-0">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0D3E77] font-bold shadow-xs'
                      : 'text-[#667085] hover:text-[#101828] hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* 3. Right: Live Badge & Action Button */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Live Data Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F7FD] border border-[#B3D4F2] text-xs text-[#0D3E77] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse"></span>
              <span>{periodBadge} &bull; {lastSyncTime}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0D3E77] bg-white hover:bg-[#F2F7FD] border border-[#D0D5DD] rounded-full transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1E74C7] ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
              <span>{isRefreshing || isLoading ? 'Sinkron...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#344054] hover:text-[#101828] rounded-xl border border-[#E4E7EC] hover:bg-[#F2F4F7] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E4E7EC] py-3 space-y-1 bg-white">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#F2F7FD] text-[#0D3E77] font-bold border border-[#B3D4F2]'
                      : 'text-[#667085] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1E74C7]"></span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
