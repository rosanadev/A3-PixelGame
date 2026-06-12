import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/api';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import './HomePage.css';
import './Pages.css';

const GAMES_PER_PAGE = 12;

function formatPrice(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Grátis' : `R$ ${n.toFixed(2)}`;
}

export default function CatalogPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    publicService
      .getJogos()
      .then((r) => setGames(r.data?.games || r.data || []))
      .catch(() => setError('Erro ao carregar o catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => (g.nome || g.titulo || '').toLowerCase().includes(q));
  }, [games, search]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, GAMES_PER_PAGE);

  const filterKey = search.trim();
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) {
    setPrevKey(filterKey);
    setPage(1);
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Catálogo público</h1>
          <p className="page-subtitle">Explore nossos jogos sem precisar de login.</p>
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: 240 }}>
          <label htmlFor="catalog-search" className="sr-only">Buscar jogo</label>
          <input
            id="catalog-search"
            type="search"
            className="input-field"
            placeholder="Buscar jogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar jogo no catálogo"
          />
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">🎮</span>
          <p>Nenhum jogo encontrado no catálogo.</p>
        </div>
      ) : (
        <>
          <section aria-label="Lista de jogos do catálogo">
            <div className="games-grid">
              {pageItems.map((game) => {
                const title = game.nome || game.titulo || 'Sem título';
                const category = game.categoria?.nome || game.categoria || '';
                return (
                  <article className="game-card card" key={game.id} aria-label={`Jogo: ${title}`}>
                    <div className="game-card-img" aria-hidden="true">
                      {game.imagem || game.image ? (
                        <img src={game.imagem || game.image} alt={`Capa do jogo ${title}`} loading="lazy" />
                      ) : (
                        <div className="game-card-placeholder">🎮</div>
                      )}
                    </div>
                    <div className="game-card-body">
                      <div className="game-card-tags">
                        {category && <span className="badge badge-purple">{category}</span>}
                      </div>
                      <h2 className="game-card-title">{title}</h2>
                      <div className="game-card-footer">
                        <span className="game-card-price">{formatPrice(game.preco)}</span>
                        <Link
                          to={`/games/${game.id}`}
                          className="btn btn-outline game-card-btn"
                          aria-label={`Ver detalhes de ${title}`}
                        >
                          Ver mais
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
