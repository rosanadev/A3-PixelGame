import { useState, useEffect, useCallback } from 'react';
import { gameService, categoryService, companyService } from '../../services/api';
import '../Pages.css';

const EMPTY = {
  nome: '',
  descricao: '',
  ano: '',
  preco: '',
  desconto: '',
  fkCategoria: '',
  fkEmpresa: '',
};

function formatPrice(value) {
  return `R$ ${(Number(value) || 0).toFixed(2)}`;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(game) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFeedback('');
    setSaving(true);

    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      ano: form.ano ? Number(form.ano) : null,
      preco: form.preco ? Number(form.preco) : 0,
      desconto: form.desconto ? Number(form.desconto) : 0,
      fkCategoria: form.fkCategoria ? Number(form.fkCategoria) : null,
      fkEmpresa: form.fkEmpresa ? Number(form.fkEmpresa) : null,
    };

    try {
      if (editingId) {
        await gameService.update(editingId, payload);
        setFeedback('Jogo atualizado com sucesso!');
      } else {
        await gameService.create(payload);
        setFeedback('Jogo criado com sucesso!');
      }
      cancelEdit();
      loadGames();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar o jogo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este jogo?')) return;
    try {
      await gameService.remove(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch {
      setError('Não foi possível excluir o jogo.');
    }
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Gerenciar Jogos</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {feedback && <div className="alert alert-success" role="status">{feedback}</div>}

      {/* Formulário */}
      <section className="card" aria-label={editingId ? 'Editar jogo' : 'Novo jogo'}>
        <h2>{editingId ? `Editar jogo #${editingId}` : 'Novo jogo'}</h2>
        <form onSubmit={handleSubmit} className="mt-1">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome *</label>
              <input id="nome" name="nome" className="input-field" value={form.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ano">Ano</label>
              <input id="ano" name="ano" type="number" className="input-field" value={form.ano} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" className="input-field" value={form.descricao} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preco">Preço (R$) *</label>
              <input id="preco" name="preco" type="number" step="0.01" className="input-field" value={form.preco} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="desconto">Desconto (%)</label>
              <input id="desconto" name="desconto" type="number" className="input-field" value={form.desconto} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fkCategoria">Categoria *</label>
              <select id="fkCategoria" name="fkCategoria" className="input-field" value={form.fkCategoria} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fkEmpresa">Empresa *</label>
              <select id="fkEmpresa" name="fkEmpresa" className="input-field" value={form.fkEmpresa} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {companies.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-actions">
            <button className="btn btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar jogo'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      {/* Lista */}
      <section className="card mt-1" aria-label="Lista de jogos">
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
                {games.map((g) => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td>{g.nome}</td>
                    <td>{g.ano || '—'}</td>
                    <td>{formatPrice(g.preco)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline" onClick={() => startEdit(g)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(g.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
