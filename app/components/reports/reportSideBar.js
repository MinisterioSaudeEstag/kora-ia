'use client';

import React from 'react';
import { REPORT_CONFIG } from '../../constants/reportConfig';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Award 
} from 'lucide-react';

export default function ReportSidebar({ 
  currentSection, 
  setSection, 
  completedSections = [], 
  onFillAll 
}) {
  // Utiliza as seções do REPORT_CONFIG ou um fallback estruturado
  const sectionsList = REPORT_CONFIG?.sections || [
    { id: 'sec0', title: 'Aba Dados' },
    { id: 'sec1', title: 'Questionário Financeiro' },
    { id: 'sec2', title: 'PAD Financeiro' },
    { id: 'sec3', title: 'Questionário Físico' },
    { id: 'sec4', title: 'Crono Físico' },
    { id: 'sec5', title: 'PAD Físico' },
    { id: 'sec6', title: 'Processos de Licitação' },
    { id: 'sec7', title: 'Conclusão' },
  ];

  const totalSections = sectionsList.length;
  const completedCount = completedSections.length;
  const progress = totalSections > 0 ? Math.min(100, Math.round((completedCount / totalSections) * 100)) : 0;

  // Verifica se a seção foi concluída por ID ou por Índice
  const isCompleted = (section, idx) => {
    return completedSections.includes(section.id) || completedSections.includes(idx);
  };

  return (
    <div className="w-64 sm:w-72 bg-[#004a94] text-white h-full overflow-y-auto shadow-xl flex flex-col shrink-0 select-none">
      
      {/* CABEÇALHO DA BARRA LATERAL */}
      <div className="p-5 border-b border-blue-400/20 shrink-0 bg-[#003870]/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-blue-500/20 text-blue-200 rounded-lg">
            <Award className="w-4 h-4 text-amber-300" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200/80">
            Ministério da Saúde · FNS
          </span>
        </div>
        <h2 className="text-xs sm:text-sm font-bold leading-tight text-white">
          Guia de Auditoria<br/>Relatório Físico/Financeiro
        </h2>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div className="p-4 border-b border-blue-400/20 shrink-0 bg-[#003d7a]/30">
        <div className="flex justify-between items-center text-[11px] font-semibold text-blue-100 mb-2">
          <span>Progresso de Preenchimento</span>
          <span className="text-amber-300 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-blue-950/60 rounded-full overflow-hidden p-0.5 border border-blue-400/30">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-[10px] text-blue-200/70 mt-1.5 text-right font-medium">
          {completedCount} de {totalSections} seções validadas
        </p>
      </div>

      {/* NAVEGAÇÃO ENTRE SEÇÕES */}
      <nav className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/60 px-3 py-1.5 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-blue-300" />
          <span>Seções do Documento</span>
        </div>

        {sectionsList.map((sec, idx) => {
          const active = currentSection === idx;
          const done = isCompleted(sec, idx);

          return (
            <button
              key={sec.id || idx}
              onClick={() => setSection(idx)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-200 group ${
                active
                  ? 'bg-white text-[#004a94] font-bold shadow-md translate-x-0.5'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className={`w-5 h-5 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'bg-[#004a94] text-white'
                      : 'bg-blue-900/50 text-blue-200 group-hover:bg-blue-800'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate">{sec.title || sec}</span>
              </div>

              {done && (
                <span className={`shrink-0 ${active ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* BOTÃO LOTE: PREENCHER TUDO COM IA */}
      {onFillAll && (
        <div className="p-3.5 border-t border-blue-400/20 shrink-0 bg-[#003870]/40">
          <button
            onClick={onFillAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher Tudo com IA</span>
          </button>
        </div>
      )}
    </div>
  );
}