import { verifyToken, hashPassword } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password) {
      return Response.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    if (decoded.type !== 'reset') {
      return Response.json(
        { error: 'Token não é um token de reset válido' },
        { status: 401 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: hashedPassword },
    });

    return Response.json({
      success: true,
      message: 'Senha resetada com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return Response.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
