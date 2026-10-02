// Data Source Manager — Public Read-Only Insight Dashboard
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
//
// 🔒 ATURAN UTAMA KEMAANAN & ARSITEKTUR:
//    1. Publik TIDAK BISA unggah file Excel / input URL dari luar dashboard.
//    2. Dashboard ini murni untuk melihat insight & analisis data.
//    3. Seluruh database dikelola otomatis di backend/sistem via .env.
//    4. Pengguna publik hanya dapat melakukan 1-Click Refresh ("Sinkronkan Data Terkini").

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ONEDRIVE_MASTER_URL, ONEDRIVE_EWS_URL } from '../../config/env.js';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AlertOctagon,
  Database,
  CloudDownload,
  ShieldCheck,
  Check,
  Server
} from 'lucide-react';

export function DataModal() {
  const {
    isDataModalOpen,
    setDataModalOpen,
    refreshData,
    refreshEwsData,
    isLoading,
    activeTab,
    lastSyncTime,
    ewsSyncTime,
    dataSource,
    ewsSyncSource,
  } = useDashboardStore();

  const [activeDbTab, setActiveDbTab] = useState(activeTab === 'tab7' ? 'db_ews' : 'db_master');
  const [uploadStatus, setUploadStatus] = useState(null);

  if (!isDataModalOpen) return null;

  const handleSyncSystemDataset = async () => {
    try {
      setUploadStatus({ type: 'loading', msg: 'Menghubungkan & mengunduh dataset terbaru dari server...' });
      if (activeDbTab === 'db_ews') {
        await refreshEwsData(ONEDRIVE_EWS_URL);
        setUploadStatus({ type: 'success', msg: 'Berhasil memperbarui Database EWS Alert!' });
      } else {
        await refreshData(ONEDRIVE_MASTER_URL);
        setUploadStatus({ type: 'success', msg: 'Berhasil memperbarui Master Database Komoditas!' });
      }
      setTimeout(() => {
        setUploadStatus(null);
        setDataModalOpen(false);
      }, 1200);
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Gagal melakukan sinkronisasi: ' + err.message });
    }
  };

  const currentSyncTime = activeDbTab === 'db_ews' ? ewsSyncTime : lastSyncTime;
  const currentSource   = activeDbTab === 'db_ews' ? (ewsSyncSource || 'Default System EWS Database') : (dataSource || 'Default System Master Database');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071D3D]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EC] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0A2E5C] text-white px-6 py-4 flex items-center justify-between border-b border-[#071D3D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Database className="w-4.5 h-4.5 text-[#C89B3C]" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight m-0 leading-tight">Status Sumber Data Dashboard</h3>
              <p className="text-xs text-[#B3D4F2] m-0 mt-0.5">Bank Indonesia KPw DIY · Sistem Terpusat</p>
            </div>
          </div>
          <button
            onClick={() => setDataModalOpen(false)}
            className="p-1.5 rounded-full text-[#B3D4F2] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Selector Tabs */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-2 flex gap-2">
          <button
            onClick={() => setActiveDbTab('db_master')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeDbTab === 'db_master'
                ? 'bg-white text-[#0A2E5C] shadow-xs border border-[#E2E8F0]'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1E74C7]" />
            <span>1. Arus Komoditas (Tab 1-6)</span>
          </button>

          <button
            onClick={() => setActiveDbTab('db_ews')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeDbTab === 'db_ews'
                ? 'bg-white text-[#F04438] shadow-xs border border-red-200'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-[#F04438]" />
            <span>2. EWS Alert (Tab 7)</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Status Alert Notification */}
          {uploadStatus && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              uploadStatus.type === 'success' ? 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]' :
              uploadStatus.type === 'error' ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]' :
              'bg-[#F2F7FD] text-[#0D3E77] border border-[#B3D4F2]'
            }`}>
              {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" /> :
               uploadStatus.type === 'error' ? <AlertCircle className="w-4 h-4 text-[#F04438] shrink-0" /> :
               <RefreshCw className="w-4 h-4 text-[#1E74C7] animate-spin shrink-0" />}
              <span className="font-medium">{uploadStatus.msg}</span>
            </div>
          )}

          {/* Data Connection Card */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4E7EC]">
              <span className="text-[#667085]">Database Aktif:</span>
              <span className="font-bold text-[#101828]">
                {activeDbTab === 'db_ews' ? 'Database EWS DIY (Standalone)' : 'Database Master Komoditas DIY'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4E7EC]">
              <span className="text-[#667085]">Sumber Data:</span>
              <span className="font-semibold text-[#0D3E77] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#1E74C7]" />
                {currentSource}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085]">Terakhir Diperbarui:</span>
              <span className="font-mono text-[#344054] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                {currentSyncTime || 'Sistem Bawaan'}
              </span>
            </div>
          </div>

          {/* Primary Action Card: 1-Click Reload Button Only */}
          <div className="bg-[#F2F7FD] border border-[#B3D4F2] rounded-2xl p-4 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3E77] text-white flex items-center justify-center shadow-xs">
              <CloudDownload className="w-6 h-6 text-[#C89B3C]" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0A2E5C] m-0">Perbarui Data dari Server</h4>
              <p className="text-xs text-[#667085] mt-1 max-w-xs">
                Klik tombol di bawah untuk menyinkronkan data langsung dari server resmi BI DIY.
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSyncSystemDataset}
              className="w-full py-3 bg-[#0D3E77] hover:bg-[#0A2E5C] active:bg-[#071D3D] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Mengunduh Dataset Terbaru...' : 'Sinkronkan Data Terkini'}</span>
            </button>
          </div>

          {/* Security Notice Footer */}
          <div className="pt-2 text-center text-[11px] text-[#667085] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
            <span>Sistem Terenkripsi & Terintegrasi Terpusat</span>
          </div>

        </div>

      </div>
    </div>
  );
}
