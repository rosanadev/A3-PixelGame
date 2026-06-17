// Catálogo público — equivalente a CatalogPage.jsx (publicService.getJogos).
import { publicService } from '../api.js';
import { initLayout, formatPrice, escapeHtml, el, renderPagination } from '../common.js';

const GAMES_PER_PAGE = 12;
const { main } = initLayout();

let allGames = [];
let page = 1;
let search = '';

main.innerHTML = `
  <div class="container page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Catálogo público</h1>
        <p class="page-subtitle">Explore nossos jogos sem precisar de login.</p>
      </div>
      <div class="form-group" style="margin:0;min-width:240px">
        <label for="catalog-search" class="sr-only">Buscar jogo</label>
        <input id="catalog-search" type="search" class="input-field" placeholder="Buscar jogo..." aria-label="Buscar jogo no catálogo" />
      </div>
    </header>
    <div id="games"></div>
    <div id="pagination"></div>
  </div>
`;

const gamesEl = main.querySelector('#games');
const paginationEl = main.querySelector('#pagination');
const searchEl = main.querySelector('#catalog-search');

searchEl.addEventListener('input', () => { search = searchEl.value.trim().toLowerCase(); page = 1; render(); });

gamesEl.innerHTML = '<div class="page-loading"><div class="spinner"></div></div>';

publicService.getJogos()
  .then((data) => { allGames = data?.games || data || []; render(); })
  .catch(() => { gamesEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar o catálogo.</div>'; });

function render() {
  const filtered = search
    ? allGames.filter((g) => (g.nome || g.titulo || '').toLowerCase().includes(search))
    : allGames;

  if (filtered.length === 0) {
    gamesEl.innerHTML = '<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">🎮</span><p>Nenhum jogo encontrado no catálogo.</p></div>';
    paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / GAMES_PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = filtered.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);

  const grid = el('<div class="games-grid"></div>');
  items.forEach((game) => {
    const title = game.nome || game.titulo || 'Sem título';
    const category = game.categoria?.nome || game.categoria || '';
    const img = game.imagem || game.image;
    grid.appendChild(el(`
      <article class="game-card card" aria-label="Jogo: ${escapeHtml(title)}">
        <div class="game-card-img" aria-hidden="true">
          ${img ? `<img src="${escapeHtml(img)}" alt="Capa do jogo ${escapeHtml(title)}" loading="lazy" />`
                : '<div class="game-card-placeholder">🎮</div>'}
        </div>
        <div class="game-card-body">
          <div class="game-card-tags">${category ? `<span class="badge badge-purple">${escapeHtml(category)}</span>` : ''}</div>
          <h2 class="game-card-title">${escapeHtml(title)}</h2>
          <div class="game-card-footer">
            <span class="game-card-price">${formatPrice(game.preco, true)}</span>
            <a href="game.html?id=${encodeURIComponent(game.id)}" class="btn btn-outline game-card-btn">Ver mais</a>
          </div>
        </div>
      </article>
    `));
  });
  gamesEl.innerHTML = '';
  gamesEl.appendChild(grid);

  renderPagination(paginationEl, page, totalPages, (p) => { page = p; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}
