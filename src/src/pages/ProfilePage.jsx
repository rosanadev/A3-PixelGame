import { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const initialForm = { senhaAtual: '', novaSenha: '', confirmarSenha: '' };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      toast.error('A confirmação não corresponde à nova senha.');
      return;
    }
    if (form.novaSenha === form.senhaAtual) {
      toast.error('A nova senha deve ser diferente da atual.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha,
      });
      setForm(initialForm);
      toast.success('Senha alterada com sucesso! Faça login novamente.');
      // Por segurança, encerra a sessão após trocar a senha.
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        toast.error(err.response?.data?.message || 'Senha atual incorreta.');
      } else {
        toast.error(err.response?.data?.message || 'Não foi possível alterar a senha.');
      }
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
        <section className="card" aria-label="Alterar senha">
          <h2>Alterar senha</h2>
          <p className="page-subtitle">
            Use uma senha forte com pelo menos 6 caracteres.
          </p>

          <form onSubmit={handleSubmit} className="mt-1">
            <div className="form-group">
              <label htmlFor="senhaAtual">Senha atual *</label>
              <input
                id="senhaAtual"
                name="senhaAtual"
                type="password"
                className="input-field"
                value={form.senhaAtual}
                onChange={handleChange}
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
                value={form.novaSenha}
                onChange={handleChange}
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
                value={form.confirmarSenha}
                onChange={handleChange}
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

        <aside className="card summary-card" aria-label="Dados da conta">
          <h2>Conta</h2>
          <div className="summary-line">
            <span>Nome</span>
            <strong>{user?.nome || user?.name || '—'}</strong>
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
