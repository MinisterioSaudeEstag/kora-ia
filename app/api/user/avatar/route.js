import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'File not provided' },
        { status: 400 }
      );
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid image format. Use JPEG, PNG, WebP, or GIF' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json(
        { error: 'File too large. Maximum 5MB' },
        { status: 400 }
      );
    }

    const extension = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }[file.type];

    const timestamp = Date.now();
    const filename = `avatar_${decoded.userId}_${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const buffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));

    const avatarUrl = `/uploads/avatars/${filename}`;
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return Response.json({
      success: true,
      message: 'Avatar updated successfully',
      user,
      avatarUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return Response.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        location: true,
        joinDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { avatar: null },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return Response.json({
      success: true,
      message: 'Avatar removed successfully',
      user,
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return Response.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
