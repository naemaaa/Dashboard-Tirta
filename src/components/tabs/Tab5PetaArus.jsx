// Tab 5: Peta Spasial Aliran Pangan & Sebaran Responden (Dedicated Spatial View)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER } from '../../data/seedData';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { FoodFlowMap } from '../maps/FoodFlowMap';
import { SlidersHorizontal, Map, Compass, Navigation, RotateCcw } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
      
      {/* 1. LEFT SIDEBAR: Slicers & Filters */}
      <div className="lg:col-span-2 space-y-2.5">
        <div className="clean-card p-3 bg-white">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5 uppercase tracking-wider pb-1.5 border-b border-slate-100">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Spasial</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Periode</label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua">All Periode</option>
                {REF_KALENDER.map((k) => (
                  <option key={k.id_periode} value={k.id_periode}>{k.label_periode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Komoditas</label>
              <select
                value={selectedKomoditas}
                onChange={(e) => setSelectedKomoditas(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua">All Komoditas</option>
                {REF_KOMODITAS.map(k => (
                  <option key={k.id_komoditas} value={k.nama_komoditas}>{k.nama_komoditas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Wilayah Fokus</label>
              <select
                value={selectedWilayah}
                onChange={(e) => setSelectedWilayah(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="Semua Wilayah DIY">Semua Wilayah DIY</option>
                {REF_WILAYAH.map(w => (
                  <option key={w.id_kab_kota} value={w.nama_kab_kota}>{w.nama_kab_kota}</option>
                ))}
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-lg transition-all cursor-pointer mt-2 shadow-2xs active:scale-[0.98]"
              title="Reset Semua Filter ke Nilai Default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        <div className="clean-card p-3 bg-slate-900 text-white space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Compass className="w-4 h-4" />
            <span>Petunjuk Peta</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Peta ini menggunakan teknologi Leaflet GIS dengan peta dasar jalan & batas administratif nyata. Klik simpul wilayah atau garis aliran untuk melihat rincian volume pasokan.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA: Real Leaflet Map */}
      <div className="lg:col-span-10 space-y-3">
        
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
