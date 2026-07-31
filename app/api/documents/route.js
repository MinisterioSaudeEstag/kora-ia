import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo PDF fornecido.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Tenta extração de texto digital rápida via pdf-parse
    let pdfData = await pdfParse(buffer);
    let extractedText = pdfData.text ? pdfData.text.trim() : '';

    // 2. Se o texto for muito curto ou vazio (PDF digitalizado/imagem), aplica OCR com Tesseract
    if (!extractedText || extractedText.length < 30) {
      console.log('⚠️ Texto digital não encontrado (PDF Imagem). Iniciando OCR...');

      const worker = await createWorker('por');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();

      extractedText = text ? text.trim() : '';
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
    console.error('Erro no processamento do documento:', error);
    return NextResponse.json({ error: 'Erro ao processar o arquivo PDF.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do documento não fornecido.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Documento excluído com sucesso.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar documento.' }, { status: 500 });
  }
}