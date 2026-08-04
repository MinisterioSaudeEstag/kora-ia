'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import React from 'react';
import dynamic from 'next/dynamic';
import { FileText, MessageSquare, HardDrive, Upload, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const PDFUpload = dynamic(() => import('./components/PDFUpload'), { 
  ssr: false 
});

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [userProfile, setUserProfile] = useState(null);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // 1. Verifica se há uma sessão ativa no Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      // 2. Extrai dados do usuário logado
      const user = session.user;
      const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
      
      setUserName(displayName);
      setUserProfile({
        name: displayName,
        email: user.email
      });

      // 3. Carrega PDFs salvos no localStorage
      const uploadedPdfs = localStorage.getItem('uploaded_pdfs');
      if (uploadedPdfs) {
        try {
          const pdfList = JSON.parse(uploadedPdfs);
          setPdfs(pdfList);
        } catch (error) {
          console.error('Erro ao carregar PDFs:', error);
        }
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleSelectPdfAndNavigate = (pdf) => {
    // Define o PDF ativo no localStorage antes de ir para o Chat
    localStorage.setItem('selected_pdf', JSON.stringify(pdf));
    router.push('/chat');
  };

  const handleUploadComplete = (newPDF) => {
    setPdfs((prevPdfs) => {
      const updatedList = [newPDF, ...prevPdfs];
      localStorage.setItem('uploaded_pdfs', JSON.stringify(updatedList));
      localStorage.setItem('selected_pdf', JSON.stringify(newPDF));
      return updatedList;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F5]">
        <div className="text-center p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#004a94]"></div>
          <p className="mt-4 text-stone-600 font-medium text-sm">Carregando painel institucional...</p>
        </div>
      </div>
    );
  }

  const totalConversations = pdfs.reduce((sum, pdf) => sum + (pdf.conversations?.length || 0), 0);
  const recentPdfs = pdfs.slice(0, 6);
  const totalVolumeMB = (pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0) / 1024 / 1024).toFixed(2);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* BANNER PRINCIPAL DE BOAS-VINDAS */}
        <div className="mb-10">
          <div className="bg-[#004a94] rounded-2xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden border border-blue-900/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-sm mb-4 border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Sistema Institucional Ativo
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                Bem-vindo, {userProfile?.name || userName}! 👋
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
                Acesse a inteligência de dados do Ministério da Saúde. Faça upload dos seus documentos em PDF e obtenha análises sintéticas, consultas em linguagem natural e relatórios automatizados.
              </p>
            </div>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS / INDICADORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Documentos Indexados
              </p>
              <p className="text-3xl font-extrabold text-[#004a94]">
                {pdfs.length}
              </p>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Arquivos prontos para análise
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-[#004a94] rounded-xl border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Total de Consultas
              </p>
              <p className="text-3xl font-extrabold text-emerald-600">
                {totalConversations}
              </p>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Interações no Chat Kora
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Volume Armazenado
              </p>
              <p className="text-3xl font-extrabold text-stone-700">
                {totalVolumeMB} <span className="text-base font-semibold text-stone-500">MB</span>
              </p>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Otimizado para consulta rápida
              </span>
            </div>
            <div className="p-3 bg-stone-100 text-stone-600 rounded-xl border border-stone-200">
              <HardDrive className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SEÇÃO: UPLOAD DE NOVO DOCUMENTO */}
        <div className="mb-10 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <div className="p-2 bg-[#004a94] text-white rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Enviar Novos Documentos
              </h2>
              <p className="text-xs text-stone-500">
                Selecione ou arraste arquivos PDF para indexação e análise no sistema.
              </p>
            </div>
          </div>

          <PDFUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* SEÇÃO: HISTÓRICO / DOCUMENTOS RECENTES */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-200/70 text-stone-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                Documentos Processados
              </h2>
            </div>
            {recentPdfs.length > 0 && (
              <button 
                onClick={() => router.push('/historico')}
                className="text-xs font-semibold text-[#004a94] hover:underline"
              >
                Ver Histórico Completo →
              </button>
            )}
          </div>

          {recentPdfs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-10 text-center shadow-sm">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 mb-1">Nenhum documento processado</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Faça o upload do seu primeiro PDF na caixa acima para começar as análises institucionais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPdfs.map((pdf) => (
                <div 
                  key={pdf.id} 
                  onClick={() => handleSelectPdfAndNavigate(pdf)}
                  className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm hover:border-[#004a94] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 text-[#004a94] rounded-lg group-hover:bg-[#004a94] group-hover:text-white transition-colors shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-stone-900 truncate group-hover:text-[#004a94] transition-colors">
                        {pdf.fileName || pdf.nome_arquivo}
                      </h3>
                      <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                        <span>{pdf.fileSize ? (pdf.fileSize / 1024).toFixed(1) : '0'} KB</span>
                        <span>•</span>
                        <span>{new Date(pdf.uploadDate || pdf.uploadedAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded text-[10px]">
                      ● Processado
                    </span>
                    <span className="font-semibold text-[#004a94] group-hover:translate-x-0.5 transition-transform">
                      Abrir no Chat →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}