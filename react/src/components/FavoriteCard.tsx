import type { Favorite } from '../data/content';

type FavoriteCardProps = {
  favorite: Favorite;
};

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{favorite.title}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${favorite.accent}`}>{favorite.badge}</span>
      </div>
      <p className="text-sm text-slate-300">{favorite.platform}</p>
      <div className="mt-5 h-32 rounded-3xl bg-gradient-to-br from-white/5 to-white/0" />
    </article>
  );
}
