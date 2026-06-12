// Admin: Empresas (CRUD) — equivalente a AdminCompanyPage.jsx.
import { companyService } from '../api.js';
import { initLayout, requireAdmin, escapeHtml, el } from '../common.js';

if (!requireAdmin()) throw new Error('redirecting');
const { main } = initLayout();

let companies = [];
let editingId = null;

main.innerHTML = `
  <div class="container page">
    <header class="page-header"><h1 class="page-title">Gerenciar Empresas</h1></header>
    <div id="feedback"></div>
    <section class="card" aria-label="Formulário de empresa">
      <h2 id="form-title">Nova empresa</h2>
      <form id="company-form" class="mt-1">
        <div class="form-group">
          <label for="nome">Nome *</label>
          <input id="nome" class="input-field" placeholder="Nome da desenvolvedora/publicadora" required />
        </div>
        <div class="table-actions">
          <button class="btn btn-primary" id="submit">Criar empresa</button>
          <button type="button" class="btn btn-ghost" id="cancel" hidden>Cancelar</button>
        </div>
      </form>
    </section>
    <section class="card mt-1" aria-label="Lista de empresas">
      <h2>Empresas cadastradas</h2>
      <div id="content"><div class="page-loading"><div class="spinner"></div></div></div>
    </section>
  </div>
`;

const form = main.querySelector('#company-form');
const nomeInput = main.querySelector('#nome');
const submitBtn = main.querySelector('#submit');
const cancelBtn = main.querySelector('#cancel');
const formTitle = main.querySelector('#form-title');
const feedbackEl = main.querySelector('#feedback');
const contentEl = main.querySelector('#content');

cancelBtn.addEventListener('click', cancelEdit);
form.addEventListener('submit', onSubmit);

load();

function load() {
  companyService.getAll()
    .then((data) => { companies = Array.isArray(data) ? data : []; renderList(); })
    .catch(() => { companies = []; renderList(); });
}

function renderList() {
  if (companies.length === 0) {
    contentEl.innerHTML = '<p class="page-subtitle mt-1">Nenhuma empresa cadastrada.</p>';
    return;
  }
  const wrap = el('<div style="overflow-x:auto" class="mt-1"></div>');
  const table = el(`
    <table class="data-table">
      <thead><tr><th>ID</th><th>Nome</th><th>Ações</th></tr></thead>
      <tbody></tbody>
    </table>
  `);
  const tbody = table.querySelector('tbody');
  companies.forEach((c) => {
    const tr = el(`
      <tr>
        <td>${escapeHtml(String(c.id))}</td>
        <td>${escapeHtml(c.nome)}</td>
        <td><div class="table-actions">
          <button class="btn btn-outline edit">Editar</button>
          <button class="btn btn-danger del">Excluir</button>
        </div></td>
      </tr>
    `);
    tr.querySelector('.edit').addEventListener('click', () => startEdit(c));
    tr.querySelector('.del').addEventListener('click', () => onDelete(c.id));
    tbody.appendChild(tr);
  });
  wrap.appendChild(table);
  contentEl.innerHTML = '';
  contentEl.appendChild(wrap);
}

function startEdit(empresa) {
  editingId = empresa.id;
  nomeInput.value = empresa.nome;
  formTitle.textContent = `Editar empresa #${empresa.id}`;
  submitBtn.textContent = 'Salvar alterações';
  cancelBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;
  form.reset();
  formTitle.textContent = 'Nova empresa';
  submitBtn.textContent = 'Criar empresa';
  cancelBtn.hidden = true;
}

function feedback(msg, type) {
  feedbackEl.innerHTML = `<div class="alert alert-${type}" role="${type === 'error' ? 'alert' : 'status'}">${escapeHtml(msg)}</div>`;
}

async function onSubmit(e) {
  e.preventDefault();
  feedbackEl.innerHTML = '';
  submitBtn.disabled = true;
  const prevText = submitBtn.textContent;
  submitBtn.textContent = 'Salvando...';
  try {
    if (editingId) {
      await companyService.update(editingId, { nome: nomeInput.value });
      feedback('Empresa atualizada com sucesso!', 'success');
    } else {
      await companyService.create({ nome: nomeInput.value });
      feedback('Empresa criada com sucesso!', 'success');
    }
    cancelEdit();
    load();
  } catch (err) {
    feedback(err.data?.error || 'Erro ao salvar a empresa.', 'error');
    submitBtn.textContent = prevText;
  } finally {
    submitBtn.disabled = false;
  }
}

async function onDelete(id) {
  if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;
  try {
    await companyService.remove(id);
    companies = companies.filter((c) => c.id !== id);
    renderList();
  } catch {
    feedback('Não foi possível excluir a empresa.', 'error');
  }
}
