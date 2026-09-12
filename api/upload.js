import { handleUpload } from '@vercel/blob/client';

const stages = new Set(['casa', 'uber', 'tiete', 'congonhas', 'maceio']);
const kinds = new Set(['fotos', 'videos']);

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      {
        status: 405,
        headers: { 'content-type': 'application/json' }
      }
    );
  }

  try {
    const body = await request.json();

    const result = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let p = {};

        try {
          p = JSON.parse(clientPayload || '{}');
        } catch {}

        if (
          !process.env.ADMIN_PASSWORD ||
          p.password !== process.env.ADMIN_PASSWORD
        ) {
          throw new Error('Senha de administrador incorreta.');
        }

        if (!stages.has(p.stage) || !kinds.has(p.kind)) {
          throw new Error('Etapa ou tipo inválido.');
        }

        const prefix = `media/${p.stage}/${p.kind}/`;

        if (!pathname.startsWith(prefix)) {
          throw new Error('Caminho de arquivo inválido.');
        }

        return {
          allowedContentTypes:
            p.kind === 'fotos'
              ? [
                  'image/jpeg',
                  'image/png',
                  'image/webp',
                  'image/gif',
                  'image/heic',
                  'image/heif'
                ]
              : [
                  'video/mp4',
                  'video/webm',
                  'video/quicktime',
                  'video/x-m4v'
                ],

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            stage: p.stage,
            kind: p.kind
          })
        };
      },

      onUploadCompleted: async () => {}
    });

    return Response.json(result);

  } catch (e) {
    return Response.json(
      { error: e?.message || 'Falha no upload' },
      { status: 400 }
    );
  }
}
