import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { gameService, categoryService, cartService, wishlistService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useOwnedGames } from '../hooks/useOwnedGames';
import './CatalogPage.css';

const PAGE_STEP = 14;

// Gradientes para os placeholders das capas (a API não retorna imagem).
const CARD_COLORS = [
  ['#534AB7', '#3B2063'],
  ['#7b2dff', '#534AB7'],
  ['#261046', '#534AB7'],
  ['#3B2063', '#7b2dff'],
  ['#2d1b69', '#534AB7'],
  ['#1a0a3c', '#3B2063'],
];

function formatPrice(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Grátis' : `R$ ${n.toFixed(2)}`;
}

export default function CatalogPage() {
  const { refresh: refreshCart } = useCart();
  const { owned } = useOwnedGames();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCat, setActiveCat] = useState(''); // '' = Todos
  const [visible, setVisible] = useState(PAGE_STEP);

  useEffect(() => {
    Promise.all([gameService.getAll(), categoryService.getAll()])
      .then(([gamesRes, catsRes]) => {
        setGames(Array.isArray(gamesRes.data) ? gamesRes.data : []);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      })
      .catch(() => setError('Erro ao carregar o catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  // Nome da categoria a partir do fkCategoria (a lista /jogos só traz o id).
  const catName = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[String(c.id)] = c.nome; });
    return map;
  }, [categories]);

  const countByCategory = useMemo(() => {
    const map = {};
    games.forEach((g) => {
      const id = String(g.fkCategoria ?? g.fk_categoria);
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [games]);

  // Só mostra categorias que têm jogos cadastrados.
  const usedCategories = categories.filter((c) => countByCategory[String(c.id)] > 0);

  const filtered = useMemo(() => {
    if (!activeCat) return games;
    return games.filter((g) => String(g.fkCategoria ?? g.fk_categoria) === String(activeCat));
  }, [games, activeCat]);

  const shown = filtered.slice(0, visible);

  function selectCat(id) {
    setActiveCat(id);
    setVisible(PAGE_STEP);
  }

  async function handleAddToCart(e, game) {
    e.preventDefault();
    e.stopPropagation();
    if (owned.has(game.id)) { toast('Você já possui este jogo.'); return; }
    try {
      await cartService.addItem(game.id);
      refreshCart();
      toast.success(`${game.nome} adicionado ao carrinho!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar ao carrinho.');
    }
  }

  async function handleAddToWishlist(e, game) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await wishlistService.add(game.id);
      toast.success(`${game.nome} adicionado aos favoritos!`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast(`${game.nome} já está nos favoritos.`);
      } else {
        toast.error(err.response?.data?.error || 'Não foi possível favoritar.');
      }
    }
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="catalog">
      <div className="container">
        <p className="catalog-breadcrumb">Início › Categorias</p>
        <h1 className="catalog-title">Explore por <span>Categoria</span></h1>
        <p className="catalog-subtitle">Encontre seu próximo jogo favorito</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* Chips de categoria */}
        <span className="catalog-cats-label">Categorias</span>
        <div className="catalog-cats" role="tablist" aria-label="Filtrar por categoria">
          <button
            className={`catalog-cat ${!activeCat ? 'active' : ''}`}
            onClick={() => selectCat('')}
            role="tab"
            aria-selected={!activeCat}
          >
            <span className="catalog-cat-icon" aria-hidden="true">🎮</span>
            <span className="catalog-cat-info">
              <span className="catalog-cat-name">Todos</span>
              <span className="catalog-cat-count">{games.length} jogos</span>
            </span>
          </button>
          {usedCategories.map((cat, i) => (
            <button
              key={cat.id}
              className={`catalog-cat ${String(activeCat) === String(cat.id) ? 'active' : ''}`}
              onClick={() => selectCat(cat.id)}
              role="tab"
              aria-selected={String(activeCat) === String(cat.id)}
            >
              <span
                className="catalog-cat-icon"
                style={{ background: `linear-gradient(135deg, ${CARD_COLORS[i % CARD_COLORS.length].join(', ')})` }}
                aria-hidden="true"
              >
                {(cat.nome || '?').trim()[0]}
              </span>
              <span className="catalog-cat-info">
                <span className="catalog-cat-name">{(cat.nome || '').trim()}</span>
                <span className="catalog-cat-count">{countByCategory[String(cat.id)] || 0} jogos</span>
              </span>
            </button>
          ))}
        </div>

        <p className="catalog-showing">
          Mostrando <strong>{filtered.length}</strong> jogos em{' '}
          <strong>{activeCat ? (catName[String(activeCat)] || '').trim() : 'Todos'}</strong>
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">🎮</span>
            <p>Nenhum jogo encontrado nesta categoria.</p>
          </div>
        ) : (
          <>
            <div className="catalog-grid">
              {shown.map((game, idx) => {
                const colors = CARD_COLORS[idx % CARD_COLORS.length];
                const categoria = (catName[String(game.fkCategoria ?? game.fk_categoria)] || '').trim();
                const isOwned = owned.has(game.id);
                return (
                  <Link
                    to={`/games/${game.id}`}
                    className="g-card"
                    key={game.id}
                    aria-label={`Ver detalhes de ${game.nome}`}
                  >
                    <div
                      className="g-card-cover"
                      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                      aria-hidden="true"
                    >
                      <span className="g-card-emoji">🎮</span>
                      <button
                        className="g-card-fav"
                        onClick={(e) => handleAddToWishlist(e, game)}
                        aria-label={`Adicionar ${game.nome} aos favoritos`}
                        title="Adicionar aos favoritos"
                      >
                        ♡
                      </button>
                      <button
                        className={`g-card-cart ${isOwned ? 'owned' : ''}`}
                        onClick={(e) => handleAddToCart(e, game)}
                        aria-label={isOwned ? `Você já possui ${game.nome}` : `Adicionar ${game.nome} ao carrinho`}
                        title={isOwned ? 'Você já possui este jogo' : 'Adicionar ao carrinho'}
                      >
                        {isOwned ? '✓' : '🛒'}
                      </button>
                    </div>
                    <div className="g-card-body">
                      <h3 className="g-card-name">{game.nome}</h3>
                      <div className="g-card-meta">
                        {categoria && <span className="g-card-cat">{categoria}</span>}
                        <span className="g-card-price">{isOwned ? 'Adquirido' : formatPrice(game.preco)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {visible < filtered.length && (
              <div className="catalog-more">
                <button
                  className="btn btn-outline"
                  onClick={() => setVisible((v) => v + PAGE_STEP)}
                >
                  Carregar mais jogos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
