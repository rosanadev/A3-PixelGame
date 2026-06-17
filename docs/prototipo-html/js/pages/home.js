// Página inicial (loja) — equivalente a HomePage.jsx.
import { gameService, categoryService, cartService } from '../api.js';
import {
  initLayout, getCurrentUser, formatPrice, getParam, escapeHtml,
  el, toast, renderPagination,
} from '../common.js';

const GAMES_PER_PAGE = 12;

const { user, main } = initLayout();

let allGames = [];
let categories = [];
let page = 1;
let query = getParam('q');
let categoryId = getParam('category');

main.innerHTML = `
  <div class="container home-page">
    <section class="home-hero" aria-label="Banner de destaque">
      <h1 class="home-hero-title">Sua loja de jogos digitais</h1>
      <p class="home-hero-sub">Os melhores jogos, na palma da sua mão.</p>
    </section>
    <nav id="categories" class="home-categories" aria-label="Filtrar por categoria"></nav>
    <div id="search-info"></div>
    <div id="games"></div>
    <div id="pagination"></div>
  </div>
`;

const gamesEl = main.querySelector('#games');
const categoriesEl = main.querySelector('#categories');
const searchInfoEl = main.querySelector('#search-info');
const paginationEl = main.querySelector('#pagination');

gamesEl.innerHTML = '<div class="page-loading"><div class="spinner"></div></div>';

categoryService.getAll().then((data) => {
  categories = Array.isArray(data) ? data : [];
  renderCategories();
}).catch(() => {});

gameService.getAll()
  .then((data) => { allGames = data?.games || data || []; render(); })
  .catch(() => { gamesEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar jogos.</div>'; });

function getFiltered() {
  let list = allGames;
  if (categoryId) list = list.filter((g) => String(g.fkCategoria) === String(categoryId));
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((g) => (g.nome || '').toLowerCase().includes(q));
  }
  return list;
}

function renderCategories() {
  categoriesEl.innerHTML = '';
  const mk = (id, label) => {
    const active = String(categoryId) === String(id);
    const btn = el(`<button class="category-chip ${active ? 'active' : ''}" aria-pressed="${active}">${escapeHtml(label)}</button>`);
    btn.addEventListener('click', () => {
      categoryId = id ? String(id) : '';
      query = '';
      page = 1;
      render();
    });
    return btn;
  };
  categoriesEl.appendChild(mk('', 'Todos'));
  categories.forEach((c) => categoriesEl.appendChild(mk(c.id, c.nome || c.name)));
}

function render() {
  renderCategories();
  searchInfoEl.innerHTML = query
    ? `<p class="home-search-info" aria-live="polite">Resultados para: <strong>"${escapeHtml(query)}"</strong></p>`
    : '';

  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / GAMES_PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = filtered.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);

  if (filtered.length === 0) {
    gamesEl.innerHTML = '<p class="home-empty" role="status">Nenhum jogo encontrado.</p>';
    paginationEl.innerHTML = '';
    return;
  }

  const grid = el('<div class="games-grid"></div>');
  items.forEach((g) => grid.appendChild(gameCard(g)));
  gamesEl.innerHTML = '';
  gamesEl.appendChild(grid);

  renderPagination(paginationEl, page, totalPages, (p) => {
    page = p;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function gameCard(game) {
  const title = game.nome || game.titulo || 'Sem título';
  const price = game.preco ?? 0;
  const category = game.categoria?.nome || game.categoria || '';
  const img = game.imagem || game.image;

  const card = el(`
    <article class="game-card card" aria-label="Jogo: ${escapeHtml(title)}">
      <div class="game-card-img" aria-hidden="true">
        ${img ? `<img src="${escapeHtml(img)}" alt="Capa do jogo ${escapeHtml(title)}" loading="lazy" />`
              : '<div class="game-card-placeholder">🎮</div>'}
        <button type="button" class="game-card-cart" aria-label="Adicionar ${escapeHtml(title)} ao carrinho" title="Adicionar ao carrinho">＋</button>
      </div>
      <div class="game-card-body">
        <div class="game-card-tags">${category ? `<span class="badge badge-purple">${escapeHtml(category)}</span>` : ''}</div>
        <h2 class="game-card-title">${escapeHtml(title)}</h2>
        <div class="game-card-footer">
          <span class="game-card-price">${price === 0 ? 'Grátis' : formatPrice(price)}</span>
          <a href="game.html?id=${encodeURIComponent(game.id)}" class="btn btn-outline game-card-btn">Ver mais</a>
        </div>
        <button type="button" class="btn btn-primary game-card-buy">⚡ Comprar agora</button>
      </div>
    </article>
  `);

  const cartBtn = card.querySelector('.game-card-cart');
  cartBtn.addEventListener('click', async () => {
    if (!ensureLogin()) return;
    try {
      await cartService.addItem(game.id);
      cartBtn.classList.add('added');
      cartBtn.textContent = '✓';
      setTimeout(() => { cartBtn.classList.remove('added'); cartBtn.textContent = '＋'; }, 1500);
      toast(`${title} adicionado ao carrinho!`, 'success');
    } catch (err) {
      toast(err.data?.message || 'Não foi possível adicionar ao carrinho.', 'error');
    }
  });

  const buyBtn = card.querySelector('.game-card-buy');
  buyBtn.addEventListener('click', () => buyNow(game, buyBtn));

  return card;
}

function ensureLogin() {
  if (!getCurrentUser()) { location.href = 'login.html'; return false; }
  return true;
}

async function buyNow(game, btn) {
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
    } catch { /* cai no erro abaixo */ }
    toast(err.data?.message || 'Não foi possível iniciar a compra.', 'error');
    btn.disabled = false;
    btn.textContent = '⚡ Comprar agora';
  }
}
