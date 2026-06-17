// Admin: Categorias (somente leitura) — equivalente a AdminCategoriesPage.jsx.
import { categoryService } from '../api.js';
import { initLayout, requireAdmin, escapeHtml } from '../common.js';

if (!requireAdmin()) throw new Error('redirecting');
const { main } = initLayout();

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Categorias</h1></header>
    <div class="alert alert-info" role="note">
      A API atual permite apenas a consulta de categorias. Criação e edição não estão disponíveis neste endpoint.
    </div>
    <div id="error"></div>
    <section class="card" aria-label="Lista de categorias">
      <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
    </section>
  </div>
`;

const contentEl = main.querySelector('#content');

categoryService.getAll()
  .then((data) => render(Array.isArray(data) ? data : []))
  .catch(() => { main.querySelector('#error').innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar as categorias.</div>'; contentEl.innerHTML = ''; });

function render(categories) {
  if (categories.length === 0) {
    contentEl.innerHTML = '<p class="page-subtitle">Nenhuma categoria cadastrada.</p>';
    return;
  }
  contentEl.innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Nome</th></tr></thead>
      <tbody>
        ${categories.map((c) => `<tr><td>${escapeHtml(String(c.id))}</td><td>${escapeHtml(c.nome)}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}
