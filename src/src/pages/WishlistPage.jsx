import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { wishlistService, cartService, categoryService } from '../services/api';
import './CatalogPage.css';

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

export default function WishlistPage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([wishlistService.get(), categoryService.getAll()])
      .then(([wishRes, catsRes]) => {
        setGames(Array.isArray(wishRes.data) ? wishRes.data : []);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      })
      .catch(() => setError('Erro ao carregar a lista de desejos.'))
      .finally(() => setLoading(false));
  }, []);

  const catName = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[String(c.id)] = c.nome; });
    return map;
  }, [categories]);

  async function handleRemove(e, game) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await wishlistService.remove(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      toast(`${game.nome} removido dos favoritos.`, {
        action: {
          label: 'Desfazer',
          onClick: async () => {
            try {
              await wishlistService.add(game.id);
              setGames((prev) => (prev.some((g) => g.id === game.id) ? prev : [...prev, game]));
            } catch {
              toast.error('Não foi possível desfazer.');
            }
          },
        },
      });
    } catch {
      setError('Não foi possível remover o item.');
    }
  }

  async function handleAddToCart(e, game) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartService.addItem(game.id);
      toast.success(`${game.nome} adicionado ao carrinho!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar ao carrinho.');
    }
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="catalog">
      <div className="container">
        <p className="catalog-breadcrumb">Início › Favoritos</p>
        <h1 className="catalog-title">Relembre os seus <span>Favoritos</span></h1>
        <p className="catalog-subtitle">Tudo o que você salvou, em um só lugar!</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {games.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">♡</span>
            <p>Sua lista de desejos está vazia.</p>
            <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
          </div>
        ) : (
          <>
            <p className="catalog-showing">
              Mostrando <strong>{games.length}</strong> {games.length === 1 ? 'jogo' : 'jogos'} salvos
            </p>
            <div className="catalog-grid">
              {games.map((game, idx) => {
                const colors = CARD_COLORS[idx % CARD_COLORS.length];
                const categoria = (catName[String(game.fk_categoria ?? game.fkCategoria)] || '').trim();
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
                        className="g-card-remove"
                        onClick={(e) => handleRemove(e, game)}
                        aria-label={`Remover ${game.nome} dos favoritos`}
                        title="Remover dos favoritos"
                      >
                        ✕
                      </button>
                      <button
                        className="g-card-cart"
                        onClick={(e) => handleAddToCart(e, game)}
                        aria-label={`Adicionar ${game.nome} ao carrinho`}
                        title="Adicionar ao carrinho"
                      >
                        🛒
                      </button>
                    </div>
                    <div className="g-card-body">
                      <h3 className="g-card-name">{game.nome}</h3>
                      <div className="g-card-meta">
                        {categoria && <span className="g-card-cat">{categoria}</span>}
                        <span className="g-card-price">{formatPrice(game.preco)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
