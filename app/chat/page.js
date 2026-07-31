'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReportManager from '../components/reports/reportManager';
import { 
  Trash2, 
  FileText, 
  Search, 
  CheckCircle2, 
  FileCheck, 
  Layers, 
  ArrowLeft, 
  MessageSquare,
  Send,
  Download,
  RotateCcw,
  Bot,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [docSearch, setDocSearch] = useState('');
  const [view, setView] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsAuth(true);
    const uploadedPdfs = localStorage.getItem('uploaded_pdfs');
    if (uploadedPdfs) {
      try {
        const pdfList = JSON.parse(uploadedPdfs);
        setPdfs(pdfList);
        if (pdfList.length > 0) {
          setSelectedPdf(pdfList[0].id);
        }
      } catch (err) { 
        console.error('Erro ao carregar PDFs:', err); 
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedPdf) {
      setMessages([]);
      return;
    }

    const savedHistory = localStorage.getItem('analysis_history');
    if (savedHistory) {
      try {
        const historyList = JSON.parse(savedHistory);
        const activeSession = historyList.find(h => h.documentId === selectedPdf || h.id === `session_${selectedPdf}`);
        if (activeSession && activeSession.messages) {
          setMessages(activeSession.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico da sessão:', err);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [selectedPdf]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && selectedPdf) {
      const currentPdf = pdfs.find(p => p.id === selectedPdf);
      const pdfName = currentPdf?.fileName || 'Documento';
      const activeSessionId = `session_${selectedPdf}`;

      const existingHistory = JSON.parse(localStorage.getItem('analysis_history') || '[]');
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Análise de Documento';

      const sessionIndex = existingHistory.findIndex(h => h.id === activeSessionId || h.documentId === selectedPdf);
      const sessionData = {
        id: activeSessionId,
        documentId: selectedPdf,
        documentName: pdfName,
        title: firstUserMsg,
        date: new Date().toISOString(),
        messages: messages,
      };

      if (sessionIndex >= 0) {
        existingHistory[sessionIndex] = sessionData;
      } else {
        existingHistory.unshift(sessionData);
      }

      localStorage.setItem('analysis_history', JSON.stringify(existingHistory));
    }
  }, [messages, selectedPdf, pdfs]);

  const handleDeletePdf = async (e, pdfId) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja apagar este documento e seu histórico de mensagens?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents?id=${pdfId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir o documento no servidor');
      }

      const updatedPdfs = pdfs.filter(pdf => pdf.id !== pdfId);
      setPdfs(updatedPdfs);
      localStorage.setItem('uploaded_pdfs', JSON.stringify(updatedPdfs));

      if (selectedPdf === pdfId) {
        const nextPdf = updatedPdfs.length > 0 ? updatedPdfs[0].id : null;
        setSelectedPdf(nextPdf);
      }
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      setError(err.message || 'Erro ao tentar apagar o documento.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (pdfs.length === 0) { 
      setError('Nenhum documento encontrado. Por favor, envie um arquivo PDF na página inicial.'); 
      return; 
    }

    if (!selectedPdf) { 
      setError('Por favor, selecione um documento PDF acima para consultar.'); 
      return; 
    }

    setError('');
    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString(), 
      pdfId: selectedPdf 
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInputContent = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // CHAMADA CORRIGIDA PARA A ROTA RAG (/api/chat)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: userInputContent, 
          documentId: selectedPdf, 
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao processar resposta da IA');
      }

      const data = await response.json();
      
      const aiMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.answer || 'Não foi possível extrair uma resposta para o documento.', 
        timestamp: new Date().toISOString(), 
        koraName: 'Kora', 
        pdfId: selectedPdf 
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Erro no chat:', err);
      setError(err.message || 'Ocorreu um erro na comunicação com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Deseja realmente limpar o histórico da conversa deste documento?')) {
      setMessages([]);
      if (selectedPdf) {
        const existingHistory = JSON.parse(localStorage.getItem('analysis_history') || '[]');
        const updatedHistory = existingHistory.filter(h => h.documentId !== selectedPdf && h.id !== `session_${selectedPdf}`);
        localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));
      }
    }
  };

  const handleDownloadHistory = () => {
    const currentPdf = pdfs.find(p => p.id === selectedPdf);
    const pdfName = currentPdf?.fileName || 'Documento';
    const historyText = messages.map(msg => `${msg.role === 'user' ? 'VOCÊ' : 'KORA IA'}: ${msg.content}`).join('\n\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(historyText));
    element.setAttribute('download', `historico_chat_${pdfName}.txt`);
    element.click();
  };

  const filteredPdfs = pdfs.filter(pdf => 
    pdf.fileName?.toLowerCase().includes(docSearch.toLowerCase())
  );

  const selectedPdfObject = pdfs.find(p => p.id === selectedPdf);

  if (!isAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#004a94] mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-medium">Carregando ambiente de chat...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
      <Header />
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 p-1.5 bg-stone-200/60 rounded-xl w-fit border border-stone-200">
          <button 
            onClick={() => setView('chat')} 
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
              view === 'chat' ? 'bg-white text-[#004a94] shadow-sm border border-stone-200/80' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#004a94]" />
            <span>Chat Kora</span>
          </button>
          <button 
            onClick={() => setView('report')} 
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
              view === 'report' ? 'bg-white text-[#004a94] shadow-sm border border-stone-200/80' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Relatório Técnico</span>
          </button>
        </div>

        {view === 'chat' ? (
          <>
            <div className="mb-6 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-[#004a94] rounded-lg border border-blue-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-stone-900">Selecione o Documento para Consulta</h2>
                  <span className="text-[11px] bg-blue-50 text-[#004a94] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100/60">
                    {pdfs.length} arquivo(s)
                  </span>
                </div>
                {pdfs.length > 3 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar PDF..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition"
                    />
                  </div>
                )}
              </div>

              {filteredPdfs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                  {filteredPdfs.map((pdf) => {
                    const isSelected = selectedPdf === pdf.id;
                    return (
                      <div
                        key={pdf.id}
                        onClick={() => setSelectedPdf(pdf.id)}
                        className={`group relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-50/70 border-[#004a94] shadow-sm' : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className={`p-2 rounded-lg shrink-0 transition-colors ${isSelected ? 'bg-[#004a94] text-white' : 'bg-stone-200 text-stone-600'}`}>
                            {isSelected ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className={`text-xs font-semibold truncate ${isSelected ? 'text-[#004a94]' : 'text-stone-800'}`}>{pdf.fileName}</p>
                            <span className="text-[10px] text-stone-400 block mt-0.5">{isSelected ? 'Em foco no chat' : 'Clique para selecionar'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#004a94]" />}
                          <button
                            onClick={(e) => handleDeletePdf(e, pdf.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir documento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-center">
                  <p className="text-xs font-medium text-amber-800">
                    {docSearch ? 'Nenhum documento encontrado.' : '⚠️ Nenhum documento disponível. Faça upload de um PDF.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[500px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-[#FAF8F5]/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-14 h-14 bg-blue-50 text-[#004a94] rounded-full flex items-center justify-center mb-4 border border-blue-100">
                      <Bot className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mb-1">Assistente Kora — Análise Institucional</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      {selectedPdfObject ? `Documento ativo: "${selectedPdfObject.fileName}". Digite sua pergunta.` : 'Selecione um documento acima.'}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${message.role === 'user' ? 'bg-[#004a94] text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${message.role === 'user' ? 'bg-[#004a94] text-white rounded-tr-none' : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200/60'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span className={`text-[10px] block mt-1.5 font-medium ${message.role === 'user' ? 'text-blue-100/80 text-right' : 'text-stone-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="px-5 py-2.5 bg-red-50 text-red-700 text-xs border-t border-red-100 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="border-t border-stone-200/80 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={selectedPdfObject ? `Pergunte sobre "${selectedPdfObject.fileName}"...` : "Selecione um documento..."} 
                    disabled={!selectedPdf}
                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] text-xs transition disabled:opacity-50" 
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim() || !selectedPdf} 
                    className="px-5 py-2.5 bg-[#004a94] hover:bg-[#003770] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    {isLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Enviando...</span></> : <><Send className="w-3.5 h-3.5" /><span>Enviar</span></>}
                  </button>
                </form>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400 hidden sm:inline">Pressione Enter para enviar</span>
                  <div className="flex gap-2 ml-auto">
                    <button type="button" onClick={handleDownloadHistory} disabled={messages.length === 0} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition">
                      <Download className="w-3 h-3" /><span>Baixar TXT</span>
                    </button>
                    <button type="button" onClick={handleClearHistory} disabled={messages.length === 0} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-40 transition">
                      <RotateCcw className="w-3.5 h-3.5" /><span>Limpar Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
              <button onClick={() => setView('chat')} className="flex items-center gap-2 px-4 py-2 bg-[#004a94] hover:bg-[#003770] text-white rounded-xl text-xs font-semibold transition shadow-sm">
                <ArrowLeft className="w-4 h-4" /><span>Voltar para o Chat Kora</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <MessageSquare className="w-4 h-4 text-[#004a94]" /><span>Modo Ativo: <strong>Relatório Técnico</strong></span>
              </div>
            </div>
            <ReportManager 
              selectedPdf={selectedPdf}
              selectedPdfData={selectedPdfObject}
              pdfContent={selectedPdfObject?.text || selectedPdfObject?.extractedText || ''}
              onBackToChat={() => setView('chat')} 
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
