import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService, gameService } from '../services/api';
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
    let ativo = true;
    reviewService
      .getMine()
      .then(async (r) => {
        const lista = Array.isArray(r.data) ? r.data : [];
        // Cada avaliação traz apenas o fkJogo; buscamos o nome do jogo
        // (mesmo padrão usado no carrinho).
        const detalhadas = await Promise.all(
          lista.map(async (av) => {
            try {
              const { data: jogo } = await gameService.getById(av.fkJogo);
              return { ...av, jogoNome: jogo?.nome };
            } catch {
              return av;
            }
          }),
        );
        if (ativo) setReviews(detalhadas);
      })
      // 204 = usuário ainda não avaliou nenhum jogo
      .catch((err) => {
        if (err.response?.status === 204) {
          if (ativo) setReviews([]);
        } else if (ativo) {
          setError('Erro ao carregar suas avaliações.');
        }
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Minhas avaliações</h1>
          <p className="page-subtitle">As notas e comentários que você publicou.</p>
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {reviews.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">★</span>
          <p>Você ainda não avaliou nenhum jogo.</p>
          <Link to="/" className="btn btn-primary mt-1">Explorar jogos</Link>
        </div>
      ) : (
        <>
          <section className="card" aria-label="Lista das minhas avaliações">
            {pageItems.map((av, idx) => {
              const jogoId = av.fkJogo;
              const jogoNome = av.jogoNome || (jogoId ? `Jogo #${jogoId}` : 'Jogo');
              return (
                <div className="review" key={av.id ?? idx}>
                  <div className="review-head">
                    <div>
                      <Stars value={av.nota} />
                      <span className="item-meta" style={{ marginLeft: '0.5rem' }}>
                        {jogoId ? (
                          <Link to={`/games/${jogoId}`}>{jogoNome}</Link>
                        ) : (
                          jogoNome
                        )}
                      </span>
                    </div>
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
