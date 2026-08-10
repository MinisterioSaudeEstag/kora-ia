import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo PDF fornecido.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text ? pdfData.text.trim() : '';
    } catch (parseError) {
      console.log('⚠️ Arquivo sem texto digital. Partindo para o OCR...');
    }

    if (!extractedText || extractedText.length < 30) {
      console.log('🔍 Iniciando extração de texto via OCR...');

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

      if (!ocrResponse.ok) {
        throw new Error(`A API de OCR falhou com status: ${ocrResponse.status}`);
      }

      const ocrData = await ocrResponse.json();

      if (ocrData.IsErroredOnProcessing) {
        throw new Error(`Erro interno do OCR.space: ${ocrData.ErrorMessage[0]}`);
      }

      if (ocrData && ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
        extractedText = ocrData.ParsedResults[0].ParsedText?.trim() || '';
        console.log('✅ Texto extraído da imagem via OCR com sucesso!');
      } else {
        throw new Error('A inteligência de OCR não detectou nenhum texto nesta imagem.');
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ error: 'O arquivo PDF está vazio ou totalmente ilegível.' }, { status: 422 });
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
    console.error('❌ ERRO NO SERVIDOR (/api/upload):', error);
    
    return NextResponse.json(
      { error: `Erro no Servidor: ${error.message}` }, 
      { status: 500 }
    );
  }
}