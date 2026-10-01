import React, { useEffect } from 'react';
import { useDashboardStore } from './store/useDashboardStore';
import { Navbar } from './components/layout/Navbar';
import { Tab1RingkasanUtama } from './components/tabs/Tab1RingkasanUtama';
import { Tab2DetailArus } from './components/tabs/Tab2DetailArus';
import { Tab3HargaMarjin } from './components/tabs/Tab3HargaMarjin';
import { Tab4TrenAntarwaktu } from './components/tabs/Tab4TrenAntarwaktu';
import { Tab5PetaArus } from './components/tabs/Tab5PetaArus';
import { Tab5KualitasData } from './components/tabs/Tab5KualitasData';
import { DataModal } from './components/common/DataModal';
import { AlertCircle, Landmark } from 'lucide-react';

export function App() {
  const { activeTab, loadInitialData, error } = useDashboardStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen bg-[#F2F7FD] flex flex-col selection:bg-[#0D3E77] selection:text-white">
      
      {/* 1. Website Navbar (Institutional Bank Indonesia Light Theme) */}
      <Navbar />

      {/* 2. Main Page Content (Slicers & Views inside each page) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Alert if any */}
        {error && (
          <div className="mb-6 p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-2xl text-xs text-[#B42318] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-[#F04438] shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Page Views with Internal Slicers */}
        {activeTab === 'tab1' && <Tab1RingkasanUtama />}
        {activeTab === 'tab2' && <Tab2DetailArus />}
        {activeTab === 'tab3' && <Tab3HargaMarjin />}
        {activeTab === 'tab4' && <Tab4TrenAntarwaktu />}
        {activeTab === 'tab5' && <Tab5PetaArus />}
        {activeTab === 'tab6' && <Tab5KualitasData />}

      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-[#E4E7EC] mt-12 py-6 text-xs text-[#667085]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#0A2E5C] flex items-center justify-center text-[#C89B3C] shrink-0">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-[#101828]">
              Kajian Aliran Komoditas Strategis DIY 2026
            </span>
            <span className="text-[#D0D5DD]">&bull;</span>
            <span>Kantor Perwakilan Bank Indonesia Daerah Istimewa Yogyakarta</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#667085]">
            <span>Kerjasama: <strong className="text-[#344054]">PSEKUIN UPN Veteran Yogyakarta</strong></span>
            <span className="text-[#D0D5DD]">&bull;</span>
            <span>Sistem: <strong className="text-[#0D3E77]">BI Intelligence v1.0</strong></span>
          </div>
        </div>
      </footer>

      {/* 4. Excel Upload & OneDrive Modal */}
      <DataModal />

    </div>
  );
}

export default App;
