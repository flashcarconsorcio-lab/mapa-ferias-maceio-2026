
import { handleUpload } from '@vercel/blob/client';

const stages = new Set([
  'casa',
  'uber',
  'tiete',
  'congonhas',
  'maceio',
  'maceio-dia-1',
  'maceio-dia-2',
  'maceio-dia-3',
  'maceio-dia-4',
  'maceio-dia-5'
]);

const kinds = new Set([
  'fotos',
  'videos'
]);

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        let dados = {};

        try {
          dados = JSON.parse(clientPayload || '{}');
        } catch {}

        if (
          !process.env.ADMIN_PASSWORD ||
          dados.password !== process.env.ADMIN_PASSWORD
        ) {
          throw new Error(
            'Senha de administrador incorreta.'
          );
        }

        if (
          !stages.has(dados.stage) ||
          !kinds.has(dados.kind)
        ) {
          throw new Error(
            'Etapa ou tipo inválido.'
          );
        }

        const prefix =
          `media/${dados.stage}/${dados.kind}/`;

        if (!pathname.startsWith(prefix)) {
          throw new Error(
            'Caminho de arquivo inválido.'
          );
        }

        return {
          allowedContentTypes:
            dados.kind === 'fotos'
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
            stage: dados.stage,
            kind: dados.kind
          })
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload
      }) => {
        console.log(
          'Upload concluído:',
          blob.pathname,
          tokenPayload
        );
      }
    });

    return Response.json(jsonResponse);

  } catch (error) {
    console.error('ERRO UPLOAD:', error);

    return Response.json(
      {
        error:
          error?.message ||
          'Falha no upload'
      },
      {
        status: 400
      }
    );
  }
}
