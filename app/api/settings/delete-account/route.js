// app/api/settings/delete-account/route.js
import { verifyToken, verifyPassword, deleteUser } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Extrair token do header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    if (!password) {
      return Response.json(
        { error: 'Senha é obrigatória para confirmar' },
        { status: 400 }
      );
    }

    // Buscar usuário para validar senha
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return Response.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validar senha
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Deletar usuário (CASCADE DELETE remove documentos e perguntas)
    await deleteUser(decoded.userId);

    // Criar resposta com instrução de limpar token
    const response = Response.json({
      success: true,
      message: 'Conta deletada com sucesso',
      timestamp: new Date().toISOString(),
    });

    // Limpar cookie
    response.headers.set(
      'Set-Cookie',
      'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    );

    return response;
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    return Response.json(
      { error: 'Erro ao deletar conta' },
      { status: 500 }
    );
  }
}
