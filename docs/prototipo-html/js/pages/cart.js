// Carrinho — equivalente a CartPage.jsx.
import { cartService, gameService } from '../api.js';
import { initLayout, requireAuth, formatPrice, escapeHtml, el } from '../common.js';

if (!requireAuth()) throw new Error('redirecting');
const { main } = initLayout();

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Meu Carrinho</h1></header>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
  </div>
`;
const contentEl = main.querySelector('#content');

let items = [];

loadCart();

async function loadCart() {
  try {
    const data = await cartService.get();
    const itens = data?.carrinho?.itens || [];
    items = await Promise.all(itens.map(async (item) => {
      try { return { ...item, jogo: await gameService.getById(item.fkJogo) }; }
      catch { return { ...item, jogo: null }; }
    }));
    render();
  } catch {
    contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar o carrinho.</div>';
  }
}

function render() {
  if (items.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon" aria-hidden="true">🛒</span>
        <p>Seu carrinho está vazio.</p>
        <a href="index.html" class="btn btn-primary mt-1">Explorar jogos</a>
      </div>`;
    return;
  }

  const total = items.reduce((s, i) => s + (Number(i.jogo?.preco) || 0), 0);

  const layout = el('<div class="split-layout"></div>');
  const list = el('<div class="item-list"></div>');
  items.forEach((item) => {
    const nome = item.jogo?.nome || `Jogo #${item.fkJogo}`;
    const row = el(`
      <div class="card item-row">
        <div class="item-thumb" aria-hidden="true">🎮</div>
        <div class="item-info">
          <div class="item-title">${item.jogo
            ? `<a href="game.html?id=${encodeURIComponent(item.fkJogo)}">${escapeHtml(item.jogo.nome)}</a>`
            : escapeHtml(nome)}</div>
          <div class="item-meta">${escapeHtml(item.jogo?.ano ? String(item.jogo.ano) : '')}</div>
        </div>
        <span class="item-price">${formatPrice(item.jogo?.preco)}</span>
        <button class="btn btn-ghost" aria-label="Remover ${escapeHtml(nome)} do carrinho">✕</button>
      </div>
    `);
    row.querySelector('button').addEventListener('click', () => remove(item.fkJogo));
    list.appendChild(row);
  });

  const aside = el(`
    <aside class="card summary-card" aria-label="Resumo do pedido">
      <h2>Resumo</h2>
      <div class="summary-line"><span>Itens (${items.length})</span><span>${formatPrice(total)}</span></div>
      <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn-primary" id="checkout">Finalizar compra</button>
    </aside>
  `);
  aside.querySelector('#checkout').addEventListener('click', () => { location.href = 'checkout.html'; });

  layout.appendChild(list);
  layout.appendChild(aside);
  contentEl.innerHTML = '';
  contentEl.appendChild(layout);
}

async function remove(fkJogo) {
  try {
    await cartService.removeItem(fkJogo);
    items = items.filter((i) => i.fkJogo !== fkJogo);
    render();
  } catch {
    contentEl.insertAdjacentHTML('afterbegin', '<div class="alert alert-error" role="alert">Não foi possível remover o item.</div>');
  }
}
