 import { list } from '@vercel/blob';

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

export default async function handler(request, response) {
  const u = new URL(request.url, 'http://localhost');

  const stage = u.searchParams.get('stage');
  const kind = u.searchParams.get('kind');

  if (!stages.has(stage) || !kinds.has(kind)) {
    return response.status(400).json({
      error: 'Parâmetros inválidos'
    });
  }

  try {
    const prefix = `media/${stage}/${kind}/`;

    let cursor;
    const all = [];

    do {
      const resultado = await list({
        prefix,
        limit: 250,
        cursor
      });

      all.push(...resultado.blobs);
      cursor = resultado.cursor;

    } while (cursor);

    const items = all
      .sort(
        (a, b) =>
          new Date(b.uploadedAt) -
          new Date(a.uploadedAt)
      )
      .map(blob => ({
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        url:
          `/api/file?pathname=${encodeURIComponent(
            blob.pathname
          )}`
      }));

    response.setHeader('Cache-Control', 'no-store');

    return response.status(200).json({
      items
    });

  } catch (erro) {
    console.error('ERRO MEDIA:', erro);

    return response.status(500).json({
      error: erro?.message || 'Falha ao listar arquivos'
    });
  }
}
