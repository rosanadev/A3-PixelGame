// Avaliações da comunidade — equivalente a ReviewsPage.jsx (reviewService.getAll).
import { reviewService } from '../api.js';
import { initLayout, escapeHtml, el, stars, renderPagination } from '../common.js';

const PER_PAGE = 10;
const { main } = initLayout();

let all = [];
let page = 1;

main.innerHTML = `
  <div class="container page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Avaliações da comunidade</h1>
        <p class="page-subtitle">Veja o que os jogadores estão dizendo.</p>
      </div>
    </header>
    <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
    <div id="pagination"></div>
  </div>
`;

const contentEl = main.querySelector('#content');
const paginationEl = main.querySelector('#pagination');

reviewService.getAll()
  .then((data) => { all = Array.isArray(data) ? data : []; render(); })
  .catch((err) => {
    if (err.status === 204) { all = []; render(); }
    else contentEl.innerHTML = '<div class="alert alert-error" role="alert">Erro ao carregar as avaliações.</div>';
  });

function render() {
  if (all.length === 0) {
    contentEl.innerHTML = '<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">★</span><p>Ainda não há avaliações cadastradas.</p></div>';
    paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const card = el('<section class="card" aria-label="Lista de avaliações"></section>');
  items.forEach((av) => {
    const jogoNome = av.jogo?.nome || av.jogoNome || av.nomeJogo;
    const jogoId = av.jogo?.id ?? av.fkJogo ?? av.jogoId;
    const autor = av.usuario?.nome || av.usuarioNome || av.autor || 'Anônimo';
    const jogoHtml = jogoNome
      ? (jogoId
          ? `<span class="item-meta" style="margin-left:.5rem"><a href="game.html?id=${encodeURIComponent(jogoId)}">${escapeHtml(jogoNome)}</a></span>`
          : `<span class="item-meta" style="margin-left:.5rem">${escapeHtml(jogoNome)}</span>`)
      : '';
    card.appendChild(el(`
      <div class="review">
        <div class="review-head">
          <div><span class="stars">${stars(av.nota)}</span>${jogoHtml}</div>
          <span class="item-meta">${escapeHtml(autor)}</span>
        </div>
        <p>${av.comentario ? escapeHtml(av.comentario) : '<em>(sem comentário)</em>'}</p>
      </div>
    `));
  });
  contentEl.innerHTML = '';
  contentEl.appendChild(card);

  renderPagination(paginationEl, page, totalPages, (p) => { page = p; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}
