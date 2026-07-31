// app/api/kora/save-pdf-text/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const { documentId, text } = await request.json();
    if (!documentId || !text) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    // 1. CHUNKING: Divide o texto em pedaços de ~1000 caracteres
    // Isso evita que a IA se perca e resolve o problema de limite de tokens
    const chunks = [];
    const chunkSize = 1000;
    const overlap = 200; // Sobreposição para não cortar frases ao meio

    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    console.log(`Processando ${chunks.length} fragmentos do PDF...`);

    // 2. EMBEDDINGS: Transforma cada pedaço de texto em um vetor matemático
    const embeddingsResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });

    const embeddings = embeddingsResponse.data;

    // 3. SALVAMENTO NO SUPABASE (Usando SQL Raw para suportar o tipo vector)
    // Como o Prisma não suporta o tipo 'vector' nativamente, usamos $executeRaw
    for (let i = 0; i < chunks.length; i++) {
      const vector = `[${embeddings[i].embedding.join(',')}]`;
      const content = chunks[i];

       await prisma.$executeRaw`
      INSERT INTO "pdf_chunks" (id, "documentId", content, embedding)
      VALUES (gen_random_uuid(), ${documentId}, ${content}, ${vector}::vector)
    `;
    }

    return NextResponse.json({ 
      success: true, 
      message: `RAG concluído! ${chunks.length} fragmentos indexados.` 
    });

  } catch (error) {
    console.error('Erro no processamento RAG:', error);
    return NextResponse.json({ error: 'Falha ao processar vetores: ' + error.message }, { status: 500 });
  }
}