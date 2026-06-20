import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const initialPwd = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };

// Converte entre o formato da API (DD/MM/YYYY) e o do input date (YYYY-MM-DD).
function toInputDate(br) {
  if (!br || !br.includes('/')) return '';
  const [dia, mes, ano] = br.split('/');
  return `${ano}-${mes}-${dia}`;
}
function toApiDate(iso) {
  if (!iso || !iso.includes('-')) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [dados, setDados] = useState({ nome: '', email: '', dataNascimento: '' });
  const [loadingDados, setLoadingDados] = useState(true);
  const [savingDados, setSavingDados] = useState(false);

  const [pwd, setPwd] = useState(initialPwd);
  const [saving, setSaving] = useState(false);

  // Carrega os dados do usuário logado (GET /usuarios/:id).
  useEffect(() => {
    if (!user?.id) { setLoadingDados(false); return; }
    userService
      .getById(user.id)
      .then((r) => {
        const u = r.data || {};
        setDados({
          nome: u.nome || '',
          email: u.email || '',
          dataNascimento: toInputDate(u.dataNascimento),
        });
      })
      .catch(() => { /* mantém vazio; usa o nome do token como fallback abaixo */ })
      .finally(() => setLoadingDados(false));
  }, [user?.id]);

  async function handleSaveDados(e) {
    e.preventDefault();
    if (!dados.nome.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }
    setSavingDados(true);
    try {
      await userService.update(user.id, {
        nome: dados.nome.trim(),
        dataNascimento: toApiDate(dados.dataNascimento),
      });
      toast.success('Dados atualizados com sucesso!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível salvar os dados.');
    } finally {
      setSavingDados(false);
    }
  }

  function handlePwdChange(e) {
    setPwd((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwd.novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (pwd.novaSenha !== pwd.confirmarSenha) {
      toast.error('A confirmação não corresponde à nova senha.');
      return;
    }
    if (pwd.novaSenha === pwd.senhaAtual) {
      toast.error('A nova senha deve ser diferente da atual.');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ senhaAtual: pwd.senhaAtual, novaSenha: pwd.novaSenha });
      setPwd(initialPwd);
      toast.success('Senha alterada com sucesso! Faça login novamente.');
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const status = err.response?.status;
      toast.error(
        status === 401 || status === 400
          ? err.response?.data?.message || 'Senha atual incorreta.'
          : err.response?.data?.message || 'Não foi possível alterar a senha.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Meu Perfil</h1>
      </header>

      <div className="split-layout">
        <div>
          <section className="card" aria-label="Dados pessoais">
            <h2>Dados pessoais</h2>
            {loadingDados ? (
              <div className="page-loading" style={{ minHeight: 120 }}><div className="spinner" /></div>
            ) : (
              <form onSubmit={handleSaveDados} className="mt-1">
                <div className="form-group">
                  <label htmlFor="nome">Nome *</label>
                  <input
                    id="nome"
                    className="input-field"
                    value={dados.nome}
                    onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" className="input-field" value={dados.email} disabled />
                  <small className="form-hint">O e-mail não pode ser alterado.</small>
                </div>
                <div className="form-group">
                  <label htmlFor="nasc">Data de nascimento</label>
                  <input
                    id="nasc"
                    type="date"
                    className="input-field"
                    value={dados.dataNascimento}
                    onChange={(e) => setDados((d) => ({ ...d, dataNascimento: e.target.value }))}
                  />
                </div>
                <button className="btn btn-primary" disabled={savingDados} aria-busy={savingDados}>
                  {savingDados ? 'Salvando...' : 'Salvar dados'}
                </button>
              </form>
            )}
          </section>

          <section className="card mt-1" aria-label="Alterar senha">
            <h2>Alterar senha</h2>
            <p className="page-subtitle">Use uma senha forte com pelo menos 6 caracteres.</p>
            <form onSubmit={handleChangePassword} className="mt-1">
              <div className="form-group">
                <label htmlFor="senhaAtual">Senha atual *</label>
                <input
                  id="senhaAtual"
                  name="senhaAtual"
                  type="password"
                  className="input-field"
                  value={pwd.senhaAtual}
                  onChange={handlePwdChange}
                  placeholder="Sua senha atual"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="novaSenha">Nova senha *</label>
                <input
                  id="novaSenha"
                  name="novaSenha"
                  type="password"
                  className="input-field"
                  value={pwd.novaSenha}
                  onChange={handlePwdChange}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar nova senha *</label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  className="input-field"
                  value={pwd.confirmarSenha}
                  onChange={handlePwdChange}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button className="btn btn-primary" disabled={saving} aria-busy={saving}>
                {saving ? 'Salvando...' : 'Alterar senha'}
              </button>
            </form>
          </section>
        </div>

        <aside className="card summary-card" aria-label="Dados da conta">
          <h2>Conta</h2>
          <div className="summary-line">
            <span>Nome</span>
            <strong>{dados.nome || user?.nome || '—'}</strong>
          </div>
          <div className="summary-line">
            <span>Perfil</span>
            <strong>{user?.perfil || 'Cliente'}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
