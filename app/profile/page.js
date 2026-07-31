'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) { window.location.href = '/login'; return; }

        const response = await fetch('/api/user/avatar', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro ao carregar perfil');

        const data = await response.json();
        const profileUser = data.user;
        
        setUser(profileUser);
        setFormData({
          name: profileUser.name || '',
          email: profileUser.email || '',
          phone: profileUser.phone || '',
          location: profileUser.location || '',
        });
        localStorage.setItem('user_data', JSON.stringify(profileUser));
      } catch (error) {
        setError('Erro ao carregar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name.trim()) { setError('Nome é obrigatório'); return; }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar alterações');

      const data = await response.json();
      const updatedUser = data.user;

      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Erro ao subir foto');

      const data = await response.json();
      const updatedUser = { ...user, avatar: data.avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event('profileUpdated'));
      setSuccess('Foto atualizada!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#004a94] animate-spin" />
            <p className="text-xs text-stone-500 font-medium">Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-stone-800">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-[#004a94] rounded-xl border border-blue-100">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Meu Perfil
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            Gerencie suas informações de acesso institucional e dados da conta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card do Perfil / Foto */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 text-center shadow-sm">
              <div className="relative w-32 h-32 mx-auto mb-5 group">
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || user?.avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-stone-100 shadow-sm"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-stone-400">
                    <User className="w-12 h-12" />
                  </div>
                )}

                <label
                  title="Alterar foto de perfil"
                  className="absolute bottom-0 right-0 p-2.5 bg-[#004a94] hover:bg-[#003770] rounded-full text-white cursor-pointer shadow-md transition transform group-hover:scale-105"
                >
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <Camera className="w-4 h-4" />
                </label>

                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-stone-900/40 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold text-stone-900 line-clamp-1">{user?.name}</h2>
              <p className="text-xs text-stone-500 mb-4 line-clamp-1">{user?.email}</p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-semibold mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Conta Institucional Ativa</span>
              </div>

              <div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-2.5 bg-[#004a94] hover:bg-[#003770] text-white rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form / Detalhes do Usuário */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm flex items-center gap-3">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-5">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition disabled:bg-stone-100/60 disabled:text-stone-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>Email Institucional</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-4 py-2.5 bg-stone-100/60 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">O e-mail institucional não pode ser alterado diretamente.</p>
                </div>

                {/* Telefone e Localização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>Telefone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition disabled:bg-stone-100/60 disabled:text-stone-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>Localização</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Cidade / Estado"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#004a94]/20 focus:border-[#004a94] transition disabled:bg-stone-100/60 disabled:text-stone-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação ao Editar */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-stone-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-5 py-2.5 bg-[#004a94] hover:bg-[#003770] text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}