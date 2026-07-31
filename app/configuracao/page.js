'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Settings, 
  Lock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Trash2, 
  KeyRound 
} from 'lucide-react';

export default function Configuracao() {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    uploadAlerts: true,
    reportAlerts: true,
    weeklyDigest: false,
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteForm, setDeleteForm] = useState({ password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dark_mode') === 'true';
    setSettings(prev => ({ ...prev, darkMode: savedDarkMode }));
    applyTheme(savedDarkMode);

    const notificationSettings = localStorage.getItem('notification_settings');
    if (notificationSettings) {
      try {
        const parsed = JSON.parse(notificationSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', isDark.toString());
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage('error', 'Por favor, preencha a nova senha e a confirmação');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao alterar senha');

      showMessage('success', 'Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteForm.password) {
      showMessage('error', 'Digite sua senha para confirmar a exclusão');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteForm.password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar conta');
      }

      localStorage.clear();
      showMessage('success', 'Conta deletada com sucesso. Redirecionando...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-[#004a94] rounded-xl border border-blue-100">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Configurações
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Gerencie suas preferências de acesso e segurança da conta institucional.
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Seção: Segurança da Conta */}
          <section className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#004a94]" />
              <h2 className="text-base font-bold text-stone-900">
                Segurança da Conta
              </h2>
            </div>

            <div className="p-5 sm:p-6">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full text-left p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 rounded-xl transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-600 group-hover:text-[#004a94] transition">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-xs sm:text-sm">
                      Alterar Senha de Acesso
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Atualize sua credencial de entrada na plataforma
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${showChangePassword ? 'rotate-90 text-[#004a94]' : 'group-hover:translate-x-0.5'}`} />
              </button>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="mt-4 p-5 bg-stone-50/60 rounded-xl border border-stone-200/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Nova Senha</span>
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Confirmar Nova Senha</span>
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition"
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-[#004a94] hover:bg-[#003770] text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isLoading ? 'Processando...' : 'Atualizar Senha'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="px-5 py-2.5 bg-stone-200/70 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Seção: Zona de Perigo */}
          <section className="bg-white border border-rose-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-rose-100/80 bg-rose-50/30 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-rose-700">
                Zona de Perigo
              </h2>
            </div>

            <div className="p-5 sm:p-6">
              <button
                onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                className="w-full text-left p-4 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/70 rounded-xl transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-rose-200 text-rose-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-rose-800 text-xs sm:text-sm">
                      Excluir Conta Permanentemente
                    </p>
                    <p className="text-[11px] text-rose-600/80">
                      Apaga dados, histórico e acessos de forma irreversível
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-rose-400 transition-transform ${showDeleteAccount ? 'rotate-90 text-rose-600' : 'group-hover:translate-x-0.5'}`} />
              </button>

              {showDeleteAccount && (
                <div className="mt-4 p-5 bg-rose-50/80 rounded-xl border border-rose-200 space-y-4">
                  <p className="text-xs text-rose-800 leading-relaxed">
                    <strong>Atenção:</strong> Esta operação é irreversível. Todos os seus documentos, históricos e dados associados serão removidos permanentemente.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Confirme sua senha para prosseguir</span>
                    </label>
                    <input
                      type="password"
                      value={deleteForm.password}
                      onChange={(e) => setDeleteForm({ password: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                      placeholder="Sua senha atual"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isLoading ? 'Processando...' : 'Confirmar Exclusão'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteAccount(false)}
                      className="flex-1 py-2.5 bg-stone-200/80 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}