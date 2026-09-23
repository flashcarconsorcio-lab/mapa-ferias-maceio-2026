import { get, put } from '@vercel/blob';

const PATH = 'config/mapa-status.json';
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
function authorized(request) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && request.headers.get('x-admin-password') === expected);
}
async function readStatus() {
  const blob = await get(PATH, { access: 'private' });
  if (!blob || blob.statusCode === 404) return true;
  if (blob.statusCode !== 200) throw new Error('Falha ao ler o estado do mapa');
  const state = await new Response(blob.stream).json();
  return state.active === true;
}
export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      const active = await readStatus();
      return Response.json({ active, admin: authorized(request) }, { headers });
    }
    if (request.method !== 'POST') return Response.json({ error: 'Método não permitido' }, { status: 405, headers });
    if (!authorized(request)) return Response.json({ error: 'Senha de administrador incorreta' }, { status: 401, headers });
    const body = await request.json().catch(() => null);
    if (typeof body?.active !== 'boolean') return Response.json({ error: 'Estado inválido' }, { status: 400, headers });
    await put(PATH, JSON.stringify({ active: body.active, updatedAt: new Date().toISOString() }), {
      access: 'private', allowOverwrite: true, addRandomSuffix: false,
      contentType: 'application/json', cacheControlMaxAge: 60,
    });
    return Response.json({ active: body.active, admin: true }, { headers });
  } catch (error) {
    console.error('map-status:', error);
    return Response.json({ error: 'Não foi possível consultar ou alterar o mapa' }, { status: 500, headers });
  }
}
