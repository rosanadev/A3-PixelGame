import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar" role="banner">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="PixelGame - Página inicial">
          <span className="navbar__logo-text">Pixel<span>Game</span></span>
        </Link>

        {/* Busca */}
        <form className="navbar__search" onSubmit={handleSearch} role="search">
          <label htmlFor="navbar-search" className="sr-only">Buscar jogos</label>
          <input
            id="navbar-search"
            type="search"
            className="navbar__search-input"
            placeholder="Buscar jogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar jogos"
          />
          <button type="submit" className="navbar__search-btn" aria-label="Executar busca">
            🔍
          </button>
        </form>

        {/* Ações */}
        <nav className="navbar__actions" aria-label="Navegação do usuário">
          {user ? (
            <>
              <Link to="/wishlist" className="navbar__icon-btn" aria-label="Lista de desejos" title="Lista de desejos">
                ♡
              </Link>
              <Link to="/cart" className="navbar__icon-btn" aria-label="Carrinho de compras" title="Carrinho">
                🛒
              </Link>

              {/* Menu do usuário */}
              <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
                <button
                  className="navbar__user-btn"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label={`Menu do usuário: ${user.nome || user.name}`}
                >
                  <span className="navbar__avatar" aria-hidden="true">
                    {(user.nome || user.name || 'U')[0].toUpperCase()}
                  </span>
                  <span className="navbar__username">{user.nome || user.name}</span>
                  <span aria-hidden="true">▾</span>
                </button>

                {menuOpen && (
                  <ul className="navbar__dropdown" role="menu">
                    <li role="menuitem"><Link to="/orders" onClick={() => setMenuOpen(false)}>Minhas Compras</Link></li>
                    <li role="menuitem"><Link to="/reports" onClick={() => setMenuOpen(false)}>Relatórios</Link></li>
                    {isAdmin && (
                      <>
                        <li className="navbar__dropdown-divider" role="separator" />
                        <li className="navbar__dropdown-label">Admin</li>
                        <li role="menuitem"><Link to="/admin/games" onClick={() => setMenuOpen(false)}>Gerenciar Jogos</Link></li>
                        <li role="menuitem"><Link to="/admin/categories" onClick={() => setMenuOpen(false)}>Categorias</Link></li>
                        <li role="menuitem"><Link to="/admin/companies" onClick={() => setMenuOpen(false)}>Empresas</Link></li>
                      </>
                    )}
                    <li className="navbar__dropdown-divider" role="separator" />
                    <li role="menuitem">
                      <button onClick={handleLogout} className="navbar__logout-btn">Sair</button>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Entrar</Link>
          )}

          {/* Hamburger mobile */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </nav>
      </div>
    </header>
  );
}
