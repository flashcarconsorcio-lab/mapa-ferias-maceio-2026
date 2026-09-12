
import { handleUpload } from '@vercel/blob/client';

const stages = new Set([
  'casa',
  'uber',
  'tiete',
  'congonhas',
  'maceio'
]);

const kinds = new Set([
  'fotos',
  'videos'
]);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Método não permitido'
    });
  }

  try {
    const body = request.body;

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

    return response.status(200).json(
      jsonResponse
    );

  } catch (erro) {
    console.error('ERRO UPLOAD:', erro);

    return response.status(400).json({
      error:
        erro?.message ||
        'Falha no upload'
    });
  }
}
