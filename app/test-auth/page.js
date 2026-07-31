// app/test-auth/page.js
'use client';

import { useState } from 'react';

export default function TestAuthPage() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const logResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setResults([]);
    setIsLoading(true);

    try {
      // Test 1: Register novo usuário
      logResult('Register', 'running', 'Criando novo usuário...');
      const registerEmail = `test_${Date.now()}@example.com`;
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User ' + Date.now(),
          email: registerEmail,
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123',
        }),
      });

      if (registerRes.ok) {
        const data = await registerRes.json();
        if (data.token && data.user) {
          logResult('Register', 'pass', `✅ Usuário criado: ${data.user.email}`);
        } else {
          logResult('Register', 'fail', '❌ Token ou user_data não retornados');
        }
      } else if (registerRes.status === 409) {
        logResult('Register', 'skip', '⚠️ Email já existe (esperado em segundo teste)');
      } else {
        const error = await registerRes.json();
        logResult('Register', 'fail', `❌ ${error.error}`);
      }

      // Test 2: Login com usuário demo
      logResult('Login Demo User', 'running', 'Testando login com demo@example.com...');
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123456',
          rememberMe: false,
        }),
      });

      let token = null;
      if (loginRes.ok) {
        const data = await loginRes.json();
        if (data.token && data.user && data.user.id) {
          token = data.token;
          logResult('Login Demo User', 'pass', `✅ Login bem-sucedido: ${data.user.name}`);
        } else {
          logResult('Login Demo User', 'fail', '❌ Token ou user_data incompletos');
        }
      } else if (loginRes.status === 401) {
        logResult('Login Demo User', 'fail', '❌ Email ou senha incorretos');
      } else {
        const error = await loginRes.json();
        logResult('Login Demo User', 'fail', `❌ ${error.error}`);
      }

      // Test 3: Login com senha incorreta
      logResult('Login Senha Incorreta', 'running', 'Testando rejeição de senha incorreta...');
      const loginFailRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'wrongpassword',
        }),
      });

      if (loginFailRes.status === 401) {
        logResult('Login Senha Incorreta', 'pass', '✅ Senha incorreta rejeitada (401)');
      } else {
        logResult('Login Senha Incorreta', 'fail', `❌ Esperado 401, recebido ${loginFailRes.status}`);
      }

      // Test 4: Register com email duplicado
      logResult('Register Email Duplicado', 'running', 'Testando rejeição de email duplicado...');
      const dupRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Test',
          email: 'demo@example.com',
          password: 'Password123456',
          confirmPassword: 'Password123456',
        }),
      });

      if (dupRes.status === 409) {
        logResult('Register Email Duplicado', 'pass', '✅ Email duplicado rejeitado (409)');
      } else {
        logResult('Register Email Duplicado', 'fail', `❌ Esperado 409, recebido ${dupRes.status}`);
      }

      // Test 5: Register com senhas não correspondentes
      logResult('Register Senhas Diferentes', 'running', 'Testando validação de confirmação...');
      const mismatchRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mismatch Test',
          email: `test_mismatch_${Date.now()}@example.com`,
          password: 'Password123456',
          confirmPassword: 'DifferentPassword',
        }),
      });

      if (mismatchRes.status === 400) {
        const error = await mismatchRes.json();
        if (error.error.includes('não correspondem')) {
          logResult('Register Senhas Diferentes', 'pass', '✅ Confirmação validada (400)');
        } else {
          logResult('Register Senhas Diferentes', 'partial', `⚠️ Status correto mas mensagem: ${error.error}`);
        }
      } else {
        logResult('Register Senhas Diferentes', 'fail', `❌ Esperado 400, recebido ${mismatchRes.status}`);
      }

      // Test 6: Register com senha curta
      logResult('Register Senha Curta', 'running', 'Testando validação de comprimento de senha...');
      const shortPassRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Pass Test',
          email: `test_short_${Date.now()}@example.com`,
          password: '12345', // Menos de 8 caracteres
          confirmPassword: '12345',
        }),
      });

      if (shortPassRes.status === 400) {
        logResult('Register Senha Curta', 'pass', '✅ Senha curta rejeitada (400)');
      } else {
        logResult('Register Senha Curta', 'fail', `❌ Esperado 400, recebido ${shortPassRes.status}`);
      }

      // Test 7: Login com email inválido
      logResult('Login Email Inválido', 'running', 'Testando validação de email...');
      const invalidEmailRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      if (invalidEmailRes.status === 400) {
        logResult('Login Email Inválido', 'pass', '✅ Email inválido rejeitado (400)');
      } else {
        logResult('Login Email Inválido', 'fail', `❌ Esperado 400, recebido ${invalidEmailRes.status}`);
      }

      // Test 8: Armazenamento em localStorage
      logResult('LocalStorage', 'running', 'Testando armazenamento...');
      localStorage.setItem('auth_test_token', token || 'test_token');
      const storedToken = localStorage.getItem('auth_test_token');
      if (storedToken === (token || 'test_token')) {
        logResult('LocalStorage', 'pass', '✅ Token armazenado corretamente');
        localStorage.removeItem('auth_test_token');
      } else {
        logResult('LocalStorage', 'fail', '❌ Falha ao armazenar no localStorage');
      }

    } catch (error) {
      logResult('Erro Geral', 'error', `❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const totalTests = results.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🧪 Teste de Autenticação
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Validação automatizada do sistema de autenticação
        </p>

        {/* Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTests}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Testes Executados</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{passCount}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Testes Passados</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failCount}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Testes Falhados</div>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={runTests}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg mb-8 transition w-full"
        >
          {isLoading ? '▌▌ Executando testes...' : '▶️ Executar Testes de Autenticação'}
        </button>

        {/* Results */}
        <div className="space-y-2">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex justify-between items-start ${
                result.status === 'pass'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : result.status === 'fail'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : result.status === 'skip'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div>
                <div className={`font-semibold ${
                  result.status === 'pass'
                    ? 'text-green-800 dark:text-green-300'
                    : result.status === 'fail'
                    ? 'text-red-800 dark:text-red-300'
                    : result.status === 'skip'
                    ? 'text-yellow-800 dark:text-yellow-300'
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {result.test}
                </div>
                <div className={`text-sm ${
                  result.status === 'pass'
                    ? 'text-green-700 dark:text-green-400'
                    : result.status === 'fail'
                    ? 'text-red-700 dark:text-red-400'
                    : result.status === 'skip'
                    ? 'text-yellow-700 dark:text-yellow-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  {result.message}
                </div>
              </div>
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400 ml-4 shrink-0">
                {result.timestamp}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Informações de Teste</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Esta página executa testes automatizados contra as APIs de autenticação.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• Register testa criação de novo usuário e validações</p>
            <p>• Login testa autenticação com usuário demo</p>
            <p>• Validações testam rejeição de dados inválidos</p>
            <p>• Usuário demo: demo@example.com / demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
