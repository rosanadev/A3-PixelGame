import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { gameService, cartService, publicService, categoryService, wishlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './HomePage.css';

// Paleta de cores para placeholders dos jogos
const CARD_COLORS = [
  ['#534AB7', '#3B2063'],
  ['#7b2dff', '#534AB7'],
  ['#261046', '#534AB7'],
  ['#3B2063', '#7b2dff'],
  ['#2d1b69', '#534AB7'],
  ['#1a0a3c', '#3B2063'],
];

function getCardColor(index) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export default function HomePage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [catScroll, setCatScroll] = useState(0);
  const catRef = useRef(null);

  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';

  const filteredGames = useMemo(() => {
    let list = games;
    if (categoryFilter) {
      list = list.filter((g) =>
        String(g.fkCategoria ?? g.fk_categoria) === String(categoryFilter)
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((g) => (g.nome || '').toLowerCase().includes(q));
    }
    return list;
  }, [games, categoryFilter, query]);

  // Jogo destaque — primeiro da lista
  const featuredGame = games[0] || null;

  // Linhas temáticas da home (API-puro: apenas fatias da lista de jogos)
  const novidades = useMemo(
    () => [...games].sort((a, b) => (Number(b.ano) || 0) - (Number(a.ano) || 0)).slice(0, 14),
    [games],
  );
  const promocoes = useMemo(
    () => games.filter((g) => Number(g.desconto) > 0),
    [games],
  );
  const gratis = useMemo(
    () => games.filter((g) => Number(g.preco) === 0),
    [games],
  );

  // Contagem de jogos por categoria
  const countByCategory = useMemo(() => {
    const map = {};
    games.forEach((g) => {
      const id = String(g.fkCategoria ?? g.fk_categoria);
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [games]);

  useEffect(() => {
    setLoading(true);
    setError('');
    if (user) {
      Promise.all([gameService.getAll(), categoryService.getAll()])
        .then(([gamesRes, catsRes]) => {
          const jogos = gamesRes.data?.games || gamesRes.data || [];
          setGames(jogos);
          const idsComJogos = new Set(jogos.map((g) => String(g.fkCategoria ?? g.fk_categoria)));
          const todas = Array.isArray(catsRes.data) ? catsRes.data : [];
          setCategories(todas.filter((c) => idsComJogos.has(String(c.id))));
        })
        .catch(() => setError('Erro ao carregar jogos.'))
        .finally(() => setLoading(false));
    } else {
      publicService.getJogos()
        .then((r) => setGames(r.data?.games || r.data || []))
        .catch(() => setError('Erro ao carregar jogos.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  function handleCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id);
    else next.delete('category');
    next.delete('q');
    setSearchParams(next);
  }

  function scrollCat(dir) {
    if (catRef.current) {
      catRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
      setCatScroll(catRef.current.scrollLeft + dir * 260);
    }
  }

  const filtering = !!(query || categoryFilter);

  return (
    <div className="home-page">

      {/* ===== BANNER HERO ===== */}
      {featuredGame && (
        <section className="home-hero" aria-label="Jogo em destaque">
          <div className="home-hero-bg" aria-hidden="true">
            <div className="home-hero-overlay" />
          </div>
          <div className="home-hero-content">
            <span className="home-hero-badge">Destaque da semana</span>
            <h1 className="home-hero-title">{featuredGame.nome}</h1>
            {featuredGame.descricao && (
              <p className="home-hero-sub">
                {featuredGame.descricao.replace(/^"|"$/g, '').substring(0, 80)}
              </p>
            )}
            {featuredGame.id && (
              <Link to={`/games/${featuredGame.id}`} className="home-hero-btn">
                Ver jogo
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ===== CARROSSEL DE CATEGORIAS ===== */}
      {user && categories.length > 0 && (
        <section className="home-cats-section" aria-label="Categorias">
          <div className="home-cats-header">
            <span className="home-cats-label">Categorias</span>
          </div>
          <div className="home-cats-wrapper">
            <button
              className="home-cats-arrow left"
              onClick={() => scrollCat(-1)}
              aria-label="Categorias anteriores"
            >‹</button>
            <div className="home-cats-track" ref={catRef}>
              <button
                className={`home-cat-chip ${!categoryFilter ? 'active' : ''}`}
                onClick={() => handleCategory('')}
                aria-pressed={!categoryFilter}
              >
<span className="home-cat-name">Todos</span>
                <span className="home-cat-count">{games.length} jogos</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`home-cat-chip ${categoryFilter === String(cat.id) ? 'active' : ''}`}
                  onClick={() => handleCategory(cat.id)}
                  aria-pressed={categoryFilter === String(cat.id)}
                >
<span className="home-cat-name">{cat.nome}</span>
                  <span className="home-cat-count">{countByCategory[String(cat.id)] || 0} jogos</span>
                </button>
              ))}
            </div>
            <button
              className="home-cats-arrow right"
              onClick={() => scrollCat(1)}
              aria-label="Próximas categorias"
            >›</button>
          </div>
        </section>
      )}

      {/* ===== LINHAS DE JOGOS ===== */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : error ? (
        <div className="alert alert-error container" role="alert">{error}</div>
      ) : filtering ? (
        <>
          {query && (
            <p className="home-search-info container" aria-live="polite">
              Resultados para: <strong>"{query}"</strong>
            </p>
          )}
          {filteredGames.length === 0 ? (
            <p className="home-empty" role="status">Nenhum jogo encontrado.</p>
          ) : (
            <GameCarousel title="Resultados" games={filteredGames} />
          )}
        </>
      ) : (
        <>
          <GameCarousel title="Popular" games={games} />
          <GameCarousel title="Novidades" games={novidades} />
          <GameCarousel title="Em promoção" games={promocoes} />
          <GameCarousel title="Grátis para jogar" games={gratis} />
        </>
      )}
    </div>
  );
}

function GameCarousel({ title, games }) {
  const ref = useRef(null);

  function scroll(dir) {
    if (ref.current) ref.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  if (!games || games.length === 0) return null;

  return (
    <section className="home-popular-section" aria-label={title}>
      <div className="home-row-header">
        <span className="home-row-title">{title}</span>
      </div>
      <div className="home-popular-wrapper">
        <button className="home-cats-arrow left" onClick={() => scroll(-1)} aria-label="Anteriores">‹</button>
        <div className="home-popular-track" ref={ref}>
          {games.map((game, idx) => (
            <GameCard key={game.id ?? idx} game={game} index={idx} />
          ))}
        </div>
        <button className="home-cats-arrow right" onClick={() => scroll(1)} aria-label="Próximos">›</button>
      </div>
    </section>
  );
}

function GameCard({ game, index }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [faved, setFaved] = useState(false);
  const [colors] = useState(getCardColor(index));

  const title = game.nome || 'Sem título';
  const price = game.preco ?? 0;
  const hasId = !!game.id;

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await cartService.addItem(game.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);
      refreshCart();
      toast.success(`${title} adicionado ao carrinho!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar ao carrinho.');
    }
  }

  async function handleAddToWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await wishlistService.add(game.id);
      setFaved(true);
      toast.success(`${title} adicionado aos favoritos!`);
    } catch (err) {
      if (err.response?.status === 409) {
        setFaved(true);
        toast(`${title} já está nos favoritos.`);
      } else {
        toast.error(err.response?.data?.error || 'Não foi possível favoritar.');
      }
    }
  }

  const cardContent = (
    <div className="pop-card">
      {/* Placeholder colorido */}
      <div
        className="pop-card-img"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
        aria-hidden="true"
      >
        {hasId && user && (
          <>
            <button
              className={`pop-card-fav ${faved ? 'active' : ''}`}
              onClick={handleAddToWishlist}
              aria-label={`Adicionar ${title} aos favoritos`}
              title="Adicionar aos favoritos"
            >
              {faved ? '♥' : '♡'}
            </button>
            <button
              className={`pop-card-cart ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              aria-label={`Adicionar ${title} ao carrinho`}
              title="Adicionar ao carrinho"
            >
              {addedToCart ? '✓' : '🛒'}
            </button>
          </>
        )}
      </div>
      <p className="pop-card-name">{title}</p>
      <p className="pop-card-price">
        {price === 0 ? 'Grátis' : `R$ ${Number(price).toFixed(2)}`}
      </p>
    </div>
  );

  return hasId
    ? <Link to={`/games/${game.id}`} className="pop-card-link" aria-label={`Ver ${title}`}>{cardContent}</Link>
    : <div className="pop-card-link">{cardContent}</div>;
}
