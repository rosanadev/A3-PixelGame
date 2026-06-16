import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import './Pages.css';

const REVIEWS_PER_PAGE = 10;

function Stars({ value }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="stars" aria-label={`Nota ${value} de 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { page, setPage, totalPages, pageItems } = usePagination(reviews, REVIEWS_PER_PAGE);

  useEffect(() => {
    reviewService
      .getAll()
      // 204 = ainda não há avaliações cadastradas
      .then((r) => setReviews(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (err.response?.status === 204) setReviews([]);
        else setError('Erro ao carregar as avaliações.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Avaliações da comunidade</h1>
          <p className="page-subtitle">Veja o que os jogadores estão dizendo.</p>
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {reviews.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">★</span>
          <p>Ainda não há avaliações cadastradas.</p>
        </div>
      ) : (
        <>
          <section className="card" aria-label="Lista de avaliações">
            {pageItems.map((av, idx) => {
              const jogoNome = av.jogo?.nome || av.jogoNome || av.nomeJogo;
              const jogoId = av.jogo?.id ?? av.fkJogo ?? av.jogoId;
              const autor = av.usuario?.nome || av.usuarioNome || av.autor || 'Anônimo';
              return (
                <div className="review" key={av.id ?? idx}>
                  <div className="review-head">
                    <div>
                      <Stars value={av.nota} />
                      {jogoNome && (
                        <span className="item-meta" style={{ marginLeft: '0.5rem' }}>
                          {jogoId ? (
                            <Link to={`/games/${jogoId}`}>{jogoNome}</Link>
                          ) : (
                            jogoNome
                          )}
                        </span>
                      )}
                    </div>
                    <span className="item-meta">{autor}</span>
                  </div>
                  <p>{av.comentario || <em>(sem comentário)</em>}</p>
                </div>
              );
            })}
          </section>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
