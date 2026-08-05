'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 

export default function PDFUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Por favor, selecione um arquivo em formato PDF.');
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Por favor, selecione um arquivo em formato PDF.');
    }
  }, []);

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(20);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const token = session.access_token;

      const formData = new FormData();
      formData.append('file', file);
      setProgress(40);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no upload do arquivo');

      setProgress(80);

      const documentId = data.document?.id || data.id;

      const newPDF = {
        id: documentId,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        conversations: [],
      };

      const pdfs = JSON.parse(localStorage.getItem('uploaded_pdfs') || '[]');
      pdfs.unshift(newPDF);
      localStorage.setItem('uploaded_pdfs', JSON.stringify(pdfs));
      
      setProgress(100);
      setSuccess(true);
      
      if (onUploadComplete) {
        onUploadComplete(newPDF);
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {!success ? (
            <div className="space-y-4">
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#004a94] bg-blue-50/60 text-[#004a94]'
                    : 'border-stone-300 bg-stone-50/60 hover:bg-stone-100/60 hover:border-stone-400 text-stone-600'
                }`}
              >
                <input 
                  id="file-input" 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                {file ? (
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="p-2.5 bg-blue-50 text-[#004a94] rounded-lg shrink-0 border border-blue-100">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="text-left truncate">
                        <p className="font-semibold text-stone-900 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    
                    {!uploading && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remover arquivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-50 text-[#004a94] rounded-full flex items-center justify-center mx-auto border border-blue-100">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-stone-900 font-semibold text-sm">
                        Arraste seu PDF ou <span className="text-[#004a94] underline">clique aqui</span>
                      </p>
                      <p className="text-xs text-stone-400 mt-1">Formatos aceitos: PDF (máximo 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2.5 text-red-700 text-xs bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#004a94] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-stone-600 font-medium text-center">
                    {progress < 50 ? 'Enviando arquivo...' : progress < 90 ? 'Lendo Nota Fiscal via Visão IA e Indexando...' : 'Finalizando...'} {progress}%
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-2.5 px-4 bg-[#004a94] hover:bg-[#003770] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" /> 
                    <span>Processando Documento...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> 
                    <span>Processar PDF</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            
            /* TELA DE SUCESSO */
            <div className="text-center space-y-4 py-6 bg-emerald-50/50 rounded-xl border border-emerald-100 p-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-base">Documento processado com sucesso!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  O arquivo já foi indexado e está pronto para consulta e relatórios técnicos.
                </p>
              </div>
              <button 
                onClick={() => { setFile(null); setSuccess(false); setProgress(0); setError(null); }} 
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition shadow-sm"
              >
                Carregar outro documento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}