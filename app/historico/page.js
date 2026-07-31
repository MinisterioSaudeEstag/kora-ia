'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MessageSquare, Trash2, Download, ArrowRight, FileText, Search, Clock } from 'lucide-react';

export default function HistoricoPage() {
  const router = useRouter();
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterDoc, setSelectedFilterDoc] = useState('all');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('analysis_history');
    if (savedHistory) {
      try {
        setHistoryList(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
    }

    const uploadedPdfs = localStorage.getItem('uploaded_pdfs');
    if (uploadedPdfs) {
      try {
        setDocuments(JSON.parse(uploadedPdfs));
      } catch (err) {
        console.error('Erro ao carregar lista de PDFs:', err);
      }
    }
  }, []);

  const handleDeleteAnalysis = (analysisId) => {
    if (!confirm('Deseja realmente apagar este histórico de análise?')) return;

    const updated = historyList.filter(item => item.id !== analysisId);
    setHistoryList(updated);
    localStorage.setItem('analysis_history', JSON.stringify(updated));
  };

  const handleOpenAnalysis = (analysis) => {
    localStorage.setItem('chat_history', JSON.stringify(analysis.messages));
    localStorage.setItem('active_chat_doc_id', analysis.documentId);
    router.push('/chat');
  };

  const handleDownloadTxt = (analysis) => {
    const text = `HISTÓRICO DE ANÁLISE\nDocumento: ${analysis.documentName}\nData: ${new Date(analysis.date).toLocaleString('pt-BR')}\n\n` +
      analysis.messages.map(m => `[${m.role === 'user' ? 'UTILIZADOR' : 'IA (Kora)'}]: ${m.content}`).join('\n\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `Historico_${analysis.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
    element.click();
  };

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.documentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoc = selectedFilterDoc === 'all' || item.documentId === selectedFilterDoc;
    return matchesSearch && matchesDoc;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-50 text-[#004a94] rounded-xl border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Histórico de Análises
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
              Consulte, baixe e gerencie todas as conversas e análises efetuadas previamente com os seus documentos.
            </p>
          </div>

          <button
            onClick={() => router.push('/chat')}
            className="px-5 py-2.5 bg-[#004a94] hover:bg-[#003770] text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-sm w-fit"
          >
            <span>Nova Análise no Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Pesquisar por título ou nome do documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedFilterDoc}
              onChange={(e) => setSelectedFilterDoc(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition cursor-pointer font-medium"
            >
              <option value="all">Todos os Documentos</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fileName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Análises / Histórico */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-[#004a94] border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Nenhuma análise encontrada
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {searchTerm || selectedFilterDoc !== 'all'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar os termos da busca.'
                : 'Você ainda não realizou análises salvas no chat.'}
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="px-5 py-2.5 bg-[#004a94] hover:bg-[#003770] text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Ir para o Chat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:border-[#004a94]/50 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-[#004a94] border border-blue-100 truncate max-w-[240px]">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.documentName || 'Documento sem nome'}</span>
                    </span>

                    <span className="text-[10px] font-medium text-stone-400 shrink-0 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                      {new Date(item.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 line-clamp-2 mb-2 leading-snug">
                    {item.title || 'Análise de Documento'}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                    {item.messages && item.messages.length > 0
                      ? item.messages[item.messages.length - 1].content
                      : 'Sem histórico de mensagens.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-2">
                  <span className="text-[11px] font-medium text-stone-400">
                    {item.messages?.length || 0} mensagem(ns)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadTxt(item)}
                      className="p-2 text-stone-500 hover:text-[#004a94] hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition"
                      title="Baixar Histórico em TXT"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAnalysis(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition"
                      title="Excluir do Histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenAnalysis(item)}
                      className="ml-1 px-3.5 py-1.5 bg-[#004a94] hover:bg-[#003770] text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}