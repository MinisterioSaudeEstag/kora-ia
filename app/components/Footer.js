import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-50 dark:bg-slate-950 border-t-4 border-[#004a94]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-gray-200">
                <img src="/sus.png" alt="SUS" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-[#004a94] dark:text-white leading-none">
                Kora <span className="font-light opacity-80">IA</span>
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Sistema de Inteligência Artificial para análise e processamento de documentos 
              institucionais do Ministério da Saúde.
            </p>
            <div className="pt-4">
              <div className="flex gap-2 items-center opacity-70">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Governo Digital
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
              Navegação
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Análise de Documentos
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Meu Perfil
                </Link>
              </li>
              <li>
                <Link href="/configuracao" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Configurações
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
              Institucional
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.gov.br/saude" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Ministério da Saúde
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd" target='_blank' rel='noopener noreferrer' className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                  Lei Geral de Proteção de Dados (LGPD)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
              Suporte Técnico
            </h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:suporte@saude.gov.br" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                arthur.moreira@saude.gov.br
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#004a94] dark:hover:text-blue-400 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Central de Ajuda
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© {currentYear} Kora IA. Todos os direitos reservados.</p>
            <span className="hidden md:block text-gray-300 dark:text-gray-700">|</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#004a94] transition">Privacidade</a>
              <a href="#" className="hover:text-[#004a94] transition">Termos de Uso</a>
              <a href="#" className="hover:text-[#004a94] transition">Acessibilidade</a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Desenvolvido para:</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
              Ministério da Saúde
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}