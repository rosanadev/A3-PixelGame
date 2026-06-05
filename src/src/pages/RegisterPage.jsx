import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import logoVertical from '../img/login/logo-vertical.png';
import logoHorizontal from '../img/login/logo-horizontal.png';
import './LoginPage.css';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    dataNascimento: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function formatDate(value) {
    if (!value) return '';
    const [ano, mes, dia] = value.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        dataNascimento: formatDate(form.dataNascimento),
      });
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) setError('Este e-mail já está cadastrado.');
      else if (err.response?.status === 400) setError(msg || 'Preencha todos os campos obrigatórios.');
      else setError(msg || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <header className="login-header">
        <nav className="login-nav">
          <Link to="/" aria-label="PixelGame - Página inicial">
            <img src={logoHorizontal} alt="PixelGame" className="login-nav-logo" />
          </Link>
          <form className="login-nav-search" role="search">
            <label htmlFor="nav-search" className="sr-only">Pesquisar jogo</label>
            <input
              id="nav-search"
              type="text"
              placeholder="Pesquisar jogo..."
              className="login-search-bar"
              aria-label="Pesquisar jogo"
            />
          </form>
          <div className="login-nav-actions">
            <Link to="/login" className="login-btn-purple">Entrar</Link>
          </div>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-container">

          <div className="login-col-logo">
            <img src={logoVertical} alt="PixelGame logo" className="login-main-logo" />
          </div>

          <div className="login-col-form">

            {error && (
              <div className="login-alert" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
            {success && (
              <div className="login-alert login-alert-success" role="status" aria-live="polite">
                {success}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Formulário de cadastro"
            >
              <h1 className="login-greeting">Criar conta</h1>
              <h2 className="login-subtitle">Preencha os dados para se cadastrar</h2>

              <div className="login-field">
                <label htmlFor="nome" className="register-label">
                  Nome completo <span aria-hidden="true">*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  className="login-email-input"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  aria-required="true"
                />
              </div>

              <div className="login-field">
                <label htmlFor="reg-email" className="register-label">
                  E-mail <span aria-hidden="true">*</span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="login-email-input"
                  placeholder="exemplo@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  aria-required="true"
                />
              </div>

              <div className="login-field">
                <label htmlFor="dataNascimento" className="register-label">
                  Data de nascimento
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  className="login-email-input"
                  value={form.dataNascimento}
                  onChange={handleChange}
                  aria-describedby="date-hint"
                />
                <small id="date-hint" className="register-hint">Opcional</small>
              </div>

              <div className="register-row">
                <div className="login-field">
                  <label htmlFor="reg-senha" className="register-label">
                    Senha <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-senha"
                    name="senha"
                    type="password"
                    className="login-email-input"
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="confirmarSenha" className="register-label">
                    Confirmar senha <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    className="login-email-input"
                    placeholder="Repita a senha"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="login-spinner" aria-hidden="true" /> Criando conta...</>
                  : 'Criar conta'
                }
              </button>
            </form>

            <p className="login-register-link">
              Já tem conta?{' '}
              <Link to="/login">Entrar</Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
