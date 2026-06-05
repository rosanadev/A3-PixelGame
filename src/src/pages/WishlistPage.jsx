import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService, cartService } from '../services/api';
import './Pages.css';

function formatPrice(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Grátis' : `R$ ${n.toFixed(2)}`;
}

export default function WishlistPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    wishlistService
      .get()
      .then((r) => setGames(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Erro ao carregar a lista de desejos.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(jogoId) {
    try {
      await wishlistService.remove(jogoId);
      setGames((prev) => prev.filter((g) => g.id !== jogoId));
    } catch {
      setError('Não foi possível remover o item.');
    }
  }

  async function handleAddToCart(jogoId) {
    setFeedback('');
    try {
      await cartService.addItem(jogoId);
      setFeedback('Jogo adicionado ao carrinho!');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Não foi possível adicionar ao carrinho.');
    }
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Lista de Desejos</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {feedback && <div className="alert alert-info" role="status">{feedback}</div>}

      {games.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">♡</span>
          <p>Sua lista de desejos está vazia.</p>
          <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
        </div>
      ) : (
        <div className="item-list">
          {games.map((game) => (
            <div className="card item-row" key={game.id}>
              <div className="item-thumb" aria-hidden="true">🎮</div>
              <div className="item-info">
                <div className="item-title">
                  <Link to={`/games/${game.id}`}>{game.nome}</Link>
                </div>
                <div className="item-meta">{game.ano || ''}</div>
              </div>
              <span className="item-price">{formatPrice(game.preco)}</span>
              <button className="btn btn-primary" onClick={() => handleAddToCart(game.id)}>
                🛒 Carrinho
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleRemove(game.id)}
                aria-label={`Remover ${game.nome} da lista de desejos`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
