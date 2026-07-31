'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    if (!email.endsWith('@saude.gov.br')) {
      setError('Utilize seu e-mail institucional @saude.gov.br');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      if (!response.ok) {
        throw new Error('Email ou senha incorretos');
      }

      const data = await response.json();

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('auth_token_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      }

      window.location.href = '/';
    } catch (error) {
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-black">
      
      <div className="hidden lg:flex lg:w-1/2 bg-[#004a94] p-12 flex-col justify-center items-start text-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400/10 rounded-full blur-2xl"></div>

        <div className="max-w-lg relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-1 rounded-md">
              <img src="/sus.png" alt="SUS" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Kora IA</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Acesso ao Sistema de <br /> 
            <span className="text-blue-200">Análise Inteligente de Dados</span>
          </h1>
          
          <p className="text-lg text-blue-100 mb-12 opacity-90 leading-relaxed">
            Plataforma oficial de processamento e geração de relatórios baseados em documentos PDF para o Ministério da Saúde.
          </p>

          <div className="space-y-6">
            {[
              { title: "Segurança de Dados", desc: "Armazenamento criptografado e seguro", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Análise de Precisão", desc: "Extração de dados via modelos de linguagem", icon: "M13 10VC13 10 14.5 7 16 7s3 3 3 5v4a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h12a2 2 0 012 2z" },
              { title: "Acesso Institucional", desc: "Integrado ao ecossistema do Governo Federal", icon: "M12 11c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-.9-2-2-2zM12 15c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-.9-2-2-2z" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-blue-800/50 rounded-lg flex items-center justify-center text-blue-200 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-blue-200 opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-gray-200">
                <img src="/sus.png" alt="SUS" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold text-[#004a94] dark:text-white">Kora IA</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Acesso ao Portal de Inteligência</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Entrar no Sistema</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Utilize suas credenciais institucionais para acessar.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded text-red-700 dark:text-red-400 text-sm flex gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Institucional</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-[#004a94] outline-none transition"
                    placeholder="nome@saude.gov.br"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Senha</label>
                  <Link href="/forgot-password" className="text-xs text-[#004a94] hover:underline font-medium">Esqueci a senha</Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-[#004a94] outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? "Ocultar" : "Exibir"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#004a94] rounded border-gray-300 focus:ring-[#004a94]"
                  />
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 transition">Lembrar-me neste dispositivo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#004a94] text-white rounded-md hover:bg-blue-800 disabled:opacity-50 font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Autenticando...</>
                ) : (
                  <>Entrar no Sistema</>
                )}
              </button>
            </form>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">Novo usuário?</span>
              </div>
            </div>

            <Link
              href="/register"
              className="block w-full py-3 text-center border-2 border-[#004a94] text-[#004a94] dark:text-blue-400 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold transition"
            >
              Criar uma conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}