import {
  validateCredentials,
  generateToken,
} from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    if (!email.endsWith('@saude.gov.br')) {
      return Response.json(
        { error: 'Acesso restrito a e-mails institucionais (@saude.gov.br)' },
        { status: 401 }
      );
    }

    const user = await validateCredentials(email, password);
    if (!user) {
      return Response.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const expiresIn = 86400;

    const response = Response.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}`
    );

    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return Response.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    );
  }
}