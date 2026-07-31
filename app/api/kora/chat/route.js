import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, pdfText, fileName } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    if (!pdfText || !pdfText.trim()) {
      return NextResponse.json({ 
        error: 'O documento selecionado está vazio ou sem texto extraído. Tente reenviar o arquivo.' 
      }, { status: 400 });
    }

    const systemPrompt = `Você é o assistente Kora IA, especialista em análise técnica de documentos e certificados.
Sua missão é responder à pergunta do usuário baseando-se estritamente no texto fornecido do documento.

--- CONTEÚDO EXTRAÍDO DO DOCUMENTO (${fileName || 'Documento'}) ---
${pdfText}
--- FIM DO CONTEÚDO ---

Diretrizes:
1. Procure com atenção por códigos de instrumentos, identificadores, datas, tabelas e parâmetros.
2. Responda de forma clara, direta e objetiva.
3. Se a informação constar no texto, forneça-a exatamente como está descrita.`;

    // Exemplo de integração com API LLM (ajuste conforme o seu provedor: OpenAI, Gemini, etc.)
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