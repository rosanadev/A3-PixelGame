import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import FavoriteCard from '../components/FavoriteCard';
import SectionHeading from '../components/SectionHeading';
import { categories, favorites } from '../data/content';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%)] pb-16 pt-10 sm:pb-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
                Landing page Xbox Cloud
              </span>
              <div className="space-y-5">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Conecte jogos, amigos e comunidade no Xbox Cloud.
                </h1>
                <p className="max-w-2xl text-slate-300">
                  Descubra novos títulos, acesse experiências imediatas e prepare sua sessão com uma UI moderna inspirada no design Xbox.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Fazer login
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-100 transition hover:border-cyan-400/40"
                >
                  Ver categorias
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft backdrop-blur-xl">
              <div className="flex flex-col gap-5">
                <div className="rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-violet-500/20 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/90">Xbox Cloud</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Jogos em nuvem para todos</h2>
                  <p className="mt-4 text-sm text-slate-300">
                    Acesse os seus títulos favoritos instantaneamente, sem instalar e sem limites.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-400">Tempo de carregamento</p>
                    <p className="mt-3 text-3xl font-semibold text-white">0.8s</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-400">Mais de</p>
                    <p className="mt-3 text-3xl font-semibold text-white">300+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="Categorias"
          title="Encontre seu próximo jogo favorito"
          description="Explore temas, estilos e experiências selecionadas para a comunidade Xbox Cloud."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.title} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="rounded-4xl border border-white/10 bg-slate-900/70 p-8">
            <SectionHeading
              eyebrow="Favoritos"
              title="Principais jogos da comunidade"
              description="Veja os títulos em destaque e prepare sua sessão com recomendações de jogos populares no Xbox Cloud."
            />
            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <p className="text-sm text-slate-400">Experiência multiplataforma pronta para o seu controle.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase text-slate-500">Conectividade</p>
                  <p className="mt-3 text-xl font-semibold text-white">99.9%</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase text-slate-500">Tempo de jogo</p>
                  <p className="mt-3 text-xl font-semibold text-white">24/7</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {favorites.map((favorite) => (
              <FavoriteCard key={favorite.title} favorite={favorite} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
