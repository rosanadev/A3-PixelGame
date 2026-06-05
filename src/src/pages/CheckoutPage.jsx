import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService, gameService, orderService } from '../services/api';
import './Pages.css';

function formatPrice(value) {
  return `R$ ${(Number(value) || 0).toFixed(2)}`;
}

// Máscaras dos campos do cartão
function maskCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

function maskExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function maskCvv(value) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function maskCardName(value) {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase();
}

const METODOS = [
  { id: 'cartao', label: '💳 Cartão' },
  { id: 'pix', label: '⚡ Pix' },
  { id: 'boleto', label: '🧾 Boleto' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const [metodo, setMetodo] = useState('cartao');
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cartService.get();
      const itens = data?.carrinho?.itens || [];
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

  const total = items.reduce((sum, i) => sum + (Number(i.jogo?.preco) || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setProcessing(true);
    try {
      // 1. Simula o pagamento
      const dados = metodo === 'cartao' ? cartao : {};
      await orderService.pay(metodo, dados);
      // 2. Finaliza a venda (gera chaves e fecha o carrinho)
      const { data } = await orderService.checkout();
      if (data?.venda) {
        navigate('/orders', { state: { sucesso: true } });
      } else {
        setError(data?.message || 'Não foi possível concluir a compra.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar o pagamento.');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">🛒</span>
          <p>Seu carrinho está vazio.</p>
          <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Finalizar compra</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="split-layout">
        <div className="card">
          <h2>Pagamento</h2>

          <div className="option-chips mt-1" role="radiogroup" aria-label="Método de pagamento">
            {METODOS.map((m) => (
              <button
                type="button"
                key={m.id}
                className={`option-chip ${metodo === m.id ? 'active' : ''}`}
                role="radio"
                aria-checked={metodo === m.id}
                onClick={() => setMetodo(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {metodo === 'cartao' && (
            <div className="mt-1">
              <div className="form-group">
                <label htmlFor="numero">Número do cartão</label>
                <input
                  id="numero"
                  className="input-field"
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  value={cartao.numero}
                  onChange={(e) => setCartao({ ...cartao, numero: maskCardNumber(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nome">Nome impresso</label>
                <input
                  id="nome"
                  className="input-field"
                  placeholder="COMO ESTÁ NO CARTÃO"
                  autoComplete="cc-name"
                  value={cartao.nome}
                  onChange={(e) => setCartao({ ...cartao, nome: maskCardName(e.target.value) })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="validade">Validade</label>
                  <input
                    id="validade"
                    className="input-field"
                    placeholder="MM/AA"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    value={cartao.validade}
                    onChange={(e) => setCartao({ ...cartao, validade: maskExpiry(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    className="input-field"
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={cartao.cvv}
                    onChange={(e) => setCartao({ ...cartao, cvv: maskCvv(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {metodo === 'pix' && (
            <p className="page-subtitle mt-1">
              Ao confirmar, um código Pix seria gerado. (pagamento simulado)
            </p>
          )}
          {metodo === 'boleto' && (
            <p className="page-subtitle mt-1">
              Ao confirmar, um boleto seria gerado. (pagamento simulado)
            </p>
          )}
        </div>

        <aside className="card summary-card" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          {items.map((i) => (
            <div className="summary-line" key={i.id}>
              <span>{i.jogo?.nome || `Jogo #${i.fkJogo}`}</span>
              <span>{formatPrice(i.jogo?.preco)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button className="btn btn-primary" disabled={processing} aria-busy={processing}>
            {processing ? 'Processando...' : `Pagar ${formatPrice(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
