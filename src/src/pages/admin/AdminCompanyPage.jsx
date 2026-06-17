import { useState, useEffect, useCallback } from 'react';
import { companyService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../Pages.css';

export default function AdminCompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    companyService
      .getAll()
      .then((r) => setCompanies(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(empresa) {
    setEditingId(empresa.id);
    setNome(empresa.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setNome('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFeedback('');
    setSaving(true);
    try {
      if (editingId) {
        await companyService.update(editingId, { nome });
        setFeedback('Empresa atualizada com sucesso!');
      } else {
        await companyService.create({ nome });
        setFeedback('Empresa criada com sucesso!');
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar a empresa.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const empresa = deleteTarget;
    setDeleteTarget(null);
    if (!empresa) return;
    try {
      await companyService.remove(empresa.id);
      setCompanies((prev) => prev.filter((c) => c.id !== empresa.id));
    } catch {
      setError('Não foi possível excluir a empresa.');
    }
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Gerenciar Empresas</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {feedback && <div className="alert alert-success" role="status">{feedback}</div>}

      <section className="card" aria-label={editingId ? 'Editar empresa' : 'Nova empresa'}>
        <h2>{editingId ? `Editar empresa #${editingId}` : 'Nova empresa'}</h2>
        <form onSubmit={handleSubmit} className="mt-1">
          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              id="nome"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da desenvolvedora/publicadora"
              required
            />
          </div>
          <div className="table-actions">
            <button className="btn btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar empresa'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>
      </section>

      <section className="card mt-1" aria-label="Lista de empresas">
        <h2>Empresas cadastradas</h2>
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : companies.length === 0 ? (
          <p className="page-subtitle mt-1">Nenhuma empresa cadastrada.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="mt-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nome}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline" onClick={() => startEdit(c)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => setDeleteTarget(c)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
