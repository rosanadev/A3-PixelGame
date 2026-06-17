import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoVertical from '../img/login/logo-vertical.png';
import logoHorizontal from '../img/login/logo-horizontal.png';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 404) setError('Usuário não encontrado.');
      else if (err.response?.status === 401) setError('Senha incorreta.');
      else setError(msg || 'Erro ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="login-page">

      {/* Header */}
      <header className="login-header">
        <nav className="login-nav">
          <Link to="/" aria-label="PixelGame - Página inicial">
            <img src={logoHorizontal} alt="PixelGame" className="login-nav-logo" />
          </Link>

          {/* Busca com lupa */}
          <form className="login-nav-search" role="search" onSubmit={handleSearch}>
            <label htmlFor="nav-search" className="sr-only">Pesquisar jogo</label>
            <div className="login-search-wrapper">
              <svg className="login-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="nav-search"
                type="search"
                placeholder="Pesquisar jogo..."
                className="login-search-bar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Pesquisar jogo"
              />
            </div>
          </form>

          <div className="login-nav-actions">
            <Link to="/login" className="login-btn-purple">Entrar</Link>
          </div>
        </nav>
      </header>

      {/* Main — duas colunas */}
      <main className="login-main">
        <div className="login-container">

          {/* Coluna esquerda — grade decorativa + logo */}
          <div className="login-col-logo">
            <div className="login-grid" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="login-grid-cell" />
              ))}
            </div>
            <img src={logoVertical} alt="PixelGame logo" className="login-main-logo" />
          </div>

          {/* Coluna direita — formulário */}
          <div className="login-col-form">

            {error && (
              <div className="login-alert" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate aria-label="Formulário de login">
              <h1 className="login-greeting">Bem-vindo de volta!</h1>
              <h2 className="login-subtitle">Conecte-se com seu email</h2>

              <div className="login-field">
                <label htmlFor="email" className="sr-only">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="login-email-input"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-required="true"
                />
              </div>

              <div className="login-field">
                <label htmlFor="senha" className="sr-only">Senha</label>
                <input
                  id="senha"
                  type="password"
                  className="login-email-input"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                />
              </div>

              <button type="submit" className="login-button" disabled={loading} aria-busy={loading}>
                {loading
                  ? <><span className="login-spinner" aria-hidden="true" /> Entrando...</>
                  : 'Login'
                }
              </button>
            </form>

            <p className="login-register-link">
              Não tem conta?{' '}
              <Link to="/register">Criar conta gratuita</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
