import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo PDF fornecido.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParse = (await import('pdf-parse')).default;

    let extractedText = '';
    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text ? pdfData.text.trim() : '';
    } catch (parseError) {
      console.log('Aviso: Falha na leitura nativa do PDF, repassando para OCR...');
    }

    if (!extractedText || extractedText.length < 30) {
      console.log('⚠️ PDF Imagem detectado. Iniciando OCR...');

      const base64String = buffer.toString('base64');
      const base64Image = `data:application/pdf;base64,${base64String}`;

      const ocrFormData = new FormData();
      ocrFormData.append('base64Image', base64Image);
      ocrFormData.append('language', 'por');
      ocrFormData.append('scale', 'true');

      const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

      const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { 'apikey': apiKey },
        body: ocrFormData,
      });

      const ocrData = await ocrResponse.json();

      if (ocrData.IsErroredOnProcessing) {
         throw new Error('Erro na API de OCR: ' + ocrData.ErrorMessage[0]);
      }

      if (ocrData && ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
        extractedText = ocrData.ParsedResults[0].ParsedText.trim();
        console.log('✅ Texto extraído da imagem com sucesso!');
      } else {
        throw new Error('Não foi possível ler o documento escaneado.');
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ error: 'O PDF está ilegível ou vazio.' }, { status: 422 });
    }

    const documentData = {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      text: extractedText,
      extractedText: extractedText,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, document: documentData });
  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar arquivo.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do documento não fornecido.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Documento excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar documento.' }, { status: 500 });
  }
}