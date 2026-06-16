// Admin: Gerenciar Jogos (CRUD com modal) — equivalente a AdminGamesPage.jsx.
import { gameService, categoryService, companyService } from '../api.js';
import { initLayout, requireAdmin, formatPrice, escapeHtml, el, openModal, renderPagination } from '../common.js';

if (!requireAdmin()) throw new Error('redirecting');
const { main } = initLayout();

const ROWS_PER_PAGE = 10;
const CURRENT_YEAR = new Date().getFullYear();

let games = [];
let categories = [];
let companies = [];
let page = 1;

main.innerHTML = `
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Gerenciar Jogos</h1>
      <button class="btn btn-primary" id="new-game">+ Novo jogo</button>
    </header>
    <div id="page-error"></div>
    <div id="feedback"></div>
    <section class="card" aria-label="Lista de jogos">
      <h2>Jogos cadastrados</h2>
      <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
      <div id="pagination"></div>
    </section>
  </div>
`;

const contentEl = main.querySelector('#content');
const paginationEl = main.querySelector('#pagination');
const feedbackEl = main.querySelector('#feedback');
const pageErrorEl = main.querySelector('#page-error');

main.querySelector('#new-game').addEventListener('click', () => openForm(null));

loadGames();
categoryService.getAll().then((d) => { categories = d || []; }).catch(() => {});
companyService.getAll().then((d) => { companies = d || []; }).catch(() => {});

function loadGames() {
  gameService.getAll()
    .then((d) => { games = Array.isArray(d) ? d : []; renderList(); })
    .catch(() => { games = []; renderList(); });
}

function renderList() {
  if (games.length === 0) {
    contentEl.innerHTML = '<p class="page-subtitle mt-1">Nenhum jogo cadastrado.</p>';
    paginationEl.innerHTML = '';
    return;
  }
  const totalPages = Math.max(1, Math.ceil(games.length / ROWS_PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = games.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const wrap = el('<div style="overflow-x:auto" class="mt-1"></div>');
  const table = el(`
    <table class="data-table">
      <thead><tr><th>ID</th><th>Nome</th><th>Ano</th><th>Preço</th><th>Ações</th></tr></thead>
      <tbody></tbody>
    </table>
  `);
  const tbody = table.querySelector('tbody');
  items.forEach((g) => {
    const tr = el(`
      <tr>
        <td>${escapeHtml(String(g.id))}</td>
        <td>${escapeHtml(g.nome)}</td>
        <td>${g.ano || '—'}</td>
        <td>${formatPrice(g.preco)}</td>
        <td><div class="table-actions">
          <button class="btn btn-outline edit">Editar</button>
          <button class="btn btn-danger del">Excluir</button>
        </div></td>
      </tr>
    `);
    tr.querySelector('.edit').addEventListener('click', () => openForm(g));
    tr.querySelector('.del').addEventListener('click', () => onDelete(g.id));
    tbody.appendChild(tr);
  });
  wrap.appendChild(table);
  contentEl.innerHTML = '';
  contentEl.appendChild(wrap);

  renderPagination(paginationEl, page, totalPages, (p) => { page = p; renderList(); });
}

function friendlyError(err) {
  const data = err.data || {};
  const raw = `${data.error || ''} ${data.message || ''}`.toLowerCase();
  if (raw.includes('unique')) return 'Já existe um jogo com esse nome para a empresa selecionada.';
  if (raw.includes('foreign key')) return 'Categoria ou empresa inválida. Atualize a página e tente novamente.';
  if (raw.includes('not null')) {
    if (raw.includes('ano')) return 'O ano é obrigatório.';
    if (raw.includes('preco')) return 'O preço é obrigatório.';
    if (raw.includes('nome')) return 'O nome é obrigatório.';
    return 'Preencha todos os campos obrigatórios.';
  }
  return data.error || data.message || 'Erro ao salvar o jogo.';
}

function openForm(game) {
  const editingId = game?.id ?? null;
  const f = {
    nome: game?.nome ?? '', descricao: game?.descricao ?? '', ano: game?.ano ?? '',
    preco: game?.preco ?? '', desconto: game?.desconto ?? '',
    fkCategoria: game?.fkCategoria ?? '', fkEmpresa: game?.fkEmpresa ?? '',
  };

  const noCategories = categories.length === 0;
  const noCompanies = companies.length === 0;

  const body = el(`
    <div>
      <div id="form-error"></div>
      ${(noCategories || noCompanies) ? `<div class="alert alert-info" role="status">${
        noCategories && noCompanies ? 'Cadastre ao menos uma categoria e uma empresa antes de criar um jogo.'
        : noCategories ? 'Cadastre ao menos uma categoria antes de criar um jogo.'
        : 'Cadastre ao menos uma empresa antes de criar um jogo.'}</div>` : ''}
      <form id="game-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label for="nome">Nome *</label>
            <input id="nome" name="nome" class="input-field" value="${escapeHtml(f.nome)}" />
            <span class="field-error" data-for="nome"></span>
          </div>
          <div class="form-group">
            <label for="ano">Ano *</label>
            <input id="ano" name="ano" type="number" class="input-field" value="${escapeHtml(String(f.ano))}" />
            <span class="field-error" data-for="ano"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" class="input-field">${escapeHtml(f.descricao)}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="preco">Preço (R$) *</label>
            <input id="preco" name="preco" type="number" step="0.01" class="input-field" value="${escapeHtml(String(f.preco))}" />
            <span class="field-error" data-for="preco"></span>
          </div>
          <div class="form-group">
            <label for="desconto">Desconto (%)</label>
            <input id="desconto" name="desconto" type="number" class="input-field" value="${escapeHtml(String(f.desconto))}" />
            <span class="field-error" data-for="desconto"></span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="fkCategoria">Categoria *</label>
            <select id="fkCategoria" name="fkCategoria" class="input-field">
              <option value="">Selecione...</option>
              ${categories.map((c) => `<option value="${c.id}" ${String(c.id) === String(f.fkCategoria) ? 'selected' : ''}>${escapeHtml(c.nome)}</option>`).join('')}
            </select>
            <span class="field-error" data-for="fkCategoria"></span>
          </div>
          <div class="form-group">
            <label for="fkEmpresa">Empresa *</label>
            <select id="fkEmpresa" name="fkEmpresa" class="input-field">
              <option value="">Selecione...</option>
              ${companies.map((c) => `<option value="${c.id}" ${String(c.id) === String(f.fkEmpresa) ? 'selected' : ''}>${escapeHtml(c.nome)}</option>`).join('')}
            </select>
            <span class="field-error" data-for="fkEmpresa"></span>
          </div>
        </div>
        <div class="table-actions mt-1">
          <button class="btn btn-primary" id="save">${editingId ? 'Salvar alterações' : 'Criar jogo'}</button>
          <button type="button" class="btn btn-ghost" id="cancel">Cancelar</button>
        </div>
      </form>
    </div>
  `);

  const modal = openModal(editingId ? `Editar jogo #${editingId}` : 'Novo jogo', body);
  const form = body.querySelector('#game-form');
  body.querySelector('#cancel').addEventListener('click', modal.close);

  function setFieldError(name, msg) {
    const span = body.querySelector(`.field-error[data-for="${name}"]`);
    const input = form.elements[name];
    if (span) span.textContent = msg || '';
    if (input) input.classList.toggle('has-error', !!msg);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    body.querySelector('#form-error').innerHTML = '';
    feedbackEl.innerHTML = '';

    const values = {
      nome: form.nome.value.trim(),
      descricao: form.descricao.value,
      ano: form.ano.value,
      preco: form.preco.value,
      desconto: form.desconto.value,
      fkCategoria: form.fkCategoria.value,
      fkEmpresa: form.fkEmpresa.value,
    };

    const errs = validate(values, editingId);
    ['nome', 'ano', 'preco', 'desconto', 'fkCategoria', 'fkEmpresa'].forEach((k) => setFieldError(k, errs[k]));
    if (Object.keys(errs).length > 0) return;

    const payload = {
      nome: values.nome,
      descricao: values.descricao,
      ano: Number(values.ano),
      preco: Number(values.preco),
      desconto: values.desconto ? Number(values.desconto) : 0,
      fkCategoria: Number(values.fkCategoria),
      fkEmpresa: Number(values.fkEmpresa),
    };

    const saveBtn = body.querySelector('#save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';
    try {
      if (editingId) {
        await gameService.update(editingId, payload);
        feedback('Jogo atualizado com sucesso!');
      } else {
        await gameService.create(payload);
        feedback('Jogo criado com sucesso!');
      }
      modal.close();
      loadGames();
    } catch (err) {
      body.querySelector('#form-error').innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(friendlyError(err))}</div>`;
      saveBtn.disabled = false;
      saveBtn.textContent = editingId ? 'Salvar alterações' : 'Criar jogo';
    }
  });
}

function validate(form, editingId) {
  const errs = {};
  const nome = form.nome.trim();
  if (!nome) errs.nome = 'Informe o nome do jogo.';

  if (form.ano === '' || form.ano === null) {
    errs.ano = 'Informe o ano de lançamento.';
  } else if (!Number.isInteger(Number(form.ano)) || Number(form.ano) < 1950 || Number(form.ano) > CURRENT_YEAR + 1) {
    errs.ano = `Informe um ano válido (1950–${CURRENT_YEAR + 1}).`;
  }

  if (form.preco === '' || form.preco === null) {
    errs.preco = 'Informe o preço.';
  } else if (Number.isNaN(Number(form.preco)) || Number(form.preco) < 0) {
    errs.preco = 'O preço não pode ser negativo.';
  }

  if (form.desconto !== '' && (Number(form.desconto) < 0 || Number(form.desconto) > 100)) {
    errs.desconto = 'O desconto deve estar entre 0 e 100.';
  }

  if (!form.fkCategoria) errs.fkCategoria = 'Selecione uma categoria.';
  if (!form.fkEmpresa) errs.fkEmpresa = 'Selecione uma empresa.';

  if (nome && form.fkEmpresa) {
    const dup = games.find((g) =>
      g.id !== editingId &&
      (g.nome || '').trim().toLowerCase() === nome.toLowerCase() &&
      String(g.fkEmpresa) === String(form.fkEmpresa));
    if (dup) errs.nome = 'Já existe um jogo com esse nome para a empresa selecionada.';
  }
  return errs;
}

function feedback(msg) {
  feedbackEl.innerHTML = `<div class="alert alert-success" role="status">${escapeHtml(msg)}</div>`;
}

async function onDelete(id) {
  if (!window.confirm('Tem certeza que deseja excluir este jogo?')) return;
  pageErrorEl.innerHTML = '';
  try {
    await gameService.remove(id);
    games = games.filter((g) => g.id !== id);
    renderList();
  } catch (err) {
    const raw = `${err.data?.error || ''}`.toLowerCase();
    pageErrorEl.innerHTML = `<div class="alert alert-error" role="alert">${
      raw.includes('foreign key')
        ? 'Não é possível excluir: este jogo está vinculado a carrinhos, vendas ou avaliações.'
        : 'Não foi possível excluir o jogo.'}</div>`;
  }
}
