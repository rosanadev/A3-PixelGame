import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { gameService, categoryService, cartService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import CartPlusIcon from '../components/icons/CartPlusIcon';
import CheckIcon from '../components/icons/CheckIcon';
import './HomePage.css';

const GAMES_PER_PAGE = 12;

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  // Filtro de categoria e busca no cliente: a API (GET /jogos) ignora os
  // parâmetros de filtro e sempre retorna a lista completa, então filtramos
  // aqui. A categoria é casada por fkCategoria (FK para categorias.id) e a
  // busca por nome do jogo.
  const filteredGames = useMemo(() => {
    let list = games;
    if (categoryId) {
      list = list.filter((g) => String(g.fkCategoria) === String(categoryId));
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((g) => (g.nome || '').toLowerCase().includes(q));
    }
    return list;
  }, [games, categoryId, query]);

  const { page, setPage, totalPages, pageItems } = usePagination(filteredGames, GAMES_PER_PAGE);

  // Volta para a primeira página sempre que o filtro/busca muda
  // (padrão recomendado de ajuste de estado durante a renderização).
  const filterKey = `${query}|${categoryId}`;
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
    categoryService.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    gameService
      .getAll()
      .then((r) => setGames(r.data?.games || r.data || []))
      .catch(() => setError('Erro ao carregar jogos.'))
      .finally(() => setLoading(false));
  }, []);

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
      ) : filteredGames.length === 0 ? (
        <p className="home-empty" role="status">Nenhum jogo encontrado.</p>
      ) : (
        <section aria-label="Lista de jogos">
          <div className="games-grid">
            {pageItems.map((game) => (
              <GameCard key={game.id} game={game} />
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

  const title = game.titulo || game.title || game.nome || 'Sem título';
  const price = game.preco ?? game.price ?? 0;
  const category = game.categoria?.nome || game.category?.name || game.categoria || '';

  async function handleBuyNow() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      await cartService.addItem(game.id);
      refreshCart();
      navigate('/checkout');
    } catch (err) {
      // Se o jogo já está no carrinho, isso não é um erro para "Comprar agora":
      // o objetivo já foi atingido, então seguimos para o checkout.
      try {
        const { data } = await cartService.get();
        const noCarrinho = (data?.carrinho?.itens || []).some((i) => i.fkJogo === game.id);
        if (noCarrinho) {
          navigate('/checkout');
          return;
        }
      } catch {
        /* ignora: cai no erro abaixo */
      }
      toast.error(err.response?.data?.message || 'Não foi possível iniciar a compra.');
      setBuying(false);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
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
        <button
          type="button"
          className={`game-card-cart ${addedToCart ? 'added' : ''}`}
          onClick={handleAddToCart}
          aria-label={`Adicionar ${title} ao carrinho`}
          title={addedToCart ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}
        >
          {addedToCart ? <CheckIcon size={20} /> : <CartPlusIcon size={20} />}
        </button>
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
          <Link
            to={`/games/${game.id}`}
            className="btn btn-outline game-card-btn"
            aria-label={`Ver detalhes de ${title}`}
          >
            Ver mais
          </Link>
        </div>
        <button
          type="button"
          className="btn btn-primary game-card-buy"
          onClick={handleBuyNow}
          disabled={buying}
          aria-busy={buying}
          aria-label={`Comprar ${title} agora`}
        >
          {buying ? 'Processando...' : '⚡ Comprar agora'}
        </button>
      </div>
    </article>
  );
}
