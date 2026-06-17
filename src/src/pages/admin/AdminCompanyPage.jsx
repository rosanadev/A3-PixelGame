import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { companyService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../Pages.css';

export default function AdminCompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) => (c.nome || '').toLowerCase().includes(q) || String(c.id) === q,
    );
  }, [companies, search]);

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
    setSaving(true);
    try {
      if (editingId) {
        await companyService.update(editingId, { nome });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await companyService.create({ nome });
        toast.success('Empresa criada com sucesso!');
      }
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar a empresa.');
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
      toast.success(`Empresa "${empresa.nome}" excluída com sucesso.`);
    } catch (err) {
      // FK: a empresa pode estar vinculada a jogos.
      const raw = `${err.response?.data?.error || ''}`.toLowerCase();
      toast.error(
        raw.includes('foreign key') || raw.includes('constraint')
          ? `Não é possível excluir "${empresa.nome}": há jogos vinculados a ela.`
          : 'Não foi possível excluir a empresa.',
      );
    }
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Gerenciar Empresas</h1>
      </header>

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
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2>Empresas cadastradas</h2>
          <div className="form-group" style={{ margin: 0, minWidth: 220 }}>
            <label htmlFor="empresa-busca" className="sr-only">Buscar empresa</label>
            <input
              id="empresa-busca"
              type="search"
              className="input-field"
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : companies.length === 0 ? (
          <p className="page-subtitle mt-1">Nenhuma empresa cadastrada.</p>
        ) : filtered.length === 0 ? (
          <p className="page-subtitle mt-1">Nenhuma empresa encontrada para "{search}".</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
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
