// app/api/kora/templates/route.js
import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';
import { ensureDefaultTemplates } from '@/app/lib/kora-utils';

// GET - List all templates for user
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Ensure default templates exist
    await ensureDefaultTemplates(decoded.userId);

    const templates = await prisma.koraTemplate.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return Response.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name, description, systemPrompt, isActive } = await request.json();

    if (!name || !systemPrompt) {
      return Response.json(
        { error: 'Name and system prompt required' },
        { status: 400 }
      );
    }

    const template = await prisma.koraTemplate.create({
      data: {
        userId: decoded.userId,
        name,
        description,
        systemPrompt,
        isActive: isActive || false,
      },
    });

    return Response.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return Response.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PATCH - Update template
export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { templateId, name, description, systemPrompt, isActive } = await request.json();

    if (!templateId) {
      return Response.json(
        { error: 'Template ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.koraTemplate.findFirst({
      where: { id: templateId, userId: decoded.userId },
    });

    if (!existing) {
      return Response.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = await prisma.koraTemplate.update({
      where: { id: templateId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(systemPrompt && { systemPrompt }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return Response.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return Response.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return Response.json(
        { error: 'Template ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const template = await prisma.koraTemplate.findFirst({
      where: { id: templateId, userId: decoded.userId },
    });

    if (!template) {
      return Response.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await prisma.koraTemplate.delete({
      where: { id: templateId },
    });

    return Response.json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return Response.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}