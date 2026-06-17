// Minhas Compras — equivalente a OrderHistoryPage.jsx.
import { orderService, userService } from '../api.js';
import { initLayout, requireAuth, formatPrice, formatDate, getParam, escapeHtml } from '../common.js';

if (!requireAuth()) throw new Error('redirecting');
const { main } = initLayout();

const showSuccess = getParam('sucesso') === '1';

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Minhas Compras</h1></header>
    <div id="success">${showSuccess ? `
      <div class="alert alert-success row-between" role="status">
        <span>Compra realizada com sucesso! 🎉</span>
        <button class="btn btn-ghost" id="close-success" aria-label="Fechar">✕</button>
      </div>` : ''}</div>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
  </div>
`;

const contentEl = main.querySelector('#content');
const closeBtn = main.querySelector('#close-success');
if (closeBtn) closeBtn.addEventListener('click', () => { main.querySelector('#success').innerHTML = ''; });

Promise.all([
  orderService.getHistory().catch(() => []),
  userService.getMyGames().catch(() => []),
]).then(([vendas, jogos]) => {
  render(Array.isArray(vendas) ? vendas : [], Array.isArray(jogos) ? jogos : []);
}).catch(() => {
  contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar suas compras.</div>';
});

function render(orders, games) {
  const ordersHtml = orders.length === 0
    ? '<p class="page-subtitle mt-1">Você ainda não realizou compras.</p>'
    : `<div style="overflow-x:auto" class="mt-1">
        <table class="data-table">
          <thead><tr><th>Pedido</th><th>Data</th><th>Itens</th><th>Total</th></tr></thead>
          <tbody>
            ${orders.map((o) => `
              <tr>
                <td>#${escapeHtml(String(o.id))}</td>
                <td>${escapeHtml(formatDate(o.data))}</td>
                <td>${o.quantidade ?? '—'}</td>
                <td>${formatPrice(o.valor_total ?? o.valorTotal)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  const gamesHtml = games.length === 0
    ? '<p class="page-subtitle mt-1">Nenhum jogo adquirido ainda.</p>'
    : `<div class="item-list mt-1">
        ${games.map((g) => `
          <div class="item-row" style="padding:.5rem 0">
            <div class="item-thumb" aria-hidden="true">🎮</div>
            <div class="item-info">
              <div class="item-title">${escapeHtml(g.jogo?.nome || 'Jogo')}</div>
              <div class="item-meta">Chave: <code>${escapeHtml(g.chaveAtivacao || 'pendente')}</code></div>
            </div>
          </div>`).join('')}
      </div>`;

  contentEl.innerHTML = `
    <section class="card" aria-label="Histórico de pedidos">
      <h2>Histórico de pedidos</h2>
      ${ordersHtml}
    </section>
    <section class="card mt-1" aria-label="Minha biblioteca">
      <h2>Minha biblioteca</h2>
      ${gamesHtml}
    </section>
  `;
}
