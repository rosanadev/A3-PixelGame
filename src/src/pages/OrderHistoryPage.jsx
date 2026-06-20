import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/api';
import './Pages.css';

function formatPrice(value) {
  return `R$ ${(Number(value) || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleDateString('pt-BR');
}

export default function OrderHistoryPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(!!location.state?.sucesso);

  useEffect(() => {
    orderService
      .getHistory()
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Erro ao carregar suas compras.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Minhas Compras</h1>
      </header>

      {showSuccess && (
        <div className="alert alert-success row-between" role="status">
          <span>Compra realizada com sucesso! 🎉</span>
          <button className="btn btn-ghost" onClick={() => setShowSuccess(false)} aria-label="Fechar">✕</button>
        </div>
      )}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="card" aria-label="Histórico de pedidos">
        <h2>Histórico de pedidos</h2>
        {orders.length === 0 ? (
          <p className="page-subtitle mt-1">Você ainda não realizou compras.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="mt-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Itens</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{formatDate(o.data)}</td>
                    <td>{o.quantidade ?? '—'}</td>
                    <td>{formatPrice(o.valor_total ?? o.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
