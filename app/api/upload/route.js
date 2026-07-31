import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';
import OpenAI from 'openai';
import axios from 'axios';
import AdmZip from 'adm-zip';

// IMPORTAÇÃO CORRIGIDA PARA PDF-PARSE (CommonJS)
const pdfParse = require('pdf-parse'); 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return isPng || isJpeg;
}

function createChunks(text, size = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
}

export async function POST(request) {
  try {
    // 1. AUTENTICAÇÃO
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    // 2. RECEBIMENTO DO ARQUIVO
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || file.type !== 'application/pdf') {
      return Response.json({ error: 'Apenas arquivos PDF são permitidos' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      return Response.json({ error: 'Arquivo muito grande. Máximo 10MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. SALVAR DOCUMENTO
    const document = await prisma.document.create({
      data: {
        userId: decoded.userId,
        nome_arquivo: file.name,
        caminho_armazenamento: `/uploads/documents/${Date.now()}_${file.name}`,
      },
    });

    // 4. EXTRAÇÃO DE TEXTO (DIGITAL)
    let digitalText = "";
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
        digitalText = pdfData.text.trim();
        console.log(`✅ Texto digital extraído: ${digitalText.length} caracteres`);
      }
    } catch (e) {
      console.warn("⚠️ Falha na extração digital, tentando OCR visual...");
    }

    // 5. FALLBACK OCR VISUAL
    let combinedPageContent = "";
    const validBase64Images = [];
    
    if (!digitalText || digitalText.length < 100) {
      try {
        console.log("🔄 Iniciando conversão PDF -> Imagem via Cloudmersive...");
        const cloudmersiveFormData = new FormData();
        cloudmersiveFormData.append('inputFile', new Blob([buffer], { type: 'application/pdf' }), file.name);

        const convertRes = await axios.post(
          'https://api.cloudmersive.com/convert/pdf/to/png',
          cloudmersiveFormData,
          {
            headers: { 'Apikey': process.env.CLOUDMERSIVE_API_KEY },
            responseType: 'arraybuffer' 
          }
        );

        const responseBuffer = Buffer.from(convertRes.data);
        const responseString = responseBuffer.toString('utf-8');

        if (responseString.trim().startsWith('{')) {
          const jsonData = JSON.parse(responseString);
          
          if (Array.isArray(jsonData.PngResultPages)) {
            for (const page of jsonData.PngResultPages) {
              // CASO A: A API enviou o Base64 direto (ImageData)
              if (page.ImageData) {
                validBase64Images.push(page.ImageData);
                console.log(`📸 Página ${page.PageNumber} capturada via Base64`);
              } 
              // CASO B: A API enviou um link para a imagem (URL) -> Precisamos baixar!
              else if (page.URL) {
                try {
                  console.log(`📥 Baixando imagem da página ${page.PageNumber} via URL...`);
                  const imageRes = await axios.get(page.URL, { responseType: 'arraybuffer' });
                  const imgBuffer = Buffer.from(imageRes.data);
                  if (isValidImageBuffer(imgBuffer)) {
                    validBase64Images.push(imgBuffer.toString('base64'));
                    console.log(`✅ Página ${page.PageNumber} baixada e convertida.`);
                  }
                } catch (downloadErr) {
                  console.error(`❌ Erro ao baixar imagem da página ${page.PageNumber}:`, downloadErr.message);
                }
              }
            }
          } else if (jsonData.Content) {
            validBase64Images.push(jsonData.Content);
          }
        } else if (responseBuffer[0] === 0x50 && responseBuffer[1] === 0x4B) {
          const zip = new AdmZip(responseBuffer);
          zip.getEntries().forEach(entry => {
            if (entry.entryName.toLowerCase().endsWith('.png')) {
              validBase64Images.push(entry.getData().toString('base64'));
            }
          });
        } else if (isValidImageBuffer(responseBuffer)) {
          validBase64Images.push(responseBuffer.toString('base64'));
        }

        console.log(`✅ Total de imagens prontas para GPT Vision: ${validBase64Images.length}`);

      } catch (e) {
        console.error("❌ Erro Cloudmersive:", e.message);
      }
    }

    if (validBase64Images.length > 0) {
      try {
        console.log(`🚀 Enviando ${validBase64Images.length} imagens para o GPT-4o-mini Vision...`);
        const contentArray = [{ type: "text", text: "Realize a leitura OCR completa. Extraia todos os dados com exatidão." }];
        
        validBase64Images.forEach(img => {
          contentArray.push({ 
            type: "image_url", 
            image_url: { url: `data:image/png;base64,${img}`, detail: "high" }
          });
        });

        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.1,
          messages: [
            { role: "system", content: "Você é um motor de OCR. Retorne apenas a transcrição pura dos dados." },
            { role: "user", content: contentArray }
          ],
        });
        combinedPageContent = visionResponse.choices[0].message.content;
        console.log("✅ OCR via OpenAI Vision concluído!");
      } catch (e) { 
        console.error("❌ Erro no GPT Vision:", e.message); 
      }
    }

    if (!combinedPageContent && digitalText) combinedPageContent = digitalText;
    if (!combinedPageContent || combinedPageContent.trim().length === 0) {
      combinedPageContent = "Texto indisponível ou não reconhecido no documento.";
    }

    console.log("📄 CONTEÚDO FINAL PARA INDEXAÇÃO:", combinedPageContent);

    // 6. GERAÇÃO DE EMBEDDINGS COM CHUNKING
    try {
      const chunks = createChunks(combinedPageContent);
      for (const chunkText of chunks) {
        const embeddingRes = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunkText,
        });
        const vector = embeddingRes.data[0].embedding;
        const vectorString = `[${vector.join(',')}]`;
        const createdChunk = await prisma.pdfChunk.create({
          data: { documentId: document.id, content: chunkText },
        });
        await prisma.$executeRaw`UPDATE "pdf_chunks" SET "embedding" = ${vectorString}::vector WHERE "id" = ${createdChunk.id}`;
      }
      console.log(`✅ Documento indexado em ${chunks.length} fragmentos.`);
    } catch (e) {
      console.error("❌ Erro nos Embeddings:", e);
    }

    return Response.json({
      success: true,
      message: 'Arquivo processado e indexado!',
      document: { id: document.id, fileName: document.nome_arquivo, text: combinedPageContent },
    });

  } catch (error) {
    console.error('❌ Erro Geral no Upload:', error);
    return Response.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
