import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { reportService } from '../services/api';
import './Pages.css';

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportService
      .jogosMaisVendidos()
      // 204 = sem dados suficientes
      .then((r) => setData(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (err.response?.status === 204) setData([]);
        else setError('Erro ao carregar o relatório.');
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = data.map((d) => ({
    nome: d.nome,
    empresa: d.empresa,
    total: Number(d.total) || 0,
  }));

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="container page">
      <header className="page-header">
        <h1 className="page-title">Jogos mais vendidos</h1>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {chartData.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">📊</span>
          <p>Ainda não há dados de vendas suficientes para gerar o relatório.</p>
        </div>
      ) : (
        <>
          <section className="card" aria-label="Gráfico de vendas">
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a50" />
                  <XAxis dataKey="nome" stroke="#a0a0c0" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} stroke="#a0a0c0" />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a35',
                      border: '1px solid #2a2a50',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(123,45,255,0.1)' }}
                  />
                  <Bar dataKey="total" name="Vendas" fill="#7b2dff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card mt-1" aria-label="Tabela de vendas">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jogo</th>
                    <th>Empresa</th>
                    <th>Vendas</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => (
                    <tr key={`${d.nome}-${i}`}>
                      <td>{i + 1}</td>
                      <td>{d.nome}</td>
                      <td>{d.empresa || '—'}</td>
                      <td>{d.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
