import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gameService, categoryService } from '../services/api';
import './HomePage.css';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (query) params.q = query;
    if (categoryId) params.category = categoryId;

    gameService
      .getAll(params)
      .then((r) => setGames(r.data?.games || r.data || []))
      .catch(() => setError('Erro ao carregar jogos.'))
      .finally(() => setLoading(false));
  }, [query, categoryId]);

  function handleCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id);
    else next.delete('category');
    next.delete('q');
    setSearchParams(next);
  }

  return (
    <div className="container home-page">
      {/* Hero */}
      <section className="home-hero" aria-label="Banner de destaque">
        <h1 className="home-hero-title">Sua loja de jogos digitais</h1>
        <p className="home-hero-sub">Os melhores jogos, na palma da sua mão.</p>
      </section>

      {/* Filtro por categoria */}
      <nav className="home-categories" aria-label="Filtrar por categoria">
        <button
          className={`category-chip ${!categoryId ? 'active' : ''}`}
          onClick={() => handleCategory('')}
          aria-pressed={!categoryId}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${categoryId === String(cat.id) ? 'active' : ''}`}
            onClick={() => handleCategory(cat.id)}
            aria-pressed={categoryId === String(cat.id)}
          >
            {cat.nome || cat.name}
          </button>
        ))}
      </nav>

      {/* Resultados de busca */}
      {query && (
        <p className="home-search-info" aria-live="polite">
          Resultados para: <strong>"{query}"</strong>
        </p>
      )}

      {/* Grid de jogos */}
      {loading ? (
        <div className="page-loading" aria-label="Carregando jogos">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-error" role="alert">{error}</div>
      ) : games.length === 0 ? (
        <p className="home-empty" role="status">Nenhum jogo encontrado.</p>
      ) : (
        <section aria-label="Lista de jogos">
          <div className="games-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GameCard({ game }) {
  const title = game.titulo || game.title || game.nome || 'Sem título';
  const price = game.preco ?? game.price ?? 0;
  const category = game.categoria?.nome || game.category?.name || game.categoria || '';

  return (
    <article className="game-card card" aria-label={`Jogo: ${title}`}>
      <div className="game-card-img" aria-hidden="true">
        {game.imagem || game.image ? (
          <img src={game.imagem || game.image} alt={`Capa do jogo ${title}`} loading="lazy" />
        ) : (
          <div className="game-card-placeholder">🎮</div>
        )}
      </div>
      <div className="game-card-body">
        {category && <span className="badge badge-purple">{category}</span>}
        <h2 className="game-card-title">{title}</h2>
        <div className="game-card-footer">
          <span className="game-card-price">
            {price === 0 ? 'Grátis' : `R$ ${Number(price).toFixed(2)}`}
          </span>
          <Link
            to={`/games/${game.id}`}
            className="btn btn-primary game-card-btn"
            aria-label={`Ver detalhes de ${title}`}
          >
            Ver mais
          </Link>
        </div>
      </div>
    </article>
  );
}
