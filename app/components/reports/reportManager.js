'use client';

import React, { useState, useEffect } from 'react';
import ReportSidebar from './reportSideBar';
import ReportSection from './reportSection';
import { REPORT_CONFIG } from '../../constants/reportConfig';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function ReportManager({ selectedPdf }) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [reportData, setReportData] = useState({});
  const [completedSections, setCompletedSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Carrega dados salvos do localStorage sempre que o PDF selecionado mudar
  useEffect(() => {
    if (!selectedPdf) return;

    const savedData = localStorage.getItem(`report_data_${selectedPdf}`);
    const savedCompleted = localStorage.getItem(`report_completed_${selectedPdf}`);

    if (savedData) {
      try { setReportData(JSON.parse(savedData)); } catch (e) { console.error(e); }
    } else {
      setReportData({});
    }

    if (savedCompleted) {
      try { setCompletedSections(JSON.parse(savedCompleted)); } catch (e) { console.error(e); }
    } else {
      setCompletedSections([]);
    }
  }, [selectedPdf]);

  // 2. Salva automaticamente alterações no localStorage
  const saveDataToStorage = (newData, newCompleted) => {
    if (!selectedPdf) return;
    localStorage.setItem(`report_data_${selectedPdf}`, JSON.stringify(newData));
    if (newCompleted) {
      localStorage.setItem(`report_completed_${selectedPdf}`, JSON.stringify(newCompleted));
    }
  };

  const updateData = (key, value) => {
    setReportData(prev => {
      const updated = { ...prev, [key]: value };
      saveDataToStorage(updated, completedSections);
      return updated;
    });
  };

  // 3. Marca/Desmarca seção como concluída
  const markSectionCompleted = (sectionId) => {
    setCompletedSections(prev => {
      const updated = prev.includes(sectionId) ? prev : [...prev, sectionId];
      saveDataToStorage(reportData, updated);
      return updated;
    });
  };

  // 4. Preenche a SEÇÃO ATUAL com IA
  const handleAutoFill = async () => {
    if (!selectedPdf) {
      alert("Por favor, selecione um PDF primeiro!");
      return;
    }

    setIsLoading(true);
    setError('');
    const section = REPORT_CONFIG.sections[currentSectionIdx];
    setLoadingMessage(`A Kora está analisando o PDF para a seção "${section.title}"...`);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/kora/extract-report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          documentId: selectedPdf, 
          sectionId: section.id, 
          sectionType: section.type 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao extrair dados da seção.');
      }

      if (data.extractedData) {
        setReportData(prev => {
          const updated = { ...prev, ...data.extractedData };
          saveDataToStorage(updated, completedSections);
          return updated;
        });
        markSectionCompleted(section.id);
      }
    } catch (err) {
      console.error("Erro ao preencher seção:", err);
      setError(err.message || "Erro de conexão com o servidor ao analisar o relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Preenche TODAS as seções do relatório de uma vez (opcional)
  const handleAutoFillAll = async () => {
    if (!selectedPdf) {
      alert("Por favor, selecione um PDF primeiro!");
      return;
    }

    if (!confirm("Deseja preencher TODAS as seções do relatório com IA? Este processo pode levar alguns segundos.")) {
      return;
    }

    setIsLoading(true);
    setError('');
    let accumulatedData = { ...reportData };
    let newCompleted = [...completedSections];

    try {
      const token = localStorage.getItem('auth_token');

      for (let i = 0; i < REPORT_CONFIG.sections.length; i++) {
        const section = REPORT_CONFIG.sections[i];
        setLoadingMessage(`Analisando seção ${i + 1} de ${REPORT_CONFIG.sections.length}: "${section.title}"...`);

        const response = await fetch('/api/kora/extract-report', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            documentId: selectedPdf, 
            sectionId: section.id, 
            sectionType: section.type 
          }),
        });

        const data = await response.json();
        if (response.ok && data.extractedData) {
          accumulatedData = { ...accumulatedData, ...data.extractedData };
          if (!newCompleted.includes(section.id)) {
            newCompleted.push(section.id);
          }
        }
      }

      setReportData(accumulatedData);
      setCompletedSections(newCompleted);
      saveDataToStorage(accumulatedData, newCompleted);

    } catch (err) {
      console.error("Erro ao preencher relatório completo:", err);
      setError("Ocorreu um erro ao processar todas as seções.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-stone-50 overflow-hidden border border-stone-200 rounded-2xl shadow-sm">
      
      {/* Barra Lateral com Navegação das Seções */}
      <ReportSidebar 
        currentSection={currentSectionIdx} 
        setSection={setCurrentSectionIdx} 
        completedSections={completedSections}
        onFillAll={handleAutoFillAll}
      />
      
      {/* Área Principal de Conteúdo */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white flex flex-col">
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
              <div className="p-4 bg-blue-50 text-[#004a94] rounded-2xl border border-blue-100 animate-bounce">
                <Sparkles className="w-8 h-8 text-[#004a94]" />
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#004a94]" />
                <span>{loadingMessage}</span>
              </div>
              <p className="text-xs text-stone-400">Por favor, aguarde enquanto os dados são extraídos.</p>
            </div>
          ) : (
            <ReportSection 
              section={REPORT_CONFIG.sections[currentSectionIdx]} 
              data={reportData} 
              updateData={updateData} 
              onAutoFill={handleAutoFill} 
            />
          )}
        </div>
      </main>
    </div>
  );
}