import type { Category } from '../data/content';

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/90">
      <div className={`mb-4 h-16 w-16 rounded-3xl bg-gradient-to-br ${category.tone}`} />
      <h3 className="text-lg font-semibold text-white">{category.title}</h3>
      <p className="mt-2 text-sm text-slate-400">{category.subtitle}</p>
    </div>
  );
}
