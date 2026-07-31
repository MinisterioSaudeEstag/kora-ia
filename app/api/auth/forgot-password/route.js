import { getUserByEmail, generateToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return Response.json({
        success: true,
        message: 'Se este email existe em nossa base, você receberá instruções de recuperação.',
      });
    }

    const resetToken = generateToken({ 
      userId: user.id, 
      email: user.email,
      type: 'reset'
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log(`[EMAIL] Reset link: ${resetUrl}`);

    return Response.json({
      success: true,
      message: 'Se este email existe em nossa base, você receberá instruções de recuperação.',
    });
  } catch (error) {
    console.error('Erro ao processar recuperação:', error);
    return Response.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
