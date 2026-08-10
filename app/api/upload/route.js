import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';
import OpenAI from 'openai';
import PDFParser from 'pdf2json';
import axios from 'axios';
import FormData from 'form-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'fake-key' });

export async function POST(req) {
  try {
    console.log('📥 [UPLOAD] Recebendo requisição...');

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }

    const formDataReq = await req.formData();
    const file = formDataReq.get('file');

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Envie um arquivo PDF válido' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    console.log('📄 [PDF2JSON] Tentando extrair texto digital nativo...');
    try {
      extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
          let text = pdfParser.getRawTextContent();

          text = text.replace(/----------------Page \(\d+\) Break----------------/g, ' ');
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
      console.warn('⚠️ [PDF2JSON] O arquivo não possui texto nativo. Passando para OCR...');
    }

    if (!extractedText) {
      console.log('🔍 [OCR.space] PDF de imagem detectado. Executando OCR...');
      
      try {
        const form = new FormData();
        form.append('file', fileBuffer, {
          filename: file.name || 'document.pdf',
          contentType: 'application/pdf',
        });
        form.append('language', 'por'); 
        form.append('isOverlayRequired', 'false');
        form.append('filetype', 'PDF');
        form.append('scale', 'true'); 

        const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

        const ocrRes = await axios.post('https://api.ocr.space/parse/image', form, {
          headers: {
            'apikey': apiKey,
            ...form.getHeaders()
          },
          maxBodyLength: Infinity,
        });

        if (
          ocrRes.data && 
          ocrRes.data.ParsedResults && 
          Array.isArray(ocrRes.data.ParsedResults) && 
          ocrRes.data.ParsedResults.length > 0
        ) {
          const rawText = ocrRes.data.ParsedResults[0].ParsedText;
          if (rawText && typeof rawText === 'string') {
            extractedText = rawText.trim();
            console.log(`✅ [OCR.space] Sucesso! Texto lido da imagem (${extractedText.length} caracteres)`);
          }
        }

        if (ocrRes.data && ocrRes.data.IsErroredOnProcessing === true) {
          console.error('⚠️ [OCR.space] Erro interno processando imagem:', ocrRes.data.ErrorMessage);
        }

      } catch (err) {
        console.error('⚠️ [OCR.space] Erro na requisição HTTP:', err.response?.data || err.message);
      }
    }

    if (!extractedText || extractedText.length < 15 || extractedText.startsWith('{')) {
      console.error('❌ [ERRO] O PDF é ilegível ou retornou formato inválido.');
      return NextResponse.json(
        { error: 'Não foi possível ler o conteúdo do PDF. O arquivo pode estar corrompido ou a imagem está muito ilegível.' },
        { status: 422 }
      );
    }

    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    const document = await prisma.document.create({
      data: {
        userId: supabaseUser.id,
        nome_arquivo: file.name,
        caminho_armazenamento: `/uploads/${Date.now()}_${file.name}`,
      },
    });

    console.log('🧠 [EMBEDDINGS] Gerando vetores na OpenAI...');
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: extractedText,
    });

    const vectorString = `[${embeddingRes.data[0].embedding.join(',')}]`;

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

    console.log('🎉 [SUCESSO TOTAL] Operação 100% concluída e limpa!');

    return NextResponse.json({
      success: true,
      document: { id: document.id, fileName: document.nome_arquivo, text: extractedText },
    });

  } catch (error) {
    console.error('❌ Erro Fatal na Rota:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}