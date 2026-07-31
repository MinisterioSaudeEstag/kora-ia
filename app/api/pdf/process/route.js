import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const data = await pdfParse(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Não foi possível extrair texto legível do PDF. Verifique a codificação do arquivo.' 
      }, { status: 422 });
    }

    return NextResponse.json({ 
      success: true, 
      text: extractedText,
      pageCount: data.numpages 
    });

  } catch (error) {
    console.error('Erro no parser do PDF:', error);
    return NextResponse.json({ error: 'Erro ao processar o arquivo PDF' }, { status: 500 });
  }
}