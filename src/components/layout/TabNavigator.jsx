// Modern Segmented Tab Navigator
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { LayoutDashboard, ArrowLeftRight, Coins, TrendingUp, ShieldCheck } from 'lucide-react';

export function TabNavigator() {
  const { activeTab, setActiveTab } = useDashboardStore();

  const tabs = [
    { id: 'tab1', label: 'Ringkasan Utama', icon: LayoutDashboard },
    { id: 'tab2', label: 'Detail Masuk vs Keluar', icon: ArrowLeftRight },
    { id: 'tab3', label: 'Harga Beli & Marjin', icon: Coins },
    { id: 'tab4', label: 'Tren Antarwaktu', icon: TrendingUp },
    { id: 'tab5', label: 'Kualitas Data & SLA', icon: ShieldCheck },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
