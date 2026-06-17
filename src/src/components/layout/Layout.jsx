import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <Navbar />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} PixelGame — Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
