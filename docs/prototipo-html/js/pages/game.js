// Detalhes do jogo — equivalente a GameDetailPage.jsx.
import { gameService, cartService, wishlistService, reviewService } from '../api.js';
import { initLayout, getCurrentUser, formatPrice, getParam, escapeHtml, el, stars, toast } from '../common.js';

const { main } = initLayout();
const id = getParam('id');

let game = null;
let reviews = { media: 0, total: 0, lista: [] };

main.innerHTML = '<div class="page-loading"><div class="spinner"></div></div>';

if (!id) {
  showError('Jogo não encontrado.');
} else {
  Promise.all([
    gameService.getById(id),
    reviewService.getMedia(id).catch(() => null),
  ])
    .then(([g, media]) => {
      if (!g || !g.id) { showError('Jogo não encontrado.'); return; }
      game = g;
      if (media) reviews = { media: media.media ?? 0, total: media.totalAvaliacoes ?? 0, lista: media.avaliacoes ?? [] };
      render();
    })
    .catch(() => showError('Erro ao carregar o jogo.'));
}

function showError(msg) {
  main.innerHTML = `
    <div class="container page">
      <div class="alert alert-error" role="alert">${escapeHtml(msg)}</div>
      <a class="btn btn-outline" href="index.html">Voltar à loja</a>
    </div>`;
}

function ensureLogin() {
  if (!getCurrentUser()) { location.href = 'login.html'; return false; }
  return true;
}

function render() {
  main.innerHTML = `
    <div class="container page">
      <article class="detail-grid">
        <div class="detail-cover" aria-hidden="true">
          ${game.imagem ? `<img src="${escapeHtml(game.imagem)}" alt="Capa de ${escapeHtml(game.nome)}" />` : '🎮'}
        </div>
        <div>
          <h1 class="page-title">${escapeHtml(game.nome)}</h1>
          <p class="page-subtitle">${game.ano ? `Lançamento: ${escapeHtml(String(game.ano))}` : 'Ano não informado'}</p>
          <div class="row-between mt-1">
            <span>
              <span class="stars">${stars(reviews.media)}</span>
              ${reviews.media ? `${reviews.media} (${reviews.total})` : 'Sem avaliações'}
            </span>
          </div>
          <p class="detail-price">${formatPrice(game.preco, true)}</p>
          ${game.desconto > 0 ? `<span class="badge badge-purple">${game.desconto}% OFF</span>` : ''}
          <div class="detail-actions">
            <button class="btn btn-primary" id="buy">⚡ Comprar agora</button>
            <button class="btn btn-outline" id="add-cart">＋ Adicionar ao carrinho</button>
            <button class="btn btn-outline" id="add-wish">♡ Lista de desejos</button>
          </div>
          <h2 class="mt-1">Sobre o jogo</h2>
          <p class="page-subtitle">${escapeHtml(game.descricao || 'Sem descrição disponível.')}</p>
        </div>
      </article>

      <section class="card mt-1" aria-label="Avaliações">
        <h2>Avaliações (${reviews.total})</h2>
        <form id="review-form" class="mt-1">
          <div class="form-row">
            <div class="form-group" style="flex:0 0 120px">
              <label for="nota">Sua nota</label>
              <select id="nota" class="input-field">
                ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n} ★</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="comentario">Comentário</label>
              <input id="comentario" class="input-field" placeholder="O que achou do jogo?" />
            </div>
          </div>
          <button class="btn btn-primary" id="send-review">Enviar avaliação</button>
        </form>
        <div id="review-list" class="mt-1"></div>
      </section>
    </div>
  `;

  main.querySelector('#buy').addEventListener('click', (e) => buyNow(e.currentTarget));
  main.querySelector('#add-cart').addEventListener('click', addToCart);
  main.querySelector('#add-wish').addEventListener('click', addToWishlist);
  main.querySelector('#review-form').addEventListener('submit', submitReview);
  renderReviewList();
}

function renderReviewList() {
  const listEl = main.querySelector('#review-list');
  if (!reviews.lista.length) {
    listEl.innerHTML = '<p class="page-subtitle">Seja o primeiro a avaliar este jogo.</p>';
    return;
  }
  listEl.innerHTML = reviews.lista.map((av) => `
    <div class="review">
      <div class="review-head"><span class="stars">${stars(av.nota)}</span></div>
      <p>${av.comentario ? escapeHtml(av.comentario) : '<em>(sem comentário)</em>'}</p>
    </div>
  `).join('');
}

async function addToCart() {
  if (!ensureLogin()) return;
  try {
    await cartService.addItem(game.id);
    toast(`${game.nome} adicionado ao carrinho!`, 'success');
  } catch (err) {
    toast(err.data?.message || 'Não foi possível adicionar ao carrinho.', 'error');
  }
}

async function buyNow(btn) {
  if (!ensureLogin()) return;
  btn.disabled = true;
  btn.textContent = 'Processando...';
  try {
    await cartService.addItem(game.id);
    location.href = 'checkout.html';
  } catch (err) {
    try {
      const data = await cartService.get();
      const noCarrinho = (data?.carrinho?.itens || []).some((i) => i.fkJogo === game.id);
      if (noCarrinho) { location.href = 'checkout.html'; return; }
    } catch { /* ignora */ }
    toast(err.data?.message || 'Não foi possível iniciar a compra.', 'error');
    btn.disabled = false;
    btn.textContent = '⚡ Comprar agora';
  }
}

async function addToWishlist() {
  if (!ensureLogin()) return;
  try {
    await wishlistService.add(game.id);
    toast('Jogo adicionado à lista de desejos!', 'success');
  } catch (err) {
    toast(err.data?.error || 'Jogo já está na lista de desejos.', 'info');
  }
}

async function submitReview(e) {
  e.preventDefault();
  if (!ensureLogin()) return;
  const btn = main.querySelector('#send-review');
  const nota = Number(main.querySelector('#nota').value);
  const comentario = main.querySelector('#comentario').value;
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  try {
    await reviewService.create(game.id, nota, comentario);
    toast('Avaliação enviada! Obrigado.', 'success');
    await reloadReviews();
  } catch (err) {
    if (err.status === 400) {
      try {
        await reviewService.update(game.id, nota, comentario);
        toast('Avaliação atualizada!', 'success');
        await reloadReviews();
        return;
      } catch { /* cai no erro abaixo */ }
    }
    toast(err.data?.message || 'Não foi possível enviar a avaliação.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar avaliação';
    main.querySelector('#comentario').value = '';
  }
}

async function reloadReviews() {
  try {
    const media = await reviewService.getMedia(game.id);
    reviews = { media: media?.media ?? 0, total: media?.totalAvaliacoes ?? 0, lista: media?.avaliacoes ?? [] };
  } catch {
    reviews = { media: 0, total: 0, lista: [] };
  }
  render();
}
