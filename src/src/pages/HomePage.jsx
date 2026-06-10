import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { gameService, cartService, publicService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import CartPlusIcon from '../components/icons/CartPlusIcon';
import CheckIcon from '../components/icons/CheckIcon';
import './HomePage.css';

const GAMES_PER_PAGE = 12;

export default function HomePage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';


  // Funciona tanto para jogos públicos quanto autenticados
  const categories = useMemo(() => {
    const map = new Map();
    games.forEach((g) => {
      const nome = g.categoria || g.categoria?.nome;
      const id = g.fkCategoria ?? g.fk_categoria;
      if (nome && id) map.set(String(id), nome);
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [games]);

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

  const { page, setPage, totalPages, pageItems } = usePagination(filteredGames, GAMES_PER_PAGE);

  const filterKey = `${query}|${categoryFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  function goToPage(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    setLoading(true);
    setError('');

    // Usa rota autenticada se logado (retorna id dos jogos, necessário para navegar)
    // Usa rota pública se não logado
    const fetch = user
      ? gameService.getAll()
      : publicService.getJogos();

    fetch
      .then((r) => setGames(r.data?.games || r.data || []))
      .catch(() => setError('Erro ao carregar jogos.'))
      .finally(() => setLoading(false));
  }, [user]);

  function handleCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id);
    else next.delete('category');
    next.delete('q');
    setSearchParams(next);
  }

  return (
    <div className="container home-page">
      <section className="home-hero" aria-label="Banner de destaque">
        <h1 className="home-hero-title">Sua loja de jogos digitais</h1>
        <p className="home-hero-sub">Os melhores jogos, na palma da sua mão.</p>
      </section>

      {/* Filtro por categoria — extraído dos próprios jogos */}
      <nav className="home-categories" aria-label="Filtrar por categoria">
        <button
          className={`category-chip ${!categoryFilter ? 'active' : ''}`}
          onClick={() => handleCategory('')}
          aria-pressed={!categoryFilter}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${categoryFilter === cat.id ? 'active' : ''}`}
            onClick={() => handleCategory(cat.id)}
            aria-pressed={categoryFilter === cat.id}
          >
            {cat.nome}
          </button>
        ))}
      </nav>

      {query && (
        <p className="home-search-info" aria-live="polite">
          Resultados para: <strong>"{query}"</strong>
        </p>
      )}

      {loading ? (
        <div className="page-loading" aria-label="Carregando jogos">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-error" role="alert">{error}</div>
      ) : filteredGames.length === 0 ? (
        <p className="home-empty" role="status">Nenhum jogo encontrado.</p>
      ) : (
        <section aria-label="Lista de jogos">
          <div className="games-grid">
            {pageItems.map((game, idx) => (
              <GameCard key={game.id ?? idx} game={game} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </section>
      )}
    </div>
  );
}

function GameCard({ game }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [buying, setBuying] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const title = game.nome || 'Sem título';
  const price = game.preco ?? 0;
  const category = game.categoria?.nome || game.categoria || '';
  const hasId = !!game.id;

  async function handleBuyNow() {
    if (!user) { navigate('/login'); return; }
    setBuying(true);
    try {
      await cartService.addItem(game.id);
      refreshCart();
      navigate('/checkout');
    } catch (err) {
      try {
        const { data } = await cartService.get();
        const noCarrinho = (data?.carrinho?.itens || []).some((i) => i.fkJogo === game.id);
        if (noCarrinho) { navigate('/checkout'); return; }
      } catch { /* ignora */ }
      toast.error(err.response?.data?.message || 'Não foi possível iniciar a compra.');
      setBuying(false);
    }
  }

  async function handleAddToCart() {
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

  return (
    <article className="game-card card" aria-label={`Jogo: ${title}`}>
      <div className="game-card-img" aria-hidden="true">
        {game.imagem || game.image ? (
          <img src={game.imagem || game.image} alt={`Capa do jogo ${title}`} loading="lazy" />
        ) : (
          <div className="game-card-placeholder">🎮</div>
        )}
        {hasId && (
          <button
            type="button"
            className={`game-card-cart ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Adicionar ${title} ao carrinho`}
          >
            {addedToCart ? <CheckIcon size={20} /> : <CartPlusIcon size={20} />}
          </button>
        )}
      </div>
      <div className="game-card-body">
        <div className="game-card-tags">
          {category && <span className="badge badge-purple">{category}</span>}
        </div>
        <h2 className="game-card-title">{title}</h2>
        <div className="game-card-footer">
          <span className="game-card-price">
            {price === 0 ? 'Grátis' : `R$ ${Number(price).toFixed(2)}`}
          </span>
          {hasId ? (
            <Link
              to={`/games/${game.id}`}
              className="btn btn-outline game-card-btn"
              aria-label={`Ver detalhes de ${title}`}
            >
              Ver mais
            </Link>
          ) : (
            <span className="btn btn-ghost game-card-btn" aria-label="Faça login para ver detalhes">
              🔒 Login
            </span>
          )}
        </div>
        {hasId && (
          <button
            type="button"
            className="btn btn-primary game-card-buy"
            onClick={handleBuyNow}
            disabled={buying}
            aria-busy={buying}
          >
            {buying ? 'Processando...' : '⚡ Comprar agora'}
          </button>
        )}
      </div>
    </article>
  );
}
