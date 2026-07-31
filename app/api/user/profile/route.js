import { verifyToken, updateUser, getUserByEmail } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

export async function PUT(request) {
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

    const { name, phone, location, avatar } = await request.json();

    if (name && name.trim().length < 3) {
      return Response.json(
        { error: 'Nome deve ter no mínimo 3 caracteres' },
        { status: 400 }
      );
    }

    if (phone && phone.trim().length < 8) {
      return Response.json(
        { error: 'Telefone deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await updateUser(decoded.userId, updateData);

    return Response.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
        joinDate: updatedUser.joinDate,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return Response.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        avatar: true,
        joinDate: true,
        updatedAt: true,
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
      user,
    });
  } catch (error) {
    console.error('Erro ao recuperar perfil:', error);
    return Response.json(
      { error: 'Erro ao recuperar perfil' },
      { status: 500 }
    );
  }
}
