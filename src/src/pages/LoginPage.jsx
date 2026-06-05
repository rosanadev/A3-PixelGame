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

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Formulário de login"
            >
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

              <button
                type="submit"
                className="login-button"
                disabled={loading}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="login-spinner" aria-hidden="true" /> Entrando...</>
                  : 'Login'
                }
              </button>
            </form>

            <div className="login-line" aria-hidden="true" />
            <p className="login-or">ou continue com:</p>

            <div className="login-social">
              <button
                className="login-social-button"
                type="button"
                aria-label="Entrar com Google (em breve)"
                disabled
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C21.9955846,18.9520994 23.4109842,15.9764055 23.4109842,12 C23.4109842,11.2472153 23.2981769,10.4743042 23.1169999,9.74974609 L12,9.74974609 L12,14.4531498 L18.4274934,14.4531498 C18.1360455,16.0328376 17.2235204,17.2369132 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                className="login-social-button"
                type="button"
                aria-label="Entrar com Facebook (em breve)"
                disabled
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

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
