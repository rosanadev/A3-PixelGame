import { Link } from 'react-router-dom';
import './Pages.css';

export default function NotFoundPage() {
  return (
    <div className="container page">
      <div className="empty-state">
        <span className="empty-state-icon" aria-hidden="true">🔍</span>
        <h1 className="page-title">Página não encontrada</h1>
        <p className="page-subtitle">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Link to="/" className="btn btn-primary mt-1">Voltar para a Home</Link>
      </div>
    </div>
  );
}
