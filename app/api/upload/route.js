import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';
import OpenAI from 'openai';
import PDFParser from 'pdf2json';

// 1. Instância do Supabase (Autenticação)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Instância do OpenAI (Embeddings)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'fake-key' });

// Tempo máximo de execução permitido na Vercel (se aplicável)
export const maxDuration = 30;

export async function POST(req) {
  try {
    console.log('📥 [UPLOAD] Recebendo requisição...');

    // --- 1. VALIDAÇÃO DE AUTENTICAÇÃO ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }

    // --- 2. VALIDAÇÃO DO ARQUIVO PDF ---
    const formDataReq = await req.formData();
    const file = formDataReq.get('file');

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Envie um arquivo PDF válido.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // --- 3. EXTRAÇÃO NATIVA (PDF DIGITAL VIA PDF2JSON) ---
    console.log('📄 [PDF2JSON] Tentando extrair texto digital nativo...');
    try {
      extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        pdfParser.on('pdfParser_dataError', (errData) => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', () => {
          let text = pdfParser.getRawTextContent() || '';
          
          // Remove marcadores de quebra de página do pdf2json
          text = text.replace(/----------------Page \(\d+\) Break----------------/g, ' ');

          // Trata caracteres codificados em URI caso existam
          try {
            text = decodeURIComponent(text);
          } catch (_) {
            // Se falhar o decode, mantém o texto bruto original
          }

          resolve(text.trim());
        });

        pdfParser.parseBuffer(fileBuffer);
      });

      if (extractedText.length > 30) {
        console.log(`✅ [PDF2JSON] Sucesso! Texto digital extraído (${extractedText.length} caracteres)`);
      } else {
        extractedText = '';
      }
    } catch (err) {
      console.warn('⚠️ [PDF2JSON] O arquivo não possui texto nativo. Repassando para OCR...');
    }

    // --- 4. EXTRAÇÃO FALLBACK (PDF ESCANEADO / IMAGEM VIA OCR.SPACE) ---
    if (!extractedText) {
      console.log('🔍 [OCR.space] PDF de imagem detectado. Executando OCR nativo em Base64...');

      try {
        const base64String = fileBuffer.toString('base64');
        const base64Pdf = `data:application/pdf;base64,${base64String}`;

        const ocrPayload = new URLSearchParams();
        ocrPayload.append('base64Image', base64Pdf);
        ocrPayload.append('language', 'por');
        ocrPayload.append('isOverlayRequired', 'false');
        ocrPayload.append('filetype', 'PDF');
        ocrPayload.append('scale', 'true');

        const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

        const ocrRes = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: ocrPayload,
        });

        if (!ocrRes.ok) {
          throw new Error(`Serviço de OCR retornou HTTP status ${ocrRes.status}`);
        }

        const ocrData = await ocrRes.json();

        if (ocrData.IsErroredOnProcessing) {
          const errorMessage = ocrData.ErrorMessage?.[0] || 'Erro desconhecido ao processar OCR';
          console.error('⚠️ [OCR.space] Falha interna:', errorMessage);
        } else if (ocrData?.ParsedResults && Array.isArray(ocrData.ParsedResults) && ocrData.ParsedResults.length > 0) {
          // Concatena o texto extraído de todas as páginas do PDF
          extractedText = ocrData.ParsedResults
            .map((page) => page.ParsedText || '')
            .join('\n')
            .trim();

          console.log(`✅ [OCR.space] Sucesso! Texto extraído das imagens (${extractedText.length} caracteres)`);
        }
      } catch (err) {
        console.error('⚠️ [OCR.space] Erro na requisição HTTP:', err.message);
      }
    }

    // --- 5. VALIDAÇÃO DO TEXTO EXTRAÍDO ---
    if (!extractedText || extractedText.length < 15 || extractedText.startsWith('{')) {
      console.error('❌ [ERRO] O PDF é ilegível ou retornou conteúdo inválido.');
      return NextResponse.json(
        { error: 'Não foi possível ler o conteúdo do PDF. O arquivo pode estar corrompido ou com imagens ilegíveis.' },
        { status: 422 }
      );
    }

    // Sanitização e normalização de quebras de linha
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    // --- 6. REGISTRO DO DOCUMENTO NO BANCO (PRISMA) ---
    const document = await prisma.document.create({
      data: {
        userId: supabaseUser.id,
        nome_arquivo: file.name,
        caminho_armazenamento: `/uploads/${Date.now()}_${file.name}`,
      },
    });

    // --- 7. GERAR EMBEDDINGS (OPENAI) ---
    console.log('🧠 [EMBEDDINGS] Gerando vetores na OpenAI...');

    // Limite de segurança para evitar erro de exceder context length na OpenAI (~8000 tokens)
    const maxCharLimit = 25000;
    const textForEmbedding = extractedText.length > maxCharLimit 
      ? extractedText.substring(0, maxCharLimit) 
      : extractedText;

    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textForEmbedding,
    });

    const vectorString = `[${embeddingRes.data[0].embedding.join(',')}]`;

    // --- 8. SALVAR CHUNK E VETOR NO POSTGRESQL (PGVECTOR) ---
    const chunk = await prisma.pdfChunk.create({
      data: {
        documentId: document.id,
        content: extractedText,
      },
    });

    await prisma.$executeRaw`
      UPDATE "pdf_chunks"
      SET "embedding" = ${vectorString}::vector
      WHERE "id" = ${chunk.id}
    `;

    console.log('🎉 [SUCESSO TOTAL] Operação concluída com êxito!');

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.nome_arquivo,
        text: extractedText,
      },
    });

  } catch (error) {
    console.error('❌ Erro Fatal na Rota de Upload:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor ao processar o arquivo.' },
      { status: 500 }
    );
  }
}