// Data Source Manager & Excel Uploader Modal
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ExcelService } from '../../services/excelService';
import {
  X,
  Upload,
  Download,
  Link,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Database
} from 'lucide-react';

export function DataModal() {
  const {
    isDataModalOpen,
    setDataModalOpen,
    importExcelBuffer,
    refreshData,
    isLoading,
    syncSource
  } = useDashboardStore();

  const [oneDriveUrl, setOneDriveUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  if (!isDataModalOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setUploadStatus({ type: 'loading', msg: `Sedang memproses ${file.name}...` });
      const buffer = await file.arrayBuffer();
      await importExcelBuffer(buffer);
      setUploadStatus({ type: 'success', msg: `Berhasil memuat dataset dari ${file.name}!` });
      setTimeout(() => {
        setUploadStatus(null);
        setDataModalOpen(false);
      }, 1200);
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Gagal menguraikan Excel: ' + err.message });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSyncUrl = async (e) => {
    e.preventDefault();
    if (!oneDriveUrl) return;
    try {
      setUploadStatus({ type: 'loading', msg: 'Menghubungkan ke URL OneDrive...' });
      await refreshData(oneDriveUrl);
      setUploadStatus({ type: 'success', msg: 'Sinkronisasi data OneDrive berhasil!' });
      setTimeout(() => {
        setUploadStatus(null);
        setDataModalOpen(false);
      }, 1200);
    } catch (err) {
      setUploadStatus({ type: 'error', msg: err.message });
    }
  };

  const handleDownloadTemplate = () => {
    ExcelService.exportSampleWorkbook();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071D3D]/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EC] max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0A2E5C] text-white px-6 py-4 flex items-center justify-between border-b border-[#071D3D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="w-4.5 h-4.5 text-[#C89B3C]" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Sumber Data & Sinkronisasi Excel</h3>
              <p className="text-xs text-[#B3D4F2]">Kajian Aliran Komoditas DIY · Bank Indonesia</p>
            </div>
          </div>
          <button
            onClick={() => setDataModalOpen(false)}
            className="p-1.5 rounded-full text-[#B3D4F2] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Status Message */}
          {uploadStatus && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              uploadStatus.type === 'success' ? 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]' :
              uploadStatus.type === 'error' ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]' :
              'bg-[#F2F7FD] text-[#0D3E77] border border-[#B3D4F2]'
            }`}>
              {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> :
               uploadStatus.type === 'error' ? <AlertCircle className="w-4 h-4 text-[#F04438]" /> :
               <RefreshCw className="w-4 h-4 text-[#1E74C7] animate-spin" />}
              <span className="font-medium">{uploadStatus.msg}</span>
            </div>
          )}

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Unggah File Excel (.xlsx / .xls)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragActive ? 'border-[#1E74C7] bg-[#F2F7FD]' : 'border-[#D0D5DD] hover:border-[#1E74C7] bg-[#F9FAFB]'
              }`}
            >
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#DCEAFA] flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6 text-[#12539E]" />
                </div>
                <span className="text-xs font-bold text-[#101828]">
                  Tarik & lepas file Excel di sini atau klik untuk memilih
                </span>
                <span className="text-xs text-[#667085] mt-1">
                  Mendukung sheet: <code>laporan_ringkasan</code>, <code>arus_masuk</code>, <code>arus_keluar</code>
                </span>
              </label>
            </div>
          </div>

          {/* OneDrive Sync Link Form */}
          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Atau Sinkronkan URL OneDrive / Excel Online
            </label>
            <form onSubmit={handleSyncUrl} className="flex gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://onedrive.live.com/download?cid=... (Tautan Publik)"
                  value={oneDriveUrl}
                  onChange={(e) => setOneDriveUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl focus:border-[#1E74C7] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !oneDriveUrl}
                className="px-4 py-2 bg-[#0D3E77] hover:bg-[#0A2E5C] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
              >
                Sinkron
              </button>
            </form>
          </div>

          {/* Template Download & Reset */}
          <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-[#0D3E77] hover:text-[#0A2E5C] font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#1E74C7]" />
              <span>Unduh Template Excel Resmi (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                refreshData();
                setDataModalOpen(false);
              }}
              className="flex items-center gap-1 text-[#667085] hover:text-[#101828] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gunakan Data Master Terkini</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
