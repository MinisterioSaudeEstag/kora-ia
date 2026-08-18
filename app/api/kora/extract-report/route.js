import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { REPORT_CONFIG } from '../../../constants/reportConfig'; 

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { documentId, sectionId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Documento não selecionado' }, { status: 400 });
    }

    const section = REPORT_CONFIG.sections.find((s) => s.id === sectionId);
    if (!section) {
      return NextResponse.json({ error: 'Seção não encontrada no relatório' }, { status: 404 });
    }

    const searchTerms =
      section.type === 'QUESTIONNAIRE'
        ? section.questions.map((q) => q.text).join(' ')
        : section.fields.map((f) => f.label).join(' ');

    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: searchTerms,
    });
    const queryVector = embeddingRes.data[0].embedding;
    const vectorString = `[${queryVector.join(',')}]`;

    const rows = await prisma.$queryRaw`
      SELECT content 
      FROM "pdf_chunks" 
      WHERE "documentId" = ${documentId} 
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT 20
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum conteúdo encontrado para este documento.' },
        { status: 400 }
      );
    }

    const context = rows.map((row) => row.content).join('\n\n---\n\n');

    let extractionInstruction = '';

    if (section.type === 'DATA_ENTRY') {
      extractionInstruction =
        'Extraia os seguintes campos e retorne um JSON onde as CHAVES sejam EXATAMENTE os IDs fornecidos abaixo:\n' +
        section.fields.map((f) => `- Usar a chave "${f.id}" para o dado referente a: "${f.label}"`).join('\n');
    } else {
      extractionInstruction =
        'Para cada pergunta abaixo, retorne no JSON a chave "{id}_status" com "SIM", "NÃO" ou "N/A", e a chave "{id}_answer" com a justificativa técnica:\n' +
        section.questions
          .map((q) => `- Pergunta ID "${q.id}": ${q.text} (Modelo de resposta esperada: ${q.model || 'Objetivo'})`)
          .join('\n');
    }

    const systemPrompt = `Você é um Auditor Especialista em Convênios e Fiscalização de Documentos.
Sua tarefa é analisar o contexto do documento fornecido e preencher a seção "${section.title}" do relatório.

REGRAS CRÍTICAS DE FORMATO:
1. Responda ESTRITAMENTE com um objeto JSON válido.
2. Utilize EXATAMENTE as chaves solicitadas nas instruções.
3. Se a informação não for encontrada no documento, defina o valor do campo como null (ou "N/A" para status de perguntas).
4. Mantenha tom técnico, impessoal e fundamentado no texto do documento.

INSTRUÇÕES DE CAMPOS E CHAVES:
${extractionInstruction}

CONTEXTO EXTRAÍDO DO DOCUMENTO:
${context}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analise o documento e extraia os dados da seção "${section.title}".` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    let extractedData = {};

    try {
      extractedData = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error('Erro ao converter JSON do Groq:', rawContent);
      return NextResponse.json({ error: 'Resposta da IA em formato inválido' }, { status: 500 });
    }

    return NextResponse.json({ extractedData });

  } catch (error) {
    console.error('Erro na Extração de Relatório:', error);
    return NextResponse.json({ error: 'Erro interno ao extrair dados do relatório' }, { status: 500 });
  }
}