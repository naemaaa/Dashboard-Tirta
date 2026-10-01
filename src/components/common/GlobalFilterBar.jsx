// Unified Global Filter Bar for Dashboard Komoditas DIY
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
// Provides full cross-filtering consistency across all dashboard tabs

import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useCalculations } from '../../hooks/useCalculations';
import { REF_KOMODITAS, REF_KALENDER, REF_WILAYAH, REF_KLASTER_RESPONDEN } from '../../data/seedData';
import { ChevronDown, RotateCcw, Scale } from 'lucide-react';

export function GlobalFilterBar({ showBadge = true, title = null, subtitle = null }) {
  const {
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    selectedKlaster,
    setSelectedPeriode,
    togglePeriode,
    setSelectedKomoditas,
    setSelectedWilayah,
    setSelectedKlaster,
    resetFilters
  } = useDashboardStore();

  const { currentMetrics, isMultiPeriode, jumlahPeriode, dominantUnit, availablePeriodeIds } = useCalculations();

  const [periodeDropdownOpen, setPeriodeDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const periodeRef = useRef(null);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (periodeRef.current && !periodeRef.current.contains(event.target)) {
        setPeriodeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalisasi selectedPeriode ke array untuk multi-select display
  const periodeArray = Array.isArray(selectedPeriode)
    ? selectedPeriode
    : selectedPeriode && selectedPeriode !== 'Semua' ? [selectedPeriode] : [];

  const periodeLabel = periodeArray.length === 0
    ? 'Semua Periode'
    : periodeArray.length === 1
      ? (REF_KALENDER.find(k => k.id_periode === periodeArray[0])?.label_singkat || periodeArray[0])
      : `${periodeArray.length} Periode Dipilih`;

  const unitLabel = dominantUnit === 'Mixed' ? 'Ton / Liter' : (dominantUnit || 'Ton');

  const handleReset = () => {
    setIsResetting(true);
    resetFilters();
    setTimeout(() => setIsResetting(false), 500);
  };

  return (
    <div className="space-y-2">
      {/* Optional Title Section */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            {title && <h2 className="text-base font-bold text-[#101828] tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Slicers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* 4 Universal Slicers */}
        <div className={`${showBadge ? 'lg:col-span-10' : 'lg:col-span-12'} grid grid-cols-2 sm:grid-cols-4 gap-3 clean-card p-3.5 bg-white`}>

          {/* 1. PERIODE — Multi-select dropdown with checkboxes */}
          <div className="relative" ref={periodeRef}>
            <label className="block text-[11px] font-semibold text-[#344054] mb-1.5 flex items-center justify-between">
              <span>Periode</span>
              {isMultiPeriode && (
                <span className="text-[10px] text-[#0D3E77] font-bold bg-[#DCEAFA] px-2 py-0.5 rounded-full">
                  ×{jumlahPeriode}
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setPeriodeDropdownOpen(o => !o)}
              className="w-full bg-[#F9FAFB] border border-[#E4E7EC] hover:border-[#B3D4F2] text-[#101828] text-xs font-medium rounded-xl px-3 py-1.5 outline-none cursor-pointer flex items-center justify-between gap-1 transition-all h-[36px]"
            >
              <span className="truncate text-left">{periodeLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-[#667085] transition-transform ${periodeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {periodeDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-64 bg-white border border-[#E4E7EC] rounded-2xl shadow-xl py-2 max-h-64 overflow-y-auto">
                <label className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-[#F2F7FD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={periodeArray.length === 0}
                    onChange={() => setSelectedPeriode(REF_KALENDER[REF_KALENDER.length - 1].id_periode)}
                    className="accent-[#1E74C7] rounded"
                  />
                  <span className="text-xs text-[#101828] font-semibold">Semua Periode</span>
                </label>
                <div className="border-t border-[#E4E7EC] my-1.5" />
                {REF_KALENDER.slice().reverse().map(k => {
                  const isAvailable = !availablePeriodeIds || availablePeriodeIds.has(k.id_periode);
                  const isChecked = periodeArray.includes(k.id_periode);
                  return (
                    <label
                      key={k.id_periode}
                      className={`flex items-center gap-2.5 px-3.5 py-1.5 cursor-pointer transition-colors ${
                        isAvailable ? 'hover:bg-[#F2F7FD]' : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isAvailable}
                        onChange={() => isAvailable && togglePeriode(k.id_periode)}
                        className="accent-[#1E74C7] rounded"
                      />
                      <span className="text-xs text-[#344054]">{k.label_periode}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. KOMODITAS — Single select */}
          <div>
            <label className="block text-[11px] font-semibold text-[#344054] mb-1.5">Komoditas</label>
            <select
              value={selectedKomoditas}
              onChange={(e) => setSelectedKomoditas(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#E4E7EC] hover:border-[#B3D4F2] text-[#101828] text-xs font-medium rounded-xl px-3 py-1.5 outline-none cursor-pointer h-[36px] transition-all"
            >
              <option value="Semua">Semua Komoditas</option>
              {REF_KOMODITAS.map(k => (
                <option key={k.id_komoditas} value={k.nama_komoditas}>
                  {k.nama_komoditas} ({k.satuan_dasar})
                </option>
              ))}
            </select>
          </div>

          {/* 3. KABUPATEN/KOTA — Single select */}
          <div>
            <label className="block text-[11px] font-semibold text-[#344054] mb-1.5">Kabupaten/Kota</label>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#E4E7EC] hover:border-[#B3D4F2] text-[#101828] text-xs font-medium rounded-xl px-3 py-1.5 outline-none cursor-pointer h-[36px] transition-all"
            >
              <option value="Semua Wilayah DIY">Semua Wilayah DIY</option>
              {REF_WILAYAH.map(w => (
                <option key={w.id_kab_kota} value={w.nama_kab_kota}>
                  {w.nama_kab_kota}
                </option>
              ))}
            </select>
          </div>

          {/* 4. JENIS RESPONDEN — Single select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-[#344054]">Jenis Responden</label>
              {!showBadge && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset semua filter ke default"
                  className="text-[10px] text-[#667085] hover:text-[#0D3E77] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className={`w-2.5 h-2.5 ${isResetting ? 'animate-spin text-[#1E74C7]' : ''}`} />
                  <span>Reset</span>
                </button>
              )}
            </div>
            <select
              value={selectedKlaster}
              onChange={(e) => setSelectedKlaster(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#E4E7EC] hover:border-[#B3D4F2] text-[#101828] text-xs font-medium rounded-xl px-3 py-1.5 outline-none cursor-pointer h-[36px] transition-all"
            >
              <option value="semua">Semua Responden</option>
              {REF_KLASTER_RESPONDEN.filter(kl => kl.id !== 'semua').map(kl => (
                <option key={kl.id} value={kl.id}>{kl.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Badge: Selisih Volume & Reset Action */}
        {showBadge && (
          <div className="lg:col-span-2 clean-card p-3.5 flex items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                currentMetrics.neracaBersih >= 0 
                  ? 'bg-[rgba(18,183,106,0.12)] text-[#12B76A]' 
                  : 'bg-[rgba(240,68,56,0.12)] text-[#F04438]'
              }`}>
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#667085] truncate">
                  Selisih Volume
                </span>
                <span className={`text-sm font-bold truncate block tabular-nums ${
                  currentMetrics.neracaBersih >= 0 ? 'text-[#12B76A]' : 'text-[#F04438]'
                }`}>
                  {currentMetrics.neracaBersih > 0 ? `+${currentMetrics.neracaBersih}` : currentMetrics.neracaBersih} {unitLabel}
                </span>
              </div>
            </div>
            
            {/* Quick Reset Button */}
            <button
              onClick={handleReset}
              title="Reset semua filter ke default"
              className="p-2 rounded-full text-[#667085] hover:text-[#0D3E77] hover:bg-[#F2F4F7] transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-[#1E74C7]' : ''}`} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
