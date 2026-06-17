// Lista de Desejos — equivalente a WishlistPage.jsx.
import { wishlistService, cartService } from '../api.js';
import { initLayout, requireAuth, formatPrice, escapeHtml, el, toast, renderPagination } from '../common.js';

if (!requireAuth()) throw new Error('redirecting');
const { main } = initLayout();

const PER_PAGE = 8;
let games = [];
let page = 1;

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Lista de Desejos</h1></header>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
    <div id="pagination"></div>
  </div>
`;
const contentEl = main.querySelector('#content');
const paginationEl = main.querySelector('#pagination');

wishlistService.get()
  .then((data) => { games = Array.isArray(data) ? data : []; render(); })
  .catch(() => { contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar a lista de desejos.</div>'; });

function render() {
  if (games.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon" aria-hidden="true">♡</span>
        <p>Sua lista de desejos está vazia.</p>
        <a href="index.html" class="btn btn-primary mt-1">Explorar jogos</a>
      </div>`;
    paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(games.length / PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = games.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const list = el('<div class="item-list"></div>');
  items.forEach((game) => {
    const row = el(`
      <div class="card item-row">
        <div class="item-thumb" aria-hidden="true">🎮</div>
        <div class="item-info">
          <div class="item-title"><a href="game.html?id=${encodeURIComponent(game.id)}">${escapeHtml(game.nome)}</a></div>
          <div class="item-meta">${escapeHtml(game.ano ? String(game.ano) : '')}</div>
        </div>
        <span class="item-price">${formatPrice(game.preco, true)}</span>
        <button class="btn btn-primary add-cart">＋ Carrinho</button>
        <button class="btn btn-ghost remove" aria-label="Remover ${escapeHtml(game.nome)} da lista de desejos">✕</button>
      </div>
    `);
    row.querySelector('.add-cart').addEventListener('click', () => addToCart(game.id));
    row.querySelector('.remove').addEventListener('click', () => remove(game.id));
    list.appendChild(row);
  });

  contentEl.innerHTML = '';
  contentEl.appendChild(list);
  renderPagination(paginationEl, page, totalPages, (p) => { page = p; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

async function addToCart(jogoId) {
  try {
    await cartService.addItem(jogoId);
    toast('Jogo adicionado ao carrinho!', 'success');
  } catch (err) {
    toast(err.data?.message || 'Não foi possível adicionar ao carrinho.', 'error');
  }
}

async function remove(jogoId) {
  try {
    await wishlistService.remove(jogoId);
    games = games.filter((g) => g.id !== jogoId);
    render();
  } catch {
    toast('Não foi possível remover o item.', 'error');
  }
}
