import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  gameService,
  cartService,
  wishlistService,
  reviewService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartPlusIcon from '../components/icons/CartPlusIcon';
import './Pages.css';

function formatPrice(value) {
  const n = Number(value) || 0;
  return n === 0 ? 'Grátis' : `R$ ${n.toFixed(2)}`;
}

function Stars({ value }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="stars" aria-label={`Nota ${value} de 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

export default function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState({ media: 0, total: 0, lista: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [buying, setBuying] = useState(false);

  // Formulário de avaliação
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);

  const loadReviews = useCallback(() => {
    reviewService
      .getMedia(id)
      .then((r) =>
        setReviews({
          media: r.data?.media ?? 0,
          total: r.data?.totalAvaliacoes ?? 0,
          lista: r.data?.avaliacoes ?? [],
        }),
      )
      // 204 = jogo ainda sem avaliações
      .catch(() => setReviews({ media: 0, total: 0, lista: [] }));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError('');
    gameService
      .getById(id)
      .then((r) => {
        if (!r.data || !r.data.id) {
          setError('Jogo não encontrado.');
          return;
        }
        setGame(r.data);
      })
      .catch(() => setError('Erro ao carregar o jogo.'))
      .finally(() => setLoading(false));
    loadReviews();
  }, [id, loadReviews]);

  function requireAuth() {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  }

  async function handleAddToCart() {
    if (!requireAuth()) return;
    try {
      await cartService.addItem(game.id);
      refreshCart();
      toast.success(`${game.nome} adicionado ao carrinho!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar ao carrinho.');
    }
  }

  async function handleBuyNow() {
    if (!requireAuth()) return;
    setFeedback('');
    setBuying(true);
    try {
      await cartService.addItem(game.id);
      refreshCart();
      navigate('/checkout');
    } catch (err) {
      // Se o jogo já está no carrinho, isso não é um erro para "Comprar agora":
      // o objetivo já foi atingido, então seguimos para o checkout.
      try {
        const { data } = await cartService.get();
        const noCarrinho = (data?.carrinho?.itens || []).some((i) => i.fkJogo === game.id);
        if (noCarrinho) {
          navigate('/checkout');
          return;
        }
      } catch {
        /* ignora: cai no erro abaixo */
      }
      toast.error(err.response?.data?.message || 'Não foi possível iniciar a compra.');
      setBuying(false);
    }
  }

  async function handleAddToWishlist() {
    if (!requireAuth()) return;
    setFeedback('');
    try {
      await wishlistService.add(game.id);
      setFeedback('Jogo adicionado à lista de desejos!');
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Jogo já está na lista de desejos.');
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!requireAuth()) return;
    setSending(true);
    setFeedback('');
    try {
      await reviewService.create(game.id, Number(nota), comentario);
      setComentario('');
      setFeedback('Avaliação enviada! Obrigado.');
      loadReviews();
    } catch (err) {
      // Se o usuário já avaliou, a API retorna 400 — tenta atualizar.
      if (err.response?.status === 400) {
        try {
          await reviewService.update(game.id, Number(nota), comentario);
          setComentario('');
          setFeedback('Avaliação atualizada!');
          loadReviews();
          return;
        } catch {
          /* cai no erro abaixo */
        }
      }
      setFeedback(err.response?.data?.message || 'Não foi possível enviar a avaliação.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div className="container page">
        <div className="alert alert-error" role="alert">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Voltar à loja</button>
      </div>
    );
  }

  return (
    <div className="container page">
      <article className="detail-grid">
        <div className="detail-cover" aria-hidden="true">
          {game.imagem ? <img src={game.imagem} alt={`Capa de ${game.nome}`} /> : '🎮'}
        </div>

        <div>
          <h1 className="page-title">{game.nome}</h1>
          <p className="page-subtitle">
            {game.ano ? `Lançamento: ${game.ano}` : 'Ano não informado'}
          </p>

          <div className="row-between mt-1">
            <span>
              <Stars value={reviews.media} />{' '}
              {reviews.media ? `${reviews.media} (${reviews.total})` : 'Sem avaliações'}
            </span>
          </div>

          <p className="detail-price">{formatPrice(game.preco)}</p>
          {game.desconto > 0 && <span className="badge badge-purple">{game.desconto}% OFF</span>}

          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={handleBuyNow}
              disabled={buying}
              aria-busy={buying}
            >
              {buying ? 'Processando...' : '⚡ Comprar agora'}
            </button>
            <button className="btn btn-outline" onClick={handleAddToCart}><CartPlusIcon size={18} /> Adicionar ao carrinho</button>
            <button className="btn btn-outline" onClick={handleAddToWishlist}>♡ Lista de desejos</button>
          </div>

          {feedback && <div className="alert alert-info" role="status" aria-live="polite">{feedback}</div>}

          <h2 className="mt-1">Sobre o jogo</h2>
          <p className="page-subtitle">{game.descricao || 'Sem descrição disponível.'}</p>
        </div>
      </article>

      {/* Avaliações */}
      <section className="card mt-1" aria-label="Avaliações">
        <h2>Avaliações ({reviews.total})</h2>

        <form onSubmit={handleReviewSubmit} className="mt-1">
          <div className="form-row">
            <div className="form-group" style={{ flex: '0 0 120px' }}>
              <label htmlFor="nota">Sua nota</label>
              <select id="nota" className="input-field" value={nota} onChange={(e) => setNota(e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comentario">Comentário</label>
              <input
                id="comentario"
                className="input-field"
                placeholder="O que achou do jogo?"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={sending} aria-busy={sending}>
            {sending ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>

        <div className="mt-1">
          {reviews.lista.length === 0 ? (
            <p className="page-subtitle">Seja o primeiro a avaliar este jogo.</p>
          ) : (
            reviews.lista.map((av) => (
              <div className="review" key={av.id}>
                <div className="review-head">
                  <Stars value={av.nota} />
                </div>
                <p>{av.comentario || <em>(sem comentário)</em>}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
