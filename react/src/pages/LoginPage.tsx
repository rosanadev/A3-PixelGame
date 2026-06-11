import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">Login</p>
            <h1 className="text-4xl font-semibold text-white">Bem-vindo de volta ao Xbox Cloud</h1>
            <p className="max-w-xl text-slate-400">
              Faça login para acessar as suas recomendações, jogos salvos e continuar de onde parou. Tudo em uma experiência simples e otimizada.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Conta</p>
              <p className="mt-3 text-2xl font-semibold text-white">PixelGame</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
              <p className="mt-3 text-2xl font-semibold text-white">Online</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6">
            <p className="text-sm font-semibold text-cyan-200">Dica</p>
            <p className="mt-3 text-slate-300">
              Use o botão para acessar e descubra como a navegação rápida melhora sua experiência com o catálogo de jogos.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] bg-slate-900/80 p-8">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-200">
              Endereço de e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nome@exemplo.com"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-200">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>

          <button className="w-full rounded-full bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Entrar agora
          </button>

          <p className="text-center text-sm text-slate-400">
            Não tem conta?{' '}
            <Link to="/" className="font-semibold text-white hover:text-cyan-300">
              Voltar para a home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
