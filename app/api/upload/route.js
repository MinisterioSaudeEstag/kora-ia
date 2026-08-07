import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';
import OpenAI from 'openai';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { extractText } from 'unpdf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'fake-key' });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      console.error('Erro na validação do token Supabase:', authError);
      return Response.json({ error: 'Sessão expirada ou token inválido' }, { status: 401 });
    }

    let dbUser = null;
    if (supabaseUser.email) {
      try {
        dbUser = await prisma.user.findFirst({
          where: { email: supabaseUser.email },
        });
      } catch (e) {
        console.warn('⚠️ Erro ao buscar usuário no Prisma:', e.message);
      }
    }

    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email || `user_${supabaseUser.id}@example.com`,
            name: supabaseUser.user_metadata?.name || 'Usuário',
          },
        });
      } catch (userCreateErr) {
        console.warn('⚠️ Aviso ao criar usuário no Prisma:', userCreateErr.message);
      }
    }

    const userIdToUse = dbUser ? dbUser.id : supabaseUser.id;

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
    const uint8Array = new Uint8Array(arrayBuffer); 
    const buffer = Buffer.from(arrayBuffer);

    let document;
    try {
      document = await prisma.document.create({
        data: {
          userId: userIdToUse,
          nome_arquivo: file.name,
          caminho_armazenamento: `/uploads/documents/${Date.now()}_${file.name}`,
        },
      });
    } catch (docErr) {
      console.error('❌ Erro ao criar registro de documento no Prisma:', docErr);
      throw new Error(`Falha no banco de dados (Prisma/Document): ${docErr.message}`);
    }

    let digitalText = "";
    try {
      const { text } = await extractText(uint8Array);
      if (text && Array.isArray(text)) {
        const fullText = text.join('\n').trim();
        if (fullText.length > 0) {
          digitalText = fullText;
          console.log(`✅ Texto digital extraído com unpdf: ${digitalText.length} caracteres`);
        }
      }
    } catch (e) {
      console.warn("⚠️ Falha na extração digital com unpdf:", e.message);
    }

    let combinedPageContent = "";
    const validBase64Images = [];

    if ((!digitalText || digitalText.length < 100) && process.env.CLOUDMERSIVE_API_KEY) {
      try {
        console.log("🔄 Convertendo PDF para Imagem via Cloudmersive...");
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
              if (page.ImageData) validBase64Images.push(page.ImageData);
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
      } catch (e) {
        console.error("❌ Erro no processamento Cloudmersive:", e.message);
      }
    }

    if (validBase64Images.length > 0 && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'fake-key') {
      try {
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
      } catch (e) {
        console.error("❌ Erro no GPT Vision:", e.message);
      }
    }

    if (!combinedPageContent && digitalText) combinedPageContent = digitalText;
    if (!combinedPageContent || combinedPageContent.trim().length === 0) {
      combinedPageContent = "Texto indisponível ou não reconhecido no documento.";
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'fake-key') {
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
      } catch (e) {
        console.error("❌ Erro na geração de Embeddings:", e.message);
      }
    }

    return Response.json({
      success: true,
      message: 'Arquivo processado e indexado!',
      document: { id: document.id, fileName: document.nome_arquivo, text: combinedPageContent },
    });

  } catch (error) {
    console.error('❌ Erro Geral no Upload:', error);
    return Response.json(
      { 
        error: 'Erro interno no servidor', 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
}