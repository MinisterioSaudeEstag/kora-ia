import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import Groq from 'groq-sdk';
import { OpenAIEmbeddings } from "@langchain/openai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, documentId } = body;

    if (!message || !documentId) {
      return NextResponse.json({ error: 'Mensagem e ID do documento são obrigatórios.' }, { status: 400 });
    }

    const embeddingsModel = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const queryVector = await embeddingsModel.embedQuery(message);
    const vectorString = `[${queryVector.join(',')}]`;

    // CORREÇÃO AQUI: prisma.$queryRaw retorna o array diretamente, não um objeto { rows }
    const rows = await prisma.$queryRaw`
      SELECT content 
      FROM "pdf_chunks" 
      WHERE "documentId" = ${documentId} 
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT 5
    `;

    // Agora rows é o array correto
    if (!rows || rows.length === 0) {
      return NextResponse.json({ 
        answer: 'Não consegui encontrar trechos relevantes neste documento para responder à sua pergunta.' 
      });
    }

    const context = rows.map(row => row.content).join("\n\n");

    const systemPrompt = `Você é o assistente Kora IA. Use APENAS os trechos abaixo para responder.
    CONTEXTO:
    ${context}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.1,
    });

    return NextResponse.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('Erro Crítico no Chat RAG:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}