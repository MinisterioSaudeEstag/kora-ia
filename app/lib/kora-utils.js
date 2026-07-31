// app/lib/kora-utils.js
import OpenAI from 'openai';
import prisma from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default Kora templates
const DEFAULT_TEMPLATES = [
  {
    name: 'Análise Geral',
    description: 'Análise genérica e completa do documento',
    systemPrompt: 'Você é Kora, uma IA especializada em análise de documentos. Analise o documento fornecido e responda a pergunta do usuário de forma clara, concisa e fundamentada. Cite trechos relevantes do documento quando apropriado.',
  },
  {
    name: 'Resumo Executivo',
    description: 'Respostas em formato de resumo executivo',
    systemPrompt: 'Você é Kora, especialista em relatórios executivos. Responda a pergunta de forma resumida e estruturada (máximo 3 parágrafos), destacando os pontos mais importantes. Use bullet points quando necessário.',
  },
  {
    name: 'Análise Técnica',
    description: 'Respostas com foco técnico e detalhado',
    systemPrompt: 'Você é Kora, especialista em análise técnica. Forneça respostas detalhadas e técnicas, explicando conceitos complexos com clareza. Inclua exemplos e referências ao documento.',
  },
  {
    name: 'Perguntas Fixas para Relatório',
    description: 'Respostas padronizadas para construção de relatórios',
    systemPrompt: 'Você é Kora, especialista em preenchimento de formulários de relatório. Responda as perguntas de forma padronizada e estruturada, seguindo um padrão consistente.',
  },
];

/**
 * Initialize Kora preferences for a new user
 */
export async function initializeKoraPreferences(userId) {
  try {
    // Check if preferences already exist
    const existing = await prisma.koraPreference.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    // Create default preferences
    const preferences = await prisma.koraPreference.create({
      data: {
        userId,
        aiModel: 'gpt-4-turbo',
        language: 'pt-BR',
        responseStyle: 'formal',
        maxTokens: 500,
        temperature: 0.7,
      },
    });

    return preferences;
  } catch (error) {
    console.error('Error initializing Kora preferences:', error);
    throw error;
  }
}

/**
 * Get system prompt for Kora (with template if available)
 */
export async function getSystemPrompt(userId, templateId = null) {
  try {
    let template = null;

    if (templateId) {
      template = await prisma.koraTemplate.findFirst({
        where: { id: templateId, userId },
      });
    } else {
      // Get active template or use default
      const preferences = await prisma.koraPreference.findUnique({
        where: { userId },
        include: { template: true },
      });

      if (preferences?.template?.isActive) {
        template = preferences.template;
      }
    }

    if (template) {
      return template.systemPrompt;
    }

    // Default system prompt
    return DEFAULT_TEMPLATES[0].systemPrompt;
  } catch (error) {
    console.error('Error getting system prompt:', error);
    return DEFAULT_TEMPLATES[0].systemPrompt;
  }
}

/**
 * Query Kora AI with document context
 */
export async function queryKora(
  userId,
  question,
  documentContent,
  preferences = null
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Get preferences if not provided
    if (!preferences) {
      preferences = await prisma.koraPreference.findUnique({
        where: { userId },
      });
    }

    const systemPrompt = await getSystemPrompt(userId, preferences?.templateId);

    // Prepare context
    const context = `Documento fornecido:\n\n${documentContent}\n\n---\n\nPergunta do usuário: ${question}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: preferences?.aiModel || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: context,
        },
      ],
      max_tokens: preferences?.maxTokens || 500,
      temperature: preferences?.temperature || 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Kora:', error);
    throw error;
  }
}

/**
 * Get or create default templates for user
 */
export async function ensureDefaultTemplates(userId) {
  try {
    const existing = await prisma.koraTemplate.count({
      where: { userId },
    });

    if (existing > 0) {
      return true;
    }

    // Create default templates
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.koraTemplate.create({
        data: {
          userId,
          name: template.name,
          description: template.description,
          systemPrompt: template.systemPrompt,
          isActive: template.name === 'Análise Geral',
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating default templates:', error);
    throw error;
  }
}

export default {
  initializeKoraPreferences,
  getSystemPrompt,
  queryKora,
  ensureDefaultTemplates,
  DEFAULT_TEMPLATES,
};
