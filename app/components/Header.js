'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    loadUser();

    const handleProfileUpdate = () => {
      const updatedData = localStorage.getItem('user_data');
      if (updatedData) {
        setUser(JSON.parse(updatedData));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    const isDarkMode = localStorage.getItem('dark_mode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    try {
      router.replace('/login');
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b-4 border-[#004a94] shadow-md">
      <div className="bg-[#004a94] text-white text-[10px] py-1 px-4 flex justify-between items-center">

        <span className="hidden sm:block">Ministério da Saúde</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">

          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-gray-200">
                <img src="/sus.png" alt="SUS" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#004a94] dark:text-white leading-none">
                  Kora <span className="font-light opacity-80">IA</span>
                </span>
                <span className="text-[10px] uppercase tracking-tighter text-gray-500 dark:text-gray-400 font-semibold">
                  Análise Inteligente de Documentos
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#004a94] dark:hover:text-blue-400 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/chat"
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#004a94] dark:hover:text-blue-400 font-medium transition-colors"
              >
                Chat
              </Link>
              <Link
                href="/historico"
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#004a94] dark:hover:text-blue-400 font-medium transition-colors"
              >
                Histórico
              </Link>
              <Link
                href="/profile"
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#004a94] dark:hover:text-blue-400 font-medium transition-colors"
              >
                Perfil
              </Link>
              <Link
                href="/configuracao"
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#004a94] dark:hover:text-blue-400 font-medium transition-colors"
              >
                Configurações
              </Link>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-300 dark:border-gray-700">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Acesso Institucional</p>
              </div>

              <Link href="/profile" className="relative group">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#004a94] transition-transform group-hover:scale-110">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#004a94] flex items-center justify-center text-white font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Sair do Sistema"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 py-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
            <Link href="/" className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium transition">Home</Link>
            <Link href="/chat" className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium transition">Chat</Link>
            <Link href="/historico" className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium transition">Histórico de Análises</Link>
            <Link href="/profile" className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium transition">Perfil</Link>
            <Link href="/configuracao" className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-medium transition">Configurações</Link>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 rounded-lg transition">Sair do Sistema</button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}