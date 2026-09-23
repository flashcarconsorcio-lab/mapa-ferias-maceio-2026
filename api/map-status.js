import { list, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const PREFIX = 'config/mapa-status/';
function authorized(req) {
  return Boolean(process.env.ADMIN_PASSWORD &&
    req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD);
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const result = await list({ prefix: PREFIX, limit: 1000 });
      // O nome contém a data em ordem crescente; nenhum arquivo precisa ser aberto.
      const latest = result.blobs.map(b => b.pathname).sort().at(-1);
      const active = latest ? latest.endsWith('-ativo.json') : true;
      return res.status(200).json({ active });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    if (!authorized(req)) return res.status(401).json({ error: 'Senha de administrador incorreta' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (body?.preview === true) return res.status(200).json({ admin: true });
    if (typeof body?.active !== 'boolean') return res.status(400).json({ error: 'Estado inválido' });
    const pathname = PREFIX + new Date().toISOString() + '-' + randomUUID() +
      (body.active ? '-ativo.json' : '-manutencao.json');
    await put(pathname, JSON.stringify({ active: body.active }), {
      access: 'private', addRandomSuffix: false, contentType: 'application/json'
    });
    return res.status(200).json({ active: body.active, admin: true });
  } catch (error) {
    console.error('map-status:', error);
    return res.status(500).json({ error: 'Não foi possível consultar ou alterar o mapa' });
  }
}
