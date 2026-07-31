'use client';

import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Info, 
  FileText 
} from 'lucide-react';

export default function ReportSection({ section, data, updateData, onAutoFill }) {

  const getInputStyle = (value, widthClass = 'w-32') => {
    const isEmpty = !value || value.trim() === '';
    return `${widthClass} inline-block border-b-2 px-1.5 py-0.5 text-xs font-semibold outline-none transition-all ${
      isEmpty
        ? 'bg-amber-50/80 border-amber-400 text-amber-800 placeholder-amber-400 focus:bg-amber-100'
        : 'bg-blue-50/60 border-[#004a94] text-[#004a94] focus:bg-blue-100/80'
    }`;
  };

  // ---------------------------------------------------------------------------
  // SEÇÃO I — ABA DADOS (sec0)
  // ---------------------------------------------------------------------------
  if (section.id === 'sec0') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-200" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
          </div>
          <button 
            onClick={onAutoFill} 
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher com IA</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 text-stone-800 leading-relaxed text-xs sm:text-sm space-y-6">
          {section.description && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#004a94] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#004a94] block font-bold mb-0.5">Orientações da Seção:</strong>
                <span>{section.description}</span>
              </div>
            </div>
          )}

          <div className="p-6 bg-stone-50/50 rounded-2xl border border-stone-200/70 space-y-4 leading-loose text-stone-800 font-medium">
            <p>
              Trata-se da elaboração de Relatório de Acompanhamento Físico/Financeiro referente ao cumprimento do objeto do convênio nº{' '}
              <input 
                className={getInputStyle(data.numeroConvenio, 'w-36')} 
                value={data.numeroConvenio || ''} 
                onChange={(e) => updateData('numeroConvenio', e.target.value)} 
                placeholder="Nº DO CONVÊNIO" 
              />, 
              do{' '}
              <input 
                className={getInputStyle(data.entidadeConveniente, 'w-72')} 
                value={data.entidadeConveniente || ''} 
                onChange={(e) => updateData('entidadeConveniente', e.target.value)} 
                placeholder="NOME DA ENTIDADE" 
              />, 
              cujo objeto é{' '}
              <input 
                className={getInputStyle(data.objetoConvenio, 'w-full mt-1')} 
                value={data.objetoConvenio || ''} 
                onChange={(e) => updateData('objetoConvenio', e.target.value)} 
                placeholder="DESCREVA O OBJETO DO CONVÊNIO" 
              />.
            </p>

            <p>
              Com valor global R${' '}
              <input 
                className={getInputStyle(data.valorGlobal, 'w-36')} 
                value={data.valorGlobal || ''} 
                onChange={(e) => updateData('valorGlobal', e.target.value)} 
                placeholder="0,00" 
              />, 
              sendo R${' '}
              <input 
                className={getInputStyle(data.valorConcedente, 'w-36')} 
                value={data.valorConcedente || ''} 
                onChange={(e) => updateData('valorConcedente', e.target.value)} 
                placeholder="0,00" 
              /> 
              do concedente e R${' '}
              <input 
                className={getInputStyle(data.valorContrapartida, 'w-36')} 
                value={data.valorContrapartida || ''} 
                onChange={(e) => updateData('valorContrapartida', e.target.value)} 
                placeholder="0,00" 
              /> de contrapartida.
            </p>

            <p>
              Foi executado R${' '}
              <input 
                className={getInputStyle(data.valorExecutado, 'w-36')} 
                value={data.valorExecutado || ''} 
                onChange={(e) => updateData('valorExecutado', e.target.value)} 
                placeholder="0,00" 
              />, 
              cuja data de vigência foi de{' '}
              <input 
                className={getInputStyle(data.dataInicio, 'w-32')} 
                value={data.dataInicio || ''} 
                onChange={(e) => updateData('dataInicio', e.target.value)} 
                placeholder="DD/MM/AAAA" 
              /> 
              a{' '}
              <input 
                className={getInputStyle(data.dataFim, 'w-32')} 
                value={data.dataFim || ''} 
                onChange={(e) => updateData('dataFim', e.target.value)} 
                placeholder="DD/MM/AAAA" 
              />, 
              em cumprimento ao que determina o{' '}
              <input 
                className={getInputStyle(data.numeroOficio, 'w-48')} 
                value={data.numeroOficio || ''} 
                onChange={(e) => updateData('numeroOficio', e.target.value)} 
                placeholder="Nº DO OFÍCIO" 
              />.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SEÇÃO III — PAD FINANCEIRO (sec2)
  // ---------------------------------------------------------------------------
  if (section.id === 'sec2') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
            <p className="text-[11px] text-blue-100/80 mt-0.5">{section.description}</p>
          </div>
          <button 
            onClick={onAutoFill} 
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher com IA</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">1. Texto de Abertura e Justificativa de Conformidade</label>
            <textarea
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94]/20 leading-relaxed"
              value={data.padFinanceiroAbertura || ''}
              onChange={(e) => updateData('padFinanceiroAbertura', e.target.value)}
              placeholder="As Notas Fiscais/Documentações descritas na ABA – PAD Financeiro demonstram conformidade..."
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-800">2. Relação de Equipamentos Adquiridos</label>
              <span className="text-[10px] text-stone-400 font-medium">Formato: Nome, Quantidade, Valor Unitário e Valor Total</span>
            </div>
            <textarea
              rows={8}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 font-mono outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94]/20 leading-relaxed"
              value={data.padFinanceiroEquipamentos || ''}
              onChange={(e) => updateData('padFinanceiroEquipamentos', e.target.value)}
              placeholder="Nome do Equipamento&#10;Quantidade aprovada: 1&#10;Valor unitário adquirido: R$ 0,00&#10;Valor total de aquisição: R$ 0,00"
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SEÇÃO V — CRONO FÍSICO (sec4)
  // ---------------------------------------------------------------------------
  if (section.id === 'sec4') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
            <p className="text-[11px] text-blue-100/80 mt-0.5">{section.description}</p>
          </div>
          <button 
            onClick={onAutoFill} 
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher com IA</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Percentual de Execução Física e Análise</label>
            <textarea
              rows={5}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94]/20 leading-relaxed"
              value={data.execucaoFisica || ''}
              onChange={(e) => updateData('execucaoFisica', e.target.value)}
              placeholder="A execução física foi de 100% com a aquisição de todos os equipamentos previstos..."
            />
            <p className="text-[11px] text-stone-500 mt-1">
              <em>Dica: Calculado dividindo os equipamentos adquiridos pelos aprovados e multiplicando por 100.</em>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SEÇÃO VI — PAD FÍSICO (sec5)
  // ---------------------------------------------------------------------------
  if (section.id === 'sec5') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
            <p className="text-[11px] text-blue-100/80 mt-0.5">{section.description}</p>
          </div>
          <button 
            onClick={onAutoFill} 
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher com IA</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Resultado da Análise de Conformidade Física</label>
            <textarea
              rows={5}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94]/20 leading-relaxed"
              value={data.resultadoPadFisico || ''}
              onChange={(e) => updateData('resultadoPadFisico', e.target.value)}
              placeholder="Conforme. Não foram identificadas inconformidades na execução desse item..."
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SEÇÃO VIII — CONCLUSÃO (sec7)
  // ---------------------------------------------------------------------------
  if (section.id === 'sec7') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
            <p className="text-[11px] text-blue-100/80 mt-0.5">{section.description}</p>
          </div>
          <button 
            onClick={onAutoFill} 
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Preencher com IA</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Percentuais de Execução Física e Financeira</label>
            <input
              type="text"
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94]"
              value={data.percentuaisFinais || ''}
              onChange={(e) => updateData('percentuaisFinais', e.target.value)}
              placeholder="100% Física e 100% Financeira"
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Constatações (C1)</label>
            <textarea
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94]"
              value={data.constatacoes || ''}
              onChange={(e) => updateData('constatacoes', e.target.value)}
              placeholder="Não foram identificadas irregularidades ou constatações na execução..."
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Recomendações Obrigatórias</label>
            <textarea
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94]"
              value={data.recomendacoesGerais || ''}
              onChange={(e) => updateData('recomendacoesGerais', e.target.value)}
              placeholder="Orientamos cadastrar os equipamentos no SCNES..."
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-stone-800">Demais Recomendações (C2)</label>
            <textarea
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 outline-none focus:border-[#004a94]"
              value={data.recomendacoesEspecificas || ''}
              onChange={(e) => updateData('recomendacoesEspecificas', e.target.value)}
              placeholder="Recomendações específicas correspondentes a cada constatação..."
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SEÇÕES DE QUESTIONÁRIO PADRÃO (II, IV, VII)
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      <div className="bg-[#004a94] text-white p-4 sm:p-5 flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">{section.title}</h2>
          {section.description && <p className="text-[11px] text-blue-100/80 mt-0.5">{section.description}</p>}
        </div>
        <button 
          onClick={onAutoFill} 
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Preencher com IA</span>
        </button>
      </div>
      
      <div className="p-6 space-y-6 bg-white">
        {section.questions?.map((q, idx) => {
          const currentStatus = data[`${q.id}_status`];

          return (
            <div key={q.id} className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition hover:border-stone-300">
              <div className="bg-stone-50/80 p-3.5 flex items-start gap-2.5 border-b border-stone-200/80">
                <span className="bg-[#004a94] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">{q.text}</span>
              </div>

              <div className="p-4 sm:p-5 bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500 mr-1">Status:</span>

                  <button 
                    type="button"
                    onClick={() => updateData(`${q.id}_status`, 'SIM')} 
                    className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      currentStatus === 'SIM' 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStatus === 'SIM' ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span>SIM</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => updateData(`${q.id}_status`, 'NÃO')} 
                    className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      currentStatus === 'NÃO' 
                        ? 'bg-rose-100 border-rose-500 text-rose-800 shadow-sm' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300'
                    }`}
                  >
                    <XCircle className={`w-3.5 h-3.5 ${currentStatus === 'NÃO' ? 'text-rose-600' : 'text-stone-400'}`} />
                    <span>NÃO</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => updateData(`${q.id}_status`, 'N/A')} 
                    className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      currentStatus === 'N/A' 
                        ? 'bg-slate-200 border-slate-500 text-slate-800 shadow-sm' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-slate-300'
                    }`}
                  >
                    <MinusCircle className={`w-3.5 h-3.5 ${currentStatus === 'N/A' ? 'text-slate-600' : 'text-stone-400'}`} />
                    <span>N/A</span>
                  </button>
                </div>

                <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#004a94] rounded-full"></span> 
                    <span>Justificativa Técnica / Fundamentação</span>
                  </div>
                  <textarea 
                    className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 outline-none focus:border-[#004a94] focus:ring-1 focus:ring-[#004a94]/20 resize-y leading-relaxed" 
                    rows={3} 
                    value={data[`${q.id}_answer`] || ''} 
                    onChange={(e) => updateData(`${q.id}_answer`, e.target.value)} 
                    placeholder={q.model || "Digite a justificativa para a resposta..."} 
                  />
                </div>

                {q.hint && (
                  <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-[11px] text-blue-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#004a94] shrink-0" />
                    <span><strong>Onde consultar:</strong> {q.hint}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}