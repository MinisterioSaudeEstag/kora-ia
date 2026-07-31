// app/api/settings/change-password/route.js
import { verifyToken, changePassword } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  try {
    // Agora recebemos apenas a nova senha e a confirmação
    const { newPassword, confirmPassword } = await request.json();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return Response.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    // Validações básicas de segurança
    if (!newPassword || !confirmPassword) {
      return Response.json({ error: 'Preencha todos os campos de senha' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'As senhas não coincidem' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'A nova senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }

    // CHAMADA ATUALIZADA: Passamos apenas o ID do usuário e a nova senha
    const result = await changePassword(decoded.userId, newPassword);
    
    if (!result) {
      return Response.json({ error: 'Erro ao atualizar a senha no banco de dados' }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Sua senha foi alterada com sucesso!',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return Response.json({ error: 'Erro interno ao processar a alteração de senha' }, { status: 500 });
  }
}