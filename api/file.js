import { get } from '@vercel/blob';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const pathname = url.searchParams.get('pathname');

    if (!pathname || !pathname.startsWith('media/')) {
      return new Response('Arquivo inválido', {
        status: 400
      });
    }

    const result = await get(pathname, {
      access: 'private'
    });

    if (!result || result.statusCode !== 200) {
      return new Response('Não encontrado', {
        status: 404
      });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        'Content-Type':
          result.blob?.contentType ||
          'application/octet-stream',
        'Cache-Control':
          'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('ERRO FILE:', error);

    return new Response(
      error?.message || 'Erro ao carregar arquivo',
      { status: 500 }
    );
  }
}
