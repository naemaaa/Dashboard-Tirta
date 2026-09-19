import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER } from '../../data/seedData';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { FoodFlowMap } from '../maps/FoodFlowMap';
import { Map, Compass, Navigation, RotateCcw } from 'lucide-react';

export function Tab5PetaArus() {
  const {
    data,
    selectedPeriode,
    setSelectedPeriode,
    selectedKomoditas,
    setSelectedKomoditas,
    selectedWilayah,
    setSelectedWilayah,
    resetFilters
  } = useDashboardStore();

  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    resetFilters();
    setTimeout(() => setIsResetting(false), 500);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Slicers Bar */}
      <div className="clean-card p-4 bg-white space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Peta Spasial Aliran Pangan & Sebaran Responden DIY
                </h2>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                  GIS & Pemetaan Spasial
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Visualisasi geospasial From-To rantai pasok antar-kabupaten serta koordinat fasilitas Pedagang Besar & Produsen
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Precision Slicer & Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Periode</label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Periode</option>
              {REF_KALENDER.map((k) => (
                <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Komoditas</label>
            <select
              value={selectedKomoditas}
              onChange={(e) => setSelectedKomoditas(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua">All Komoditas</option>
              {REF_KOMODITAS.map(k => (
                <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Wilayah Fokus</label>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none font-medium cursor-pointer shadow-2xs hover:border-slate-300 transition-colors h-[38px]"
            >
              <option value="Semua Wilayah DIY">Semua Wilayah DIY</option>
              {REF_WILAYAH.map(w => (
                <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleReset}
              className="w-full h-[38px] flex items-center justify-center gap-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Reset Semua Filter ke Nilai Default"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA: Real Leaflet Map */}
      <div className="space-y-3">
        
        {/* Executive Intelligence Insight Box */}
        <ExecutiveIntelligenceBox tabId="tab5" title="Executive Intelligence · Pemetaan Spasial Rantai Pasok Pangan DIY" />

        {/* Dedicated Food Flow Map Component */}
        <FoodFlowMap
          dataset={data}
          selectedPeriode={selectedPeriode}
          selectedKomoditas={selectedKomoditas}
          selectedWilayah={selectedWilayah}
          onSelectWilayah={setSelectedWilayah}
        />

      </div>

    </div>
  );
}
