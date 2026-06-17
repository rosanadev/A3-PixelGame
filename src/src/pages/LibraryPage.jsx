import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { userService } from '../services/api';
import './Pages.css';

function formatPrice(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Grátis' : `R$ ${n.toFixed(2)}`;
}

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getMyGames()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      // 204 = usuário ainda não comprou jogos
      .catch((err) => {
        if (err.response?.status === 204) setItems([]);
        else setError('Erro ao carregar sua biblioteca.');
      })
      .finally(() => setLoading(false));
  }, []);

  function copyKey(chave) {
    if (!chave) return;
    navigator.clipboard?.writeText(chave)
      .then(() => toast.success('Chave copiada!'))
      .catch(() => toast.error('Não foi possível copiar.'));
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Minha Biblioteca</h1>
          <p className="page-subtitle">Seus jogos comprados e as chaves de ativação.</p>
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">🎮</span>
          <p>Você ainda não comprou nenhum jogo.</p>
          <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
        </div>
      ) : (
        <div className="item-list">
          {items.map((item, idx) => {
            const jogo = item.jogo || {};
            const chave = item.chaveAtivacao;
            return (
              <div className="card item-row" key={jogo.id ?? idx}>
                <div className="item-thumb" aria-hidden="true">🎮</div>
                <div className="item-info">
                  <div className="item-title">
                    {jogo.id ? (
                      <Link to={`/games/${jogo.id}`}>{jogo.nome}</Link>
                    ) : (
                      jogo.nome || 'Jogo'
                    )}
                  </div>
                  <div className="item-meta">
                    {chave ? (
                      <>Chave de ativação: <code className="activation-key">{chave}</code></>
                    ) : (
                      <span className="badge badge-purple">Ativação pendente</span>
                    )}
                  </div>
                </div>
                <span className="item-price">{formatPrice(jogo.preco)}</span>
                {chave && (
                  <button
                    className="btn btn-outline"
                    onClick={() => copyKey(chave)}
                    aria-label={`Copiar chave de ${jogo.nome}`}
                  >
                    Copiar chave
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
