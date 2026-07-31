import {
  createUser,
  generateToken,
} from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    if (!name || !email || !password || !confirmPassword) {
      return Response.json(
        { error: 'Nome, email, senha e confirmação são obrigatórios' },
        { status: 400 }
      );
    }

    if (name.length < 3) {
      return Response.json(
        { error: 'Nome deve ter no mínimo 3 caracteres' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        { error: 'Nome não pode ter mais de 100 caracteres' },
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
        { error: 'Apenas e-mails institucionais (@saude.gov.br) podem se cadastrar' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return Response.json(
        { error: 'Senha não pode ter mais de 128 caracteres' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: 'As senhas não correspondem' },
        { status: 400 }
      );
    }

    const user = await createUser({ name, email, password });

    const token = generateToken({ userId: user.id, email: user.email });
    const expiresIn = 86400;

    const response = Response.json({
      success: true,
      message: 'Conta criada com sucesso!',
      token,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 201 });

    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}`
    );

    return response;
  } catch (error) {
    console.error('Erro ao registrar:', error);
    
    if (error.code === 'P2002') {
      return Response.json(
        { error: 'Email já cadastrado no sistema' },
        { status: 409 }
      );
    }

    if (error.message?.includes('Email já cadastrado')) {
      return Response.json(
        { error: 'Email já cadastrado no sistema' },
        { status: 409 }
      );
    }
    
    return Response.json(
      { error: `Erro ao criar conta: ${error.message}` },
      { status: 500 }
    );
  }
}