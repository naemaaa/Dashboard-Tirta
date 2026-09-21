// Executive Intelligence Box (Clean, Polished & Tailored per Tab)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { AiNarrativeService } from '../../services/aiService';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';

export function ExecutiveIntelligenceBox({ tabId = 'tab1', title = 'Executive Intelligence & Insight Kebijakan' }) {
  const calculations = useCalculations();
  const { selectedKomoditas, selectedWilayah, selectedPeriode, selectedKlaster } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [groqInsights, setGroqInsights] = useState(null);
  const [engineType, setEngineType] = useState('Smart Synthesis');

  // Generate fallback insights based on tabId
  let fallbackInsights = [];
  if (tabId === 'tab2') {
    fallbackInsights = AiNarrativeService.generateTab2Insights(calculations);
  } else if (tabId === 'tab3') {
    fallbackInsights = AiNarrativeService.generateTab3Insights(calculations);
  } else if (tabId === 'tab4') {
    fallbackInsights = AiNarrativeService.generateTab4Insights(calculations);
  } else if (tabId === 'tab5') {
    fallbackInsights = AiNarrativeService.generateTab5Insights(calculations);
  } else {
    fallbackInsights = AiNarrativeService.generateExecutiveInsights(calculations, {
      selectedKomoditas,
      selectedWilayah,
      selectedPeriode
    });
  }

  const insights = groqInsights || fallbackInsights;

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        tabTitle: title,
        selectedKomoditas: selectedKomoditas || 'Semua Komoditas',
        selectedWilayah: selectedWilayah || 'Semua Wilayah DIY',
        selectedPeriode: selectedPeriode || '2026-W38',
        selectedKlaster: selectedKlaster || 'Semua Responden',
        currentMetrics: calculations.currentMetrics || {},
        deltas: calculations.deltas || {},
        pctLuarDiy: calculations.pctLuarDiy || 0,
        dominantUnit: calculations.dominantUnit || 'Ton'
      };

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.insights && Array.isArray(data.insights)) {
          setGroqInsights(data.insights);
          setEngineType('Groq LPU (GPT-120B)');
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.info('[AI Box] Groq request failed, using local model:', e);
    }

    setGroqInsights(null);
    setEngineType('Smart Synthesis');
    setTimeout(() => setIsGenerating(false), 300);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs mb-5 overflow-hidden transition-all duration-200">
      
      {/* Header */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#E4E7EC] bg-gradient-to-r from-[#F2F7FD] via-white to-[#F2F7FD]/50">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#DCEAFA] border border-[#B3D4F2] flex items-center justify-center text-[#0D3E77] shadow-2xs shrink-0">
            <BrainCircuit className="w-5 h-5 text-[#12539E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[#101828] m-0 tracking-tight">
                {title}
              </h2>
              <span className="text-[10px] font-semibold text-[#0D3E77] bg-[#DCEAFA] border border-[#B3D4F2] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#1E74C7]" />
                {engineType}
              </span>
            </div>
            <p className="text-xs text-[#667085] hidden sm:block mt-0.5">
              Sintesis otomatis indikator neraca perdagangan & rekomendasi pengendalian inflasi TPID DIY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0D3E77] bg-white hover:bg-[#F2F7FD] border border-[#D0D5DD] rounded-full transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Perbarui analisis AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#1E74C7] ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Menganalisis...' : 'Perbarui Insight'}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-full transition-colors cursor-pointer"
            title={isCollapsed ? "Tampilkan insight" : "Ciutkan insight"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3 Insight Columns */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((card) => {
            let badgeStyle = 'text-[#12B76A] bg-[rgba(18,183,106,0.1)] border-[#12B76A]/20';
            if (card.badgeColor === 'red') {
              badgeStyle = 'text-[#F04438] bg-[rgba(240,68,56,0.1)] border-[#F04438]/20';
            } else if (card.badgeColor === 'amber' || card.badgeColor === 'yellow') {
              badgeStyle = 'text-[#F79009] bg-[rgba(247,144,9,0.1)] border-[#F79009]/20';
            } else if (card.badgeColor === 'blue') {
              badgeStyle = 'text-[#0D3E77] bg-[#DCEAFA] border-[#B3D4F2]';
            } else if (card.badgeColor === 'purple') {
              badgeStyle = 'text-[#17B6A7] bg-[rgba(23,182,167,0.1)] border-[#17B6A7]/20';
            }

            return (
              <div 
                key={card.id} 
                className="bg-[#F9FAFB] hover:bg-[#F2F7FD]/70 border border-[#E4E7EC] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-[#101828] uppercase tracking-wider leading-tight">
                      {card.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs shrink-0 ${badgeStyle}`}>
                      {card.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#344054] leading-relaxed font-normal">
                    {card.content}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#E4E7EC]/80 text-[10px]">
                  <span className="font-medium text-[#667085] truncate min-w-0 pr-1">
                    {card.timestamp}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(card.id, `${card.category}: ${card.content}`)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#667085] hover:text-[#0D3E77] hover:bg-white border border-transparent hover:border-[#D0D5DD] transition-all font-semibold shrink-0 cursor-pointer shadow-2xs"
                  >
                    {copiedId === card.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                        <span className="text-[#12B76A]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
