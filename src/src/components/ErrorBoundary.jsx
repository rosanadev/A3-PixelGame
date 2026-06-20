import { Component } from 'react';
import '../pages/Pages.css';

// Error boundaries precisam ser componentes de classe.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Em produção, isso poderia ser enviado a um serviço de logs.
    console.error('Erro capturado pelo ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container page">
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">😕</span>
            <h1 className="page-title">Algo deu errado</h1>
            <p className="page-subtitle">
              Ocorreu um erro inesperado. Tente voltar ao início e repetir a ação.
            </p>
            <button className="btn btn-primary mt-1" onClick={this.handleReload}>
              Voltar ao início
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
