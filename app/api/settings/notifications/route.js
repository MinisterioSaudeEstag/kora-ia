// app/api/settings/notifications/route.js
import { verifyToken, updateUser } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  try {
    // Extrair token
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

    // Buscar preferências de notificação do usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        notification_preferences: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      notifications: user.notification_preferences || {
        emailNotifications: true,
        uploadAlerts: true,
        reportAlerts: true,
        weeklyDigest: false,
      },
    });
  } catch (error) {
    console.error('Erro ao recuperar configurações:', error);
    return Response.json(
      { error: 'Erro ao recuperar configurações' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Extrair token
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

    const { emailNotifications, uploadAlerts, reportAlerts, weeklyDigest } = await request.json();

    // Validar dados
    const notifications = {
      emailNotifications: Boolean(emailNotifications),
      uploadAlerts: Boolean(uploadAlerts),
      reportAlerts: Boolean(reportAlerts),
      weeklyDigest: Boolean(weeklyDigest),
    };

    // Atualizar preferências no banco
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        notification_preferences: notifications,
      },
    });

    return Response.json({
      success: true,
      message: 'Configurações de notificação salvas com sucesso',
      notifications,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return Response.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
}
