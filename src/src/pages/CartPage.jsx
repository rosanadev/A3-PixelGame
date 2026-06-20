import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cartService, gameService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Pages.css';

function formatPrice(value) {
  return `R$ ${(Number(value) || 0).toFixed(2)}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { refresh: refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await cartService.get();
      const itens = data?.carrinho?.itens || [];

      // Os itens do carrinho só trazem o fkJogo, então buscamos
      // os dados de cada jogo para exibir nome e preço.
      const detalhados = await Promise.all(
        itens.map(async (item) => {
          try {
            const { data: jogo } = await gameService.getById(item.fkJogo);
            return { ...item, jogo };
          } catch {
            return { ...item, jogo: null };
          }
        }),
      );
      setItems(detalhados);
    } catch {
      setError('Erro ao carregar o carrinho.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function handleRemove(item) {
    const fkJogo = item.fkJogo;
    try {
      await cartService.removeItem(fkJogo);
      setItems((prev) => prev.filter((i) => i.fkJogo !== fkJogo));
      refreshCart();
      toast(`${item.jogo?.nome || 'Item'} removido do carrinho.`, {
        action: {
          label: 'Desfazer',
          onClick: async () => {
            try {
              await cartService.addItem(fkJogo);
              setItems((prev) => (prev.some((i) => i.fkJogo === fkJogo) ? prev : [...prev, item]));
              refreshCart();
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

  const total = items.reduce((sum, i) => sum + (Number(i.jogo?.preco) || 0), 0);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Meu Carrinho</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">🛒</span>
          <p>Seu carrinho está vazio.</p>
          <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
        </div>
      ) : (
        <div className="split-layout">
          <div className="item-list">
            {items.map((item) => (
              <div className="card item-row" key={item.id}>
                <div className="item-thumb" aria-hidden="true">🎮</div>
                <div className="item-info">
                  <div className="item-title">
                    {item.jogo ? (
                      <Link to={`/games/${item.fkJogo}`}>{item.jogo.nome}</Link>
                    ) : (
                      `Jogo #${item.fkJogo}`
                    )}
                  </div>
                  <div className="item-meta">{item.jogo?.ano || ''}</div>
                </div>
                <span className="item-price">{formatPrice(item.jogo?.preco)}</span>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleRemove(item)}
                  aria-label={`Remover ${item.jogo?.nome || 'item'} do carrinho`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <aside className="card summary-card" aria-label="Resumo do pedido">
            <h2>Resumo</h2>
            <div className="summary-line">
              <span>Itens ({items.length})</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
              Finalizar compra
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
