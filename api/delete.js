import { del } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Método não permitido' },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const pathname = body?.pathname;

    if (!pathname || !pathname.startsWith('media/')) {
      return Response.json(
        { error: 'Arquivo inválido' },
        { status: 400 }
      );
    }

    await del(pathname);

    return Response.json({
      ok: true,
      pathname
    });

  } catch (e) {
    return Response.json(
      {
        error: e?.message || 'Falha ao excluir arquivo'
      },
      { status: 500 }
    );
  }
}
