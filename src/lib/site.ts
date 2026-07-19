// Prefixa um caminho absoluto com o base path configurado em astro.config.mjs
// (necessario porque o site e servido em /site-cda no GitHub Pages).
// URLs externas (http/https, mailto, #, etc.) sao retornadas sem alteracao.
export function withBase(path: string): string {
  if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL ?? '/';
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

// Links confirmados a partir do feed RSS real. Os marcados como placeholder
// devem ser substituidos pelos links reais quando disponiveis (ver MANUAL.md).
export const SITE_LINKS = {
  spotify: 'https://open.spotify.com/show/7DzN9JRFS29LV6HlB1PeYc?si=a7419f4553654433',
  rss: withBase('/rss.xml'),
  email: 'companhiadoaventureiro@gmail.com',
  instagram: 'https://instagram.com/companhiadoaventureiro',
  // placeholders: substituir pelos links reais das plataformas
  applePodcasts: 'https://podcasts.apple.com/us/podcast/companhia-do-aventureiro/id1514517061',
  googlePodcasts: '#',
  deezer: 'https://www.deezer.com/br/show/1695012',
  pocketCasts: 'https://pca.st/podcast/7533d1f0-7d25-0138-ee02-0acc26574db2',
  youtube: 'https://www.youtube.com/@companhiadoaventureiro',
  loja: '#'
};

export const SITE_NAME = 'Companhia do Aventureiro';
export const SITE_TAGLINE =
  'RPG, Magic, jogos de tabuleiro, jogos eletrônicos, filmes, séries e cultura nerd — direto da taberna.';
