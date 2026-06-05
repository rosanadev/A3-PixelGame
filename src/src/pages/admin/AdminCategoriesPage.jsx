import { useState, useEffect } from 'react';
import { categoryService } from '../../services/api';
import '../Pages.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService
      .getAll()
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Erro ao carregar as categorias.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Categorias</h1>
      </header>

      {/* A API expõe apenas leitura para categorias (GET /categorias). */}
      <div className="alert alert-info" role="note">
        A API atual permite apenas a consulta de categorias. Criação e edição não
        estão disponíveis neste endpoint.
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="card" aria-label="Lista de categorias">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <p className="page-subtitle">Nenhuma categoria cadastrada.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
