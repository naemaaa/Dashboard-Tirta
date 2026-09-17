// Executive Intelligence Box (Clean, Polished & Tailored per Tab)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState } from 'react';
import { useCalculations } from '../../hooks/useCalculations';
import { useDashboardStore } from '../../store/useDashboardStore';
import { AiNarrativeService } from '../../services/aiService';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';

export function ExecutiveIntelligenceBox({ tabId = 'tab1', title = 'Executive Intelligence & Insight Kebijakan' }) {
  const calculations = useCalculations();
  const { selectedKomoditas, selectedWilayah, selectedPeriode } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Generate insights based on tabId
  let insights = [];
  if (tabId === 'tab2') {
    insights = AiNarrativeService.generateTab2Insights(calculations);
  } else if (tabId === 'tab3') {
    insights = AiNarrativeService.generateTab3Insights(calculations);
  } else if (tabId === 'tab4') {
    insights = AiNarrativeService.generateTab4Insights(calculations);
  } else if (tabId === 'tab5') {
    insights = AiNarrativeService.generateTab5Insights(calculations);
  } else {
    insights = AiNarrativeService.generateExecutiveInsights(calculations, {
      selectedKomoditas,
      selectedWilayah,
      selectedPeriode
    });
  }

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 350);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs mb-5 overflow-hidden transition-all duration-200">
      
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 m-0 tracking-tight">
                {title}
              </h2>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                AI Synthesis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
              Sintesis otomatis indikator neraca perdagangan & rekomendasi pengendalian inflasi TPID DIY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Perbarui analisis AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Menganalisis...' : 'Perbarui Insight'}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Tampilkan insight" : "Ciutkan insight"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3 Insight Columns */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {insights.map((card, idx) => {
            let badgeStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200/70';
            if (card.badgeColor === 'red') {
              badgeStyle = 'text-rose-700 bg-rose-50 border-rose-200/70';
            } else if (card.badgeColor === 'amber' || card.badgeColor === 'yellow') {
              badgeStyle = 'text-amber-800 bg-amber-50 border-amber-200/70';
            } else if (card.badgeColor === 'blue') {
              badgeStyle = 'text-blue-700 bg-blue-50 border-blue-200/70';
            } else if (card.badgeColor === 'purple') {
              badgeStyle = 'text-purple-700 bg-purple-50 border-purple-200/70';
            }

            return (
              <div key={card.id} className={`${idx > 0 ? 'pt-3 md:pt-0 md:pl-5' : ''} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      {card.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${badgeStyle}`}>
                      {card.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {card.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-400">{card.timestamp}</span>
                  <button
                    onClick={() => handleCopy(card.id, `${card.category}: ${card.content}`)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
                  >
                    {copiedId === card.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
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
