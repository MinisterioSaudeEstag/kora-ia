import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, pdfText, fileName, documentId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    let extractedContent = pdfText;

    if ((!extractedContent || !extractedContent.trim() || extractedContent.includes('Texto indisponível')) && documentId) {
      const chunks = await prisma.pdfChunk.findMany({
        where: { documentId: documentId },
        select: { content: true }
      });

      if (chunks.length > 0) {
        extractedContent = chunks.map(c => c.content).join('\n\n');
      }
    }

    if (!extractedContent || !extractedContent.trim() || extractedContent.includes('Texto indisponível')) {
      return NextResponse.json({ 
        error: 'O documento selecionado não possui texto extraído válido. Por favor, refaça o upload do arquivo.' 
      }, { status: 400 });
    }

    const systemPrompt = `Você é o assistente Kora IA, especialista em análise técnica de documentos do Ministério da Saúde.
Sua missão é responder à pergunta do usuário baseando-se estritamente no texto fornecido do documento.

--- CONTEÚDO EXTRAÍDO DO DOCUMENTO (${fileName || 'Documento em Foco'}) ---
${extractedContent}
--- FIM DO CONTEÚDO ---

Diretrizes:
1. Procure com atenção por códigos de instrumentos, identificadores, datas, tabelas, valores e parâmetros.
2. Responda de forma clara, direta e objetiva.
3. Se a informação constar no texto, forneça-a exatamente como está descrita.
4. Se a informação NÃO estiver descrita no texto, informe que não encontrou esse dado específico no documento.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Erro na OpenAI API:', errData);
      throw new Error('Falha na comunicação com o serviço de IA.');
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Não foi possível extrair uma resposta do documento.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Erro na API de Chat:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar mensagem.' }, { status: 500 });
  }
}