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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#1F3864] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base font-bold">Sumber Data & Sinkronisasi Excel</h3>
              <p className="text-xs text-blue-200">Kajian Aliran Komoditas DIY · Bank Indonesia</p>
            </div>
          </div>
          <button
            onClick={() => setDataModalOpen(false)}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Status Message */}
          {uploadStatus && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              uploadStatus.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
               uploadStatus.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> :
               <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
              <span className="font-medium">{uploadStatus.msg}</span>
            </div>
          )}

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Unggah File Excel (.xlsx / .xls)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragActive ? 'border-[#2E75B6] bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
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
                <Upload className="w-8 h-8 text-[#2E75B6] mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Tarik & lepas file Excel di sini atau klik untuk memilih
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Mendukung sheet: <code>laporan_ringkasan</code>, <code>arus_masuk</code>, <code>arus_keluar</code>
                </span>
              </label>
            </div>
          </div>

          {/* OneDrive Sync Link Form */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Atau Sinkronkan URL OneDrive / Excel Online
            </label>
            <form onSubmit={handleSyncUrl} className="flex gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://onedrive.live.com/download?cid=... (Tautan Publik)"
                  value={oneDriveUrl}
                  onChange={(e) => setOneDriveUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E75B6] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !oneDriveUrl}
                className="px-4 py-2 bg-[#2E75B6] hover:bg-blue-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors"
              >
                Sinkron
              </button>
            </form>
          </div>

          {/* Template Download & Reset */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Template Excel Resmi (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                refreshData();
                setDataModalOpen(false);
              }}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gunakan Data Standar (W33 - 2026)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
