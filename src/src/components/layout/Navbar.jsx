import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartIcon from '../icons/CartIcon';
import logoHorizontal from '../../img/login/logo-horizontal.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
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

        {/* Logo real do projeto */}
        <Link to="/" className="navbar__logo" aria-label="PixelGame - Página inicial">
          <img src={logoHorizontal} alt="PixelGame" className="navbar__logo-img" />
        </Link>

        {/* Links principais */}
        {user && (
          <nav className="navbar__links" aria-label="Navegação principal">
            <Link to="/catalog" className="navbar__link">Catálogo</Link>
            <Link to="/reviews" className="navbar__link">Minhas avaliações</Link>
          </nav>
        )}

        {/* Busca com lupa */}
        <form className="navbar__search" onSubmit={handleSearch} role="search">
          <label htmlFor="navbar-search" className="sr-only">Buscar jogos</label>
          <div className="navbar__search-wrapper">
            <svg className="navbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="navbar-search"
              type="search"
              className="navbar__search-input"
              placeholder="Buscar jogo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar jogos"
            />
          </div>
        </form>

        {/* Ações */}
        <nav className="navbar__actions" aria-label="Navegação do usuário">
          {user ? (
            <>
              <Link to="/wishlist" className="navbar__icon-btn" aria-label="Lista de desejos" title="Lista de desejos">♡</Link>
              <Link
                to="/cart"
                className="navbar__icon-btn navbar__cart"
                aria-label={count > 0 ? 'Carrinho (com itens)' : 'Carrinho'}
                title="Carrinho"
              >
                <CartIcon size={22} />
                {count > 0 && <span className="navbar__cart-badge" aria-hidden="true" />}
              </Link>

              <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
                <button
                  className="navbar__user-btn"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label={`Menu do usuário: ${user.nome}`}
                >
                  <span className="navbar__avatar" aria-hidden="true">
                    {(user.nome || 'U')[0].toUpperCase()}
                  </span>
                  <span className="navbar__username">{user.nome}</span>
                  <span aria-hidden="true">▾</span>
                </button>

                {menuOpen && (
                  <ul className="navbar__dropdown" role="menu">
                    <li role="menuitem"><Link to="/library" onClick={() => setMenuOpen(false)}>Minha Biblioteca</Link></li>
                    <li role="menuitem"><Link to="/orders" onClick={() => setMenuOpen(false)}>Minhas Compras</Link></li>
                    <li role="menuitem"><Link to="/profile" onClick={() => setMenuOpen(false)}>Meu Perfil</Link></li>
                    {isAdmin && (
                      <>
                        <li className="navbar__dropdown-divider" role="separator" />
                        <li className="navbar__dropdown-label">Admin</li>
                        <li role="menuitem"><Link to="/admin/games" onClick={() => setMenuOpen(false)}>Gerenciar Jogos</Link></li>
                        <li role="menuitem"><Link to="/admin/categories" onClick={() => setMenuOpen(false)}>Categorias</Link></li>
                        <li role="menuitem"><Link to="/admin/companies" onClick={() => setMenuOpen(false)}>Empresas</Link></li>
                        <li role="menuitem"><Link to="/admin/users" onClick={() => setMenuOpen(false)}>Usuários</Link></li>
                        <li role="menuitem"><Link to="/reports" onClick={() => setMenuOpen(false)}>Relatórios</Link></li>
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
            <Link to="/login" className="navbar__btn-purple">Entrar</Link>
          )}

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >☰</button>
        </nav>
      </div>
    </header>
  );
}
