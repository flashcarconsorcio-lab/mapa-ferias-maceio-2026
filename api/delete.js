
import { del } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Método não permitido'
    });
  }

  try {
    const body = request.body || {};
    const pathname = body.pathname;
    const password = body.password;

    if (
      !process.env.ADMIN_PASSWORD ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return response.status(401).json({
        error: 'Senha de administrador incorreta'
      });
    }

    if (!pathname || !pathname.startsWith('media/')) {
      return response.status(400).json({
        error: 'Arquivo inválido'
      });
    }

    await del(pathname);

    return response.status(200).json({
      ok: true,
      pathname
    });

  } catch (error) {
    console.error('ERRO DELETE:', error);

    return response.status(500).json({
      error: error?.message || 'Falha ao excluir arquivo'
    });
  }
}
