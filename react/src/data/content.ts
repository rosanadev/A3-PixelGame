export type Category = {
  title: string;
  subtitle: string;
  tone: string;
};

export type Favorite = {
  title: string;
  platform: string;
  badge: string;
  accent: string;
};

export const categories: Category[] = [
  { title: 'Ação', subtitle: 'Gameplay intenso', tone: 'from-cyan-400 to-blue-600' },
  { title: 'Aventura', subtitle: 'Mundos abertos', tone: 'from-violet-500 to-fuchsia-500' },
  { title: 'RPG', subtitle: 'Histórias profundas', tone: 'from-emerald-400 to-teal-500' },
  { title: 'Corrida', subtitle: 'Velocidade pura', tone: 'from-orange-400 to-amber-500' },
  { title: 'Simulação', subtitle: 'Realismo avançado', tone: 'from-slate-400 to-slate-600' },
  { title: 'Esportes', subtitle: 'Desafios ao vivo', tone: 'from-blue-400 to-cyan-500' }
];

export const favorites: Favorite[] = [
  { title: 'Forza Horizon', platform: 'Xbox Series X', badge: 'Top', accent: 'bg-emerald-500/15 text-emerald-300' },
  { title: 'Halo Infinite', platform: 'Xbox Cloud', badge: 'New', accent: 'bg-cyan-500/15 text-cyan-300' },
  { title: 'Sea of Thieves', platform: 'Xbox Cloud', badge: 'Popular', accent: 'bg-violet-500/15 text-violet-300' }
];
