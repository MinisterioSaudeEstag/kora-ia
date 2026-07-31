// app/api/kora/preferences/route.js
import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';
import { initializeKoraPreferences } from '@/app/lib/kora-utils';

// GET - Get user preferences
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

    // Initialize if needed
    let preferences = await prisma.koraPreference.findUnique({
      where: { userId: decoded.userId },
      include: { template: true },
    });

    if (!preferences) {
      preferences = await initializeKoraPreferences(decoded.userId);
    }

    return Response.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return Response.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST/PUT - Update preferences
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

    const {
      templateId,
      aiModel,
      language,
      responseStyle,
      maxTokens,
      temperature,
    } = await request.json();

    // Validate inputs
    if (aiModel && !['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'].includes(aiModel)) {
      return Response.json(
        { error: 'Invalid AI model' },
        { status: 400 }
      );
    }

    if (responseStyle && !['formal', 'casual', 'technical'].includes(responseStyle)) {
      return Response.json(
        { error: 'Invalid response style' },
        { status: 400 }
      );
    }

    if (temperature && (temperature < 0 || temperature > 1)) {
      return Response.json(
        { error: 'Temperature must be between 0 and 1' },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.koraPreference.upsert({
      where: { userId: decoded.userId },
      create: {
        userId: decoded.userId,
        templateId,
        aiModel: aiModel || 'gpt-4-turbo',
        language: language || 'pt-BR',
        responseStyle: responseStyle || 'formal',
        maxTokens: maxTokens || 500,
        temperature: temperature !== undefined ? temperature : 0.7,
      },
      update: {
        ...(templateId !== undefined && { templateId }),
        ...(aiModel && { aiModel }),
        ...(language && { language }),
        ...(responseStyle && { responseStyle }),
        ...(maxTokens && { maxTokens }),
        ...(temperature !== undefined && { temperature }),
      },
      include: { template: true },
    });

    return Response.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return Response.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}