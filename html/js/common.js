// Utilidades compartilhadas: navbar, rodapé, toast, formatação e guardas de
// rota. Substitui os contextos (Auth/Cart), o Layout e o sonner do React.

import { getToken, clearToken, decodeJwt, cartService } from './api.js';

// ---------------------------------------------------------------- Sessão / auth
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeJwt(token); // { id, nome, perfil, iat, exp }
  if (!decoded) {
    clearToken();
    return null;
  }
  if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
    clearToken();
    return null;
  }
  return decoded;
}

export function isAdmin(user) {
  return user?.perfil === 'Administrador' || user?.perfil === 'admin';
}

export function logout() {
  clearToken();
  location.href = 'login.html';
}

// Protege páginas que exigem login. Retorna o usuário ou redireciona.
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const back = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    location.href = `login.html?redirect=${back}`;
    return null;
  }
  return user;
}

// Protege páginas que exigem perfil admin.
export function requireAdmin() {
  const user = requireAuth();
  if (!user) return null;
  if (!isAdmin(user)) {
    location.href = 'index.html';
    return null;
  }
  return user;
}

// ---------------------------------------------------------------- Helpers
export function formatPrice(value, freeLabel = false) {
  const n = Number(value) || 0;
  if (freeLabel && n === 0) return 'Grátis';
  return `R$ ${n.toFixed(2)}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleDateString('pt-BR');
}

export function getParam(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

export function stars(value) {
  const full = Math.round(Number(value) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

// ---------------------------------------------------------------- Toast
let toastContainer = null;
export function toast(message, type = 'info') {
  if (!toastContainer) {
    toastContainer = el('<div class="toast-container" aria-live="polite"></div>');
    document.body.appendChild(toastContainer);
  }
  const icons = { success: '✓', error: '⚠', info: 'ℹ' };
  const node = el(
    `<div class="toast toast--${type}" role="status">
       <span class="toast__icon" aria-hidden="true">${icons[type] || 'ℹ'}</span>
       <span>${escapeHtml(message)}</span>
     </div>`,
  );
  toastContainer.appendChild(node);
  setTimeout(() => {
    node.style.transition = 'opacity .25s ease';
    node.style.opacity = '0';
    setTimeout(() => node.remove(), 250);
  }, 3500);
}

// ---------------------------------------------------------------- Paginação
// Cria controles de paginação dentro de `mount` e chama onChange(page).
export function renderPagination(mount, page, totalPages, onChange) {
  mount.innerHTML = '';
  if (totalPages <= 1) return;

  const build = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push('...');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const nav = el('<nav class="pagination" aria-label="Paginação"></nav>');
  const prev = el(`<button class="pagination__btn" aria-label="Página anterior" ${page === 1 ? 'disabled' : ''}>‹</button>`);
  prev.addEventListener('click', () => onChange(page - 1));
  nav.appendChild(prev);

  build().forEach((p) => {
    if (p === '...') {
      nav.appendChild(el('<span class="pagination__ellipsis" aria-hidden="true">…</span>'));
    } else {
      const btn = el(`<button class="pagination__btn ${p === page ? 'active' : ''}" aria-label="Página ${p}">${p}</button>`);
      btn.addEventListener('click', () => onChange(p));
      nav.appendChild(btn);
    }
  });

  const next = el(`<button class="pagination__btn" aria-label="Próxima página" ${page === totalPages ? 'disabled' : ''}>›</button>`);
  next.addEventListener('click', () => onChange(page + 1));
  nav.appendChild(next);

  mount.appendChild(nav);
}

// ---------------------------------------------------------------- Modal
// Abre um modal reaproveitando os estilos do projeto. Retorna { close }.
export function openModal(title, contentNode) {
  const overlay = el('<div class="modal-overlay"></div>');
  const content = el(
    `<div class="modal-content card" role="dialog" aria-modal="true" tabindex="-1">
       <div class="modal-header">
         <h2>${escapeHtml(title)}</h2>
         <button type="button" class="modal-close" aria-label="Fechar">✕</button>
       </div>
       <div class="modal-body"></div>
     </div>`,
  );
  content.querySelector('.modal-body').appendChild(contentNode);
  overlay.appendChild(content);

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  function close() {
    document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  overlay.addEventListener('mousedown', close);
  content.addEventListener('mousedown', (e) => e.stopPropagation());
  content.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  content.focus();
  return { close };
}

// ---------------------------------------------------------------- Navbar + rodapé
export function initLayout() {
  const user = getCurrentUser();
  const admin = isAdmin(user);

  const header = el(`
    <header class="navbar" role="banner">
      <div class="container navbar__inner">
        <a href="index.html" class="navbar__logo" aria-label="PixelGame - Página inicial">
          <span class="navbar__logo-text">Pixel<span>Game</span></span>
        </a>
        <nav class="navbar__links" aria-label="Navegação principal">
          <a href="catalog.html" class="navbar__link">Catálogo</a>
          <a href="reviews.html" class="navbar__link">Avaliações</a>
        </nav>
        <form class="navbar__search" role="search">
          <label for="navbar-search" class="sr-only">Buscar jogos</label>
          <input id="navbar-search" type="search" class="navbar__search-input" placeholder="Buscar jogo..." aria-label="Buscar jogos" />
          <button type="submit" class="navbar__search-btn" aria-label="Executar busca">🔍</button>
        </form>
        <nav class="navbar__actions" aria-label="Navegação do usuário">${
          user
            ? `
          <a href="wishlist.html" class="navbar__icon-btn" aria-label="Lista de desejos" title="Lista de desejos">♡</a>
          <a href="cart.html" class="navbar__icon-btn navbar__cart" aria-label="Carrinho de compras" title="Carrinho">
            🛒<span class="navbar__cart-badge" hidden></span>
          </a>
          <div class="navbar__user">
            <button class="navbar__user-btn" aria-haspopup="true" aria-expanded="false">
              <span class="navbar__avatar" aria-hidden="true">${escapeHtml((user.nome || 'U')[0].toUpperCase())}</span>
              <span class="navbar__username">${escapeHtml(user.nome || 'Usuário')}</span>
              <span aria-hidden="true">▾</span>
            </button>
            <ul class="navbar__dropdown" role="menu" hidden>
              <li role="menuitem"><a href="orders.html">Minhas Compras</a></li>
              <li role="menuitem"><a href="profile.html">Meu Perfil</a></li>
              ${admin ? `
              <li class="navbar__dropdown-divider" role="separator"></li>
              <li class="navbar__dropdown-label">Admin</li>
              <li role="menuitem"><a href="admin-games.html">Gerenciar Jogos</a></li>
              <li role="menuitem"><a href="admin-categories.html">Categorias</a></li>
              <li role="menuitem"><a href="admin-companies.html">Empresas</a></li>
              <li role="menuitem"><a href="reports.html">Relatórios</a></li>` : ''}
              <li class="navbar__dropdown-divider" role="separator"></li>
              <li role="menuitem"><button class="navbar__logout-btn" type="button">Sair</button></li>
            </ul>
          </div>`
            : `<a href="login.html" class="btn btn-primary">Entrar</a>`
        }</nav>
      </div>
    </header>
  `);

  // Busca → home com ?q=
  const searchForm = header.querySelector('.navbar__search');
  const searchInput = header.querySelector('#navbar-search');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) location.href = `index.html?q=${encodeURIComponent(q)}`;
  });

  if (user) {
    const userBtn = header.querySelector('.navbar__user-btn');
    const dropdown = header.querySelector('.navbar__dropdown');
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.hasAttribute('hidden');
      dropdown.toggleAttribute('hidden', !open);
      userBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      dropdown.setAttribute('hidden', '');
      userBtn.setAttribute('aria-expanded', 'false');
    });
    header.querySelector('.navbar__logout-btn').addEventListener('click', logout);

    // Atualiza o "ponto" do carrinho.
    cartService.get()
      .then((data) => {
        const count = (data?.carrinho?.itens || []).length;
        const badge = header.querySelector('.navbar__cart-badge');
        if (badge) badge.toggleAttribute('hidden', count === 0);
      })
      .catch(() => {});
  }

  const footer = el(`
    <footer class="app-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} PixelGame — Todos os direitos reservados</p>
      </div>
    </footer>
  `);

  const root = document.getElementById('app');
  const layout = el('<div class="app-layout"></div>');
  layout.appendChild(header);
  const main = el('<main id="main-content" class="app-main" tabindex="-1"></main>');
  // Move o conteúdo existente de #app para dentro do <main>.
  while (root.firstChild) main.appendChild(root.firstChild);
  layout.appendChild(main);
  layout.appendChild(footer);
  root.appendChild(layout);

  return { user, admin, main };
}
