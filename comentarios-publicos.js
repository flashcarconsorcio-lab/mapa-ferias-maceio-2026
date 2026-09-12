async function carregarComentariosPublicos() {
  lista.innerHTML = 'Carregando comentários...';

  try {
    const r = await fetch(
      '/api/comments?stage=' + encodeURIComponent(stage),
      { cache: 'no-store' }
    );

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data.error || 'Erro ao carregar comentários');
    }

    const comentarios = data.comments || [];

    if (!comentarios.length) {
      lista.innerHTML = '<p>Nenhum comentário ainda.</p>';
      return;
    }

    lista.innerHTML = comentarios.map(c => `
      <div class="comment">
        <b>${esc(c.name)}</b>
        <div>${esc(c.text)}</div>
      </div>
    `).join('');

  } catch (e) {
    lista.innerHTML =
      '<p>Não foi possível carregar os comentários.</p>';
  }
}

publicar.onclick = async function () {
  const n = nome.value.trim();
  const t = texto.value.trim();

  if (!n || !t) {
    alert('Digite seu nome e comentário.');
    return;
  }

  publicar.disabled = true;
  publicar.textContent = 'Publicando...';

  try {
    const r = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stage: stage,
        name: n,
        text: t
      })
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data.error || 'Erro ao publicar');
    }

    texto.value = '';

    await carregarComentariosPublicos();

  } catch (e) {
    alert(e.message);
  } finally {
    publicar.disabled = false;
    publicar.textContent = 'Publicar comentário';
  }
};

carregarComentariosPublicos();
