import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold text-white">
            Xbox Cloud
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <Link to="/login" className="rounded-full border border-slate-500 px-4 py-2 transition hover:border-white hover:text-white">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
