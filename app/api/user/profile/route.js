import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

export async function GET(request) {
  try {
    const supabaseUser = await getAuthenticatedUser(request);

    if (!supabaseUser) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    let user = await prisma.user.findFirst({
      where: { email: supabaseUser.email },
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
      user = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        email: supabaseUser.email,
        phone: '',
        location: '',
        avatar: '',
        joinDate: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
      };
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

export async function PUT(request) {
  try {
    const supabaseUser = await getAuthenticatedUser(request);

    if (!supabaseUser) {
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

    const updatedUser = await prisma.user.upsert({
      where: { email: supabaseUser.email },
      update: updateData,
      create: {
        email: supabaseUser.email,
        name: name || supabaseUser.email.split('@')[0],
        ...updateData,
      },
    });

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