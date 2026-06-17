import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { userService, profileService } from '../../services/api';
import '../Pages.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [novoPerfil, setNovoPerfil] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([userService.getAll(), profileService.getAll()])
      .then(([usersRes, profRes]) => {
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setProfiles(Array.isArray(profRes.data) ? profRes.data : []);
      })
      .catch(() => setError('Erro ao carregar usuários e perfis.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const profileName = (id) => profiles.find((p) => String(p.id) === String(id))?.nome || '—';

  async function handleChangeProfile(user, fkPerfil) {
    try {
      // PUT /usuarios/:id exige `nome`; enviamos junto do novo perfil.
      await userService.update(user.id, { nome: user.nome, fkPerfil: Number(fkPerfil) });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, fkPerfil: Number(fkPerfil) } : u)),
      );
      toast.success(`Perfil de ${user.nome} atualizado.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível atualizar o perfil.');
    }
  }

  async function handleCreateProfile(e) {
    e.preventDefault();
    if (!novoPerfil.trim()) return;
    setSavingProfile(true);
    try {
      await profileService.create({ nome: novoPerfil.trim() });
      setNovoPerfil('');
      toast.success('Perfil criado com sucesso!');
      load();
    } catch (err) {
      const status = err.response?.status;
      toast.error(
        status === 409
          ? 'Esse perfil já existe.'
          : err.response?.data?.message || 'Não foi possível criar o perfil.',
      );
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Usuários e Perfis</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="card" aria-label="Novo perfil">
        <h2>Perfis de acesso</h2>
        <p className="page-subtitle">
          Perfis cadastrados: {profiles.map((p) => p.nome).join(', ') || '—'}
        </p>
        <form onSubmit={handleCreateProfile} className="form-row mt-1" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="novo-perfil">Novo perfil</label>
            <input
              id="novo-perfil"
              className="input-field"
              value={novoPerfil}
              onChange={(e) => setNovoPerfil(e.target.value)}
              placeholder="Ex.: Moderador"
            />
          </div>
          <button className="btn btn-primary" disabled={savingProfile} aria-busy={savingProfile}>
            {savingProfile ? 'Criando...' : 'Criar perfil'}
          </button>
        </form>
      </section>

      <section className="card mt-1" aria-label="Lista de usuários">
        <h2>Usuários cadastrados</h2>
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <p className="page-subtitle mt-1">Nenhum usuário encontrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="mt-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="input-field"
                        value={u.fkPerfil ?? ''}
                        onChange={(e) => handleChangeProfile(u, e.target.value)}
                        aria-label={`Perfil de ${u.nome}`}
                      >
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                        {profiles.length === 0 && <option>{profileName(u.fkPerfil)}</option>}
                      </select>
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
