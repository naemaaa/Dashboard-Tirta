import React, { useEffect } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { Navbar } from './components/layout/Navbar';
import { Tab1RingkasanUtama } from './components/tabs/Tab1RingkasanUtama';
import { Tab2DetailArus } from './components/tabs/Tab2DetailArus';
import { Tab3HargaMarjin } from './components/tabs/Tab3HargaMarjin';
import { Tab4TrenAntarwaktu } from './components/tabs/Tab4TrenAntarwaktu';
import { DataModal } from './components/common/DataModal';
import { AlertCircle, Landmark } from 'lucide-react';

export function App() {
  const { activeTab, loadInitialData, error } = useDashboardStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-slate-900 selection:text-white">
      
      {/* 1. Website Navbar (Page navigation inside Navbar) */}
      <Navbar />

      {/* 2. Main Page Content (Slicers are inside each page) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Alert if any */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Page Views with Internal Slicers */}
        {activeTab === 'tab1' && <Tab1RingkasanUtama />}
        {activeTab === 'tab2' && <Tab2DetailArus />}
        {activeTab === 'tab3' && <Tab3HargaMarjin />}
        {activeTab === 'tab4' && <Tab4TrenAntarwaktu />}

      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-700">
              Kajian Aliran Komoditas Strategis DIY 2026
            </span>
            <span className="text-slate-300">&bull;</span>
            <span>Kantor Perwakilan Bank Indonesia DIY</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Kerjasama: <strong>PSEKUIN UPN Veteran Yogyakarta</strong></span>
            <span className="text-slate-300">&bull;</span>
            <span>Versi: <strong>v1.0 (Produksi)</strong></span>
          </div>
        </div>
      </footer>

      {/* 4. Excel Upload & OneDrive Modal */}
      <DataModal />

    </div>
  );
}

export default App;
