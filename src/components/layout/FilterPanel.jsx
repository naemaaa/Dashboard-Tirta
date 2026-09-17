// Clean, Minimalist Global Filter Panel
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { REF_KOMODITAS, REF_KALENDER, REF_WILAYAH, REF_KLASTER_RESPONDEN } from '../../data/seedData';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

export function FilterPanel() {
  const {
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    selectedKlaster,
    setSelectedPeriode,
    setSelectedKomoditas,
    setSelectedWilayah,
    setSelectedKlaster,
    resetFilters,
  } = useDashboardStore();

  const isDefault =
    selectedPeriode === REF_KALENDER[REF_KALENDER.length - 1].id_periode &&
    selectedKomoditas === REF_KOMODITAS[0].nama_komoditas &&
    selectedWilayah === 'Semua Wilayah DIY' &&
    selectedKlaster === 'pedagang_besar';

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
            
            {/* Periode */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Periode Survei
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none font-medium cursor-pointer shadow-2xs"
              >
                {REF_KALENDER.map((k) => (
                  <option key={k.id_periode} value={k.id_periode}>
                    {k.label_periode}
                  </option>
                ))}
              </select>
            </div>

            {/* Komoditas */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Komoditas Strategis
              </label>
              <select
                value={selectedKomoditas}
                onChange={(e) => setSelectedKomoditas(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none font-medium cursor-pointer shadow-2xs"
              >
                {REF_KOMODITAS.map((k) => (
                  <option key={k.id_komoditas} value={k.nama_komoditas}>
                    {k.nama_komoditas}
                  </option>
                ))}
              </select>
            </div>

            {/* Wilayah */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Wilayah Wilayah Pantau
              </label>
              <select
                value={selectedWilayah}
                onChange={(e) => setSelectedWilayah(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none font-medium cursor-pointer shadow-2xs"
              >
                <option value="Semua Wilayah DIY">Semua Wilayah DIY (Agregat)</option>
                {REF_WILAYAH.map((w) => (
                  <option key={w.id_kab_kota} value={w.nama_kab_kota}>
                    {w.nama_kab_kota}
                  </option>
                ))}
              </select>
            </div>

            {/* Klaster Responden */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Klaster Pelaku Usaha
              </label>
              <select
                value={selectedKlaster}
                onChange={(e) => setSelectedKlaster(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none font-medium cursor-pointer shadow-2xs"
              >
                {REF_KLASTER_RESPONDEN.map((kl) => (
                  <option key={kl.id} value={kl.id}>
                    {kl.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Reset Action */}
          <div className="flex items-center justify-end gap-2 pt-1 lg:pt-4">
            <button
              onClick={resetFilters}
              disabled={isDefault}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDefault
                  ? 'text-slate-400 bg-transparent cursor-not-allowed'
                  : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filter</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
