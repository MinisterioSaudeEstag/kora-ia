import { verifyToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  try {
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

    const response = Response.json({
      success: true,
      message: 'Logout realizado com sucesso',
      timestamp: new Date().toISOString(),
    });

    response.headers.set(
      'Set-Cookie',
      'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    );

    return response;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return Response.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
