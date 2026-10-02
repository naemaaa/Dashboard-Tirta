import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { ExecutiveIntelligenceBox } from '../executive/ExecutiveIntelligenceBox';
import { FoodFlowMap } from '../maps/FoodFlowMap';

export function Tab5PetaArus() {
  const {
    data,
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    setSelectedWilayah
  } = useDashboardStore();

  return (
    <div className="space-y-4">
      
      {/* 1. UNIFIED GLOBAL SLICER BAR */}
      <GlobalFilterBar
        showBadge={true}
        title="Tab 5 — Peta Arus Pasokan & Monitoring Kualitas Data"
        subtitle="Pemetaan spasial jaringan arus antar wilayah dan evaluasi konsistensi kelengkapan record"
      />

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
