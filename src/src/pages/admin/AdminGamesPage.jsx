import { useState, useEffect, useCallback } from 'react';
import { gameService, categoryService, companyService } from '../../services/api';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../Pages.css';

const ROWS_PER_PAGE = 10;
const CURRENT_YEAR = new Date().getFullYear();

const EMPTY = {
  nome: '',
  descricao: '',
  ano: String(CURRENT_YEAR),
  preco: '',
  desconto: '',
  fkCategoria: '',
  fkEmpresa: '',
};

function formatPrice(value) {
  return `R$ ${(Number(value) || 0).toFixed(2)}`;
}

// Traduz os erros de constraint do backend (mensagens cruas do SQLite)
// para mensagens claras ao usuário.
function friendlyError(err) {
  const data = err.response?.data || {};
  const raw = `${data.error || ''} ${data.message || ''}`.toLowerCase();

  if (raw.includes('unique')) {
    return 'Já existe um jogo com esse nome para a empresa selecionada.';
  }
  if (raw.includes('foreign key')) {
    return 'Categoria ou empresa inválida. Atualize a página e tente novamente.';
  }
  if (raw.includes('not null')) {
    if (raw.includes('ano')) return 'O ano é obrigatório.';
    if (raw.includes('preco')) return 'O preço é obrigatório.';
    if (raw.includes('nome')) return 'O nome é obrigatório.';
    if (raw.includes('categoria')) return 'Selecione uma categoria.';
    if (raw.includes('empresa')) return 'Selecione uma empresa.';
    return 'Preencha todos os campos obrigatórios.';
  }
  return data.error || data.message || 'Erro ao salvar o jogo.';
}

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { page, setPage, totalPages, pageItems } = usePagination(games, ROWS_PER_PAGE);

  const loadGames = useCallback(() => {
    setLoading(true);
    gameService
      .getAll()
      .then((r) => setGames(Array.isArray(r.data) ? r.data : []))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadGames();
    categoryService.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
    companyService.getAll().then((r) => setCompanies(r.data || [])).catch(() => {});
  }, [loadGames]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro do campo ao editá-lo.
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setFieldErrors({});
    setFormError('');
    setShowModal(true);
  }

  function openEdit(game) {
    setEditingId(game.id);
    setForm({
      nome: game.nome ?? '',
      descricao: game.descricao ?? '',
      ano: game.ano ?? '',
      preco: game.preco ?? '',
      desconto: game.desconto ?? '',
      fkCategoria: game.fkCategoria ?? '',
      fkEmpresa: game.fkEmpresa ?? '',
    });
    setFieldErrors({});
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY);
    setFieldErrors({});
    setFormError('');
  }

  // Validação no cliente das regras de negócio (espelha as constraints do banco:
  // campos NOT NULL, faixas válidas e UNIQUE(nome, fk_empresa)).
  function validate() {
    const errs = {};
    const nome = form.nome.trim();

    if (!nome) errs.nome = 'Informe o nome do jogo.';

    if (form.ano === '' || form.ano === null) {
      errs.ano = 'Informe o ano de lançamento.';
    } else if (
      !Number.isInteger(Number(form.ano)) ||
      Number(form.ano) < 1950 ||
      Number(form.ano) > CURRENT_YEAR + 1
    ) {
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

    // Regra de negócio: UNIQUE(nome, fk_empresa).
    if (nome && form.fkEmpresa) {
      const dup = games.find(
        (g) =>
          g.id !== editingId &&
          (g.nome || '').trim().toLowerCase() === nome.toLowerCase() &&
          String(g.fkEmpresa) === String(form.fkEmpresa),
      );
      if (dup) errs.nome = 'Já existe um jogo com esse nome para a empresa selecionada.';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFeedback('');

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao,
      ano: Number(form.ano),
      preco: Number(form.preco),
      desconto: form.desconto ? Number(form.desconto) : 0,
      fkCategoria: Number(form.fkCategoria),
      fkEmpresa: Number(form.fkEmpresa),
    };

    try {
      if (editingId) {
        await gameService.update(editingId, payload);
        setFeedback('Jogo atualizado com sucesso!');
      } else {
        await gameService.create(payload);
        setFeedback('Jogo criado com sucesso!');
      }
      closeModal();
      loadGames();
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const game = deleteTarget;
    setDeleteTarget(null);
    if (!game) return;
    setPageError('');
    try {
      await gameService.remove(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
    } catch (err) {
      // FK: o jogo pode estar referenciado em carrinhos/vendas/avaliações.
      const raw = `${err.response?.data?.error || ''}`.toLowerCase();
      setPageError(
        raw.includes('foreign key')
          ? 'Não é possível excluir: este jogo está vinculado a carrinhos, vendas ou avaliações.'
          : 'Não foi possível excluir o jogo.',
      );
    }
  }

  const noCategories = categories.length === 0;
  const noCompanies = companies.length === 0;

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Gerenciar Jogos</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo jogo</button>
      </header>

      {pageError && <div className="alert alert-error" role="alert">{pageError}</div>}
      {feedback && <div className="alert alert-success" role="status">{feedback}</div>}

      {/* Lista */}
      <section className="card" aria-label="Lista de jogos">
        <h2>Jogos cadastrados</h2>
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : games.length === 0 ? (
          <p className="page-subtitle mt-1">Nenhum jogo cadastrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="mt-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Ano</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((g) => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td>{g.nome}</td>
                    <td>{g.ano || '—'}</td>
                    <td>{formatPrice(g.preco)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline" onClick={() => openEdit(g)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => setDeleteTarget(g)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </section>

      {/* Modal de criação/edição */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? `Editar jogo #${editingId}` : 'Novo jogo'}
      >
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        {(noCategories || noCompanies) && (
          <div className="alert alert-info" role="status">
            {noCategories && noCompanies
              ? 'Cadastre ao menos uma categoria e uma empresa antes de criar um jogo.'
              : noCategories
                ? 'Cadastre ao menos uma categoria antes de criar um jogo.'
                : 'Cadastre ao menos uma empresa antes de criar um jogo.'}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome *</label>
              <input
                id="nome"
                name="nome"
                className={`input-field ${fieldErrors.nome ? 'has-error' : ''}`}
                value={form.nome}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.nome}
              />
              {fieldErrors.nome && <span className="field-error" role="alert">{fieldErrors.nome}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ano">Ano *</label>
              <input
                id="ano"
                name="ano"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Ex.: 2024"
                className={`input-field ${fieldErrors.ano ? 'has-error' : ''}`}
                value={form.ano}
                onChange={(e) => {
                  // Aceita apenas dígitos, permitindo digitar o ano livremente.
                  const apenasDigitos = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setForm((prev) => ({ ...prev, ano: apenasDigitos }));
                  setFieldErrors((prev) => (prev.ano ? { ...prev, ano: undefined } : prev));
                }}
                aria-invalid={!!fieldErrors.ano}
              />
              {fieldErrors.ano && <span className="field-error" role="alert">{fieldErrors.ano}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" className="input-field" value={form.descricao} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preco">Preço (R$) *</label>
              <input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                className={`input-field ${fieldErrors.preco ? 'has-error' : ''}`}
                value={form.preco}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.preco}
              />
              {fieldErrors.preco && <span className="field-error" role="alert">{fieldErrors.preco}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="desconto">Desconto (%)</label>
              <input
                id="desconto"
                name="desconto"
                type="number"
                className={`input-field ${fieldErrors.desconto ? 'has-error' : ''}`}
                value={form.desconto}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.desconto}
              />
              {fieldErrors.desconto && <span className="field-error" role="alert">{fieldErrors.desconto}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fkCategoria">Categoria *</label>
              <select
                id="fkCategoria"
                name="fkCategoria"
                className={`input-field ${fieldErrors.fkCategoria ? 'has-error' : ''}`}
                value={form.fkCategoria}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.fkCategoria}
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {fieldErrors.fkCategoria && <span className="field-error" role="alert">{fieldErrors.fkCategoria}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="fkEmpresa">Empresa *</label>
              <select
                id="fkEmpresa"
                name="fkEmpresa"
                className={`input-field ${fieldErrors.fkEmpresa ? 'has-error' : ''}`}
                value={form.fkEmpresa}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.fkEmpresa}
              >
                <option value="">Selecione...</option>
                {companies.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
              {fieldErrors.fkEmpresa && <span className="field-error" role="alert">{fieldErrors.fkEmpresa}</span>}
            </div>
          </div>

          <div className="table-actions mt-1">
            <button className="btn btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar jogo'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir jogo"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
