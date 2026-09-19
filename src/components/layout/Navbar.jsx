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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Dashboard Komoditas DIY
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap hidden sm:block">
                Bank Indonesia KPw DIY &bull; PSEKUIN UPN VY
              </p>
            </div>
          </div>

          {/* 2. Center: Website Nav Links (Single-Line, No Wrapping) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shrink-0">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* 3. Right: Status Indicator & Refresh Button */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Live Data Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{periodBadge} &bull; {lastSyncTime}</span>
            </div>

            {/* Clean Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
              <span>{isRefreshing || isLoading ? 'Sinkron...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-4 space-y-1.5 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === link.id ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex">
            <button
              onClick={() => { handleRefresh(); setIsMobileMenuOpen(false); }}
              className="w-full py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-center"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
