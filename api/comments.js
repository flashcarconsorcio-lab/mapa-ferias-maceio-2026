import { put, list, get } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const stages = new Set([
  'casa',
  'uber',
  'tiete',
  'congonhas',
  'maceio'
]);

async function lerBlob(pathname) {
  const result = await get(pathname, {
    access: 'private',
    useCache: false
  });

  if (!result || result.statusCode !== 200) return null;

  const texto = await new Response(result.stream).text();
  return JSON.parse(texto);
}

export default async function handler(request, response) {

  // LISTAR COMENTÁRIOS
  if (request.method === 'GET') {
    try {
      const stage = request.query.stage;

      if (!stages.has(stage)) {
        return response.status(400).json({
          error: 'Etapa inválida'
        });
      }

      const prefix = `comments/${stage}/`;

      const resultado = await list({
        prefix,
        limit: 250
      });

      const comentarios = [];

      for (const blob of resultado.blobs) {
        try {
          const comentario = await lerBlob(blob.pathname);

          if (comentario) {
            comentarios.push(comentario);
          }
        } catch {}
      }

      comentarios.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      response.setHeader('Cache-Control', 'no-store');

      return response.status(200).json({
        comments: comentarios
      });

    } catch (error) {
      console.error('ERRO COMMENTS GET:', error);

      return response.status(500).json({
        error: 'Não foi possível carregar os comentários'
      });
    }
  }

  // PUBLICAR COMENTÁRIO
  if (request.method === 'POST') {
    try {
      const body = request.body || {};

      const stage = String(body.stage || '').trim();
      const name = String(body.name || '').trim();
      const text = String(body.text || '').trim();

      if (!stages.has(stage)) {
        return response.status(400).json({
          error: 'Etapa inválida'
        });
      }

      if (!name || !text) {
        return response.status(400).json({
          error: 'Digite seu nome e comentário'
        });
      }

      if (name.length > 60 || text.length > 1000) {
        return response.status(400).json({
          error: 'Comentário muito grande'
        });
      }

      const id = randomUUID();

      const comentario = {
        id,
        stage,
        name,
        text,
        createdAt: new Date().toISOString()
      };

      const pathname = `comments/${stage}/${id}.json`;

      await put(
        pathname,
        JSON.stringify(comentario),
        {
          access: 'private',
          contentType: 'application/json'
        }
      );

      return response.status(201).json({
        ok: true,
        comment: comentario
      });

    } catch (error) {
      console.error('ERRO COMMENTS POST:', error);

      return response.status(500).json({
        error: 'Não foi possível publicar o comentário'
      });
    }
  }

  return response.status(405).json({
    error: 'Método não permitido'
  });
}
