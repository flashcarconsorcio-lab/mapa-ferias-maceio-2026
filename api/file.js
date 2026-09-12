import { get } from '@vercel/blob';

export default async function handler(request) {
  const u = new URL(request.url);
  const pathname = u.searchParams.get('pathname');

  if (!pathname || !pathname.startsWith('media/')) {
    return new Response(
      'Arquivo inválido',
      { status: 400 }
    );
  }

  try {
    const r = await get(pathname, {
      access: 'private'
    });

    if (!r || r.statusCode !== 200) {
      return new Response(
        'Não encontrado',
        { status: 404 }
      );
    }

    return new Response(r.stream, {
      headers: {
        'Content-Type':
          r.blob.contentType || 'application/octet-stream',

        'X-Content-Type-Options': 'nosniff',

        'Cache-Control':
          'public, max-age=3600'
      }
    });

  } catch (e) {
    return new Response(
      'Falha ao abrir arquivo',
      { status: 500 }
    );
  }
}
