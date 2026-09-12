import { list } from '@vercel/blob';

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

 export default async function handler(request) {
  const u = new URL(request.url, 'http://localhost');
  const stage = u.searchParams.get('stage');
  const kind = u.searchParams.get('kind');

  if (!stages.has(stage) || !kinds.has(kind)) {
    return Response.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );
  }

  try {
    const prefix = `media/${stage}/${kind}/`;

    let cursor;
    const all = [];

    do {
      const r = await list({
        prefix,
        limit: 250,
        cursor
      });

      all.push(...r.blobs);
      cursor = r.cursor;

    } while (cursor);

    const items = all
      .sort(
        (a, b) =>
          new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )
      .map(b => ({
        pathname: b.pathname,
        uploadedAt: b.uploadedAt,
        url:
          `/api/file?pathname=${encodeURIComponent(
            b.pathname
          )}`
      }));

    return Response.json(
      { items },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (e) {
    return Response.json(
      { error: e?.message || 'Falha ao listar' },
      { status: 500 }
    );
  }
}
