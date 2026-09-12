import { get } from '@vercel/blob';
import { Readable } from 'node:stream';

export default async function handler(request, response) {
  try {
    const pathname = request.query.pathname;

    if (!pathname || !pathname.startsWith('media/')) {
      return response.status(400).send('Arquivo inválido');
    }

    const result = await get(pathname, {
      access: 'private'
    });

    if (!result || result.statusCode !== 200) {
      return response.status(404).send('Não encontrado');
    }

    response.setHeader(
      'Content-Type',
      result.blob.contentType || 'application/octet-stream'
    );

    response.setHeader(
      'Cache-Control',
      'public, max-age=3600'
    );

    response.setHeader(
      'X-Content-Type-Options',
      'nosniff'
    );

    Readable.fromWeb(result.stream).pipe(response);

  } catch (error) {
    console.error('ERRO FILE:', error);

    return response
      .status(500)
      .send(error?.message || 'Erro ao carregar arquivo');
  }
}
