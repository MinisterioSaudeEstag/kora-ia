'use client';

import { useState, useRef } from 'react';

export default function AvatarUpload({ currentAvatar, userName, onSuccess }) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG, WebP ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
    
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Não autenticado');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setMessage('✓ Avatar atualizado com sucesso!');
      
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.avatar = data.avatarUrl;
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      if (onSuccess) {
        onSuccess(data.user);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload do avatar');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Tem certeza que deseja remover seu avatar?')) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao remover avatar');
      }

      const data = await response.json();
      setPreview(null);
      setMessage('✓ Avatar removido com sucesso!');
      
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.avatar = null;
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      if (onSuccess) {
        onSuccess(data.user);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao remover avatar');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-24 h-24 rounded-full overflow-hidden .bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700 shadow-lg">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl font-bold text-white">
            {userName?.charAt(0)?.toUpperCase() || '👤'}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
      />

      {error && (
        <div className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm animate-in">
          {error}
        </div>
      )}
      {message && (
        <div className="w-full px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm animate-in">
          {message}
        </div>
      )}

      <div className="flex gap-2 w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Alterar Foto
            </>
          )}
        </button>

        {preview && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isLoading}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            Remover
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
      </p>
    </div>
  );
}
