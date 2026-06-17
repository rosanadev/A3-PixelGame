// Relatórios: jogos mais vendidos — equivalente a ReportsPage.jsx.
// O gráfico do recharts é substituído por um gráfico de barras em CSS puro.
import { reportService } from '../api.js';
import { initLayout, requireAdmin, escapeHtml } from '../common.js';

if (!requireAdmin()) throw new Error('redirecting');
const { main } = initLayout();

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Jogos mais vendidos</h1></header>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
  </div>
`;
const contentEl = main.querySelector('#content');

reportService.jogosMaisVendidos()
  .then((data) => render(Array.isArray(data) ? data : []))
  .catch((err) => {
    if (err.status === 204) render([]);
    else contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar o relatório.</div>';
  });

function render(rows) {
  const data = rows.map((d) => ({ nome: d.nome, empresa: d.empresa, total: Number(d.total) || 0 }));

  if (data.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon" aria-hidden="true">📊</span>
        <p>Ainda não há dados de vendas suficientes para gerar o relatório.</p>
      </div>`;
    return;
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  contentEl.innerHTML = `
    <section class="card" aria-label="Gráfico de vendas">
      <div class="bar-chart">
        ${data.map((d) => `
          <div class="bar-row">
            <span class="bar-label" title="${escapeHtml(d.nome)}">${escapeHtml(d.nome)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(d.total / max) * 100}%"></div></div>
            <span class="bar-value">${d.total}</span>
          </div>`).join('')}
      </div>
    </section>

    <section class="card mt-1" aria-label="Tabela de vendas">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>#</th><th>Jogo</th><th>Empresa</th><th>Vendas</th></tr></thead>
          <tbody>
            ${data.map((d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(d.nome)}</td>
                <td>${escapeHtml(d.empresa || '—')}</td>
                <td>${d.total}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
