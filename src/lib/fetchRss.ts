import { parseStringPromise } from 'xml2js';

const RSS_FEED_URL = 'https://anchor.fm/s/1ec0a0f8/podcast/rss';

export interface PodcastEpisode {
  guid: string;
  slug: string;
  title: string;
  description: string;
  descriptionHtml: string;
  pubDate: Date;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  image: string;
  link: string;
}

export interface PodcastChannel {
  title: string;
  description: string;
  link: string;
  image: string;
  author: string;
  language: string;
}

export interface PodcastFeed {
  channel: PodcastChannel;
  episodes: PodcastEpisode[];
}

let cachedFeed: PodcastFeed | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function durationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

function secondsToDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function normalizeDuration(raw: string | undefined): { duration: string; seconds: number } {
  if (!raw) return { duration: '00:00', seconds: 0 };
  if (raw.includes(':')) {
    return { duration: raw, seconds: durationToSeconds(raw) };
  }
  const seconds = Number(raw);
  if (Number.isNaN(seconds)) return { duration: '00:00', seconds: 0 };
  return { duration: secondsToDuration(seconds), seconds };
}

function firstText(value: unknown): string {
  if (Array.isArray(value)) return firstText(value[0]);
  if (value && typeof value === 'object' && '_' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)._ ?? '');
  }
  return typeof value === 'string' ? value : '';
}

export async function fetchPodcastFeed(): Promise<PodcastFeed> {
  const now = Date.now();
  if (cachedFeed && now - cachedAt < CACHE_TTL_MS) {
    return cachedFeed;
  }

  const response = await fetch(RSS_FEED_URL);
  if (!response.ok) {
    throw new Error(`Falha ao buscar feed RSS: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parsed = await parseStringPromise(xml, { explicitArray: true, trim: true });
  const channel = parsed?.rss?.channel?.[0];

  if (!channel) {
    throw new Error('Feed RSS invalido: canal nao encontrado');
  }

  const channelInfo: PodcastChannel = {
    title: firstText(channel.title),
    description: firstText(channel.description),
    link: firstText(channel.link),
    image: channel['itunes:image']?.[0]?.$?.href ?? '',
    author: firstText(channel.author) || firstText(channel['itunes:author']),
    language: firstText(channel.language) || 'pt-br'
  };

  const items: any[] = channel.item ?? [];
  const usedSlugs = new Set<string>();

  const episodes: PodcastEpisode[] = items.map((item) => {
    const title = firstText(item.title);
    const guid = firstText(item.guid) || firstText(item.link) || title;
    const descriptionHtml = firstText(item.description) || firstText(item['itunes:summary']);
    const enclosure = item.enclosure?.[0]?.$;
    const { duration, seconds } = normalizeDuration(firstText(item['itunes:duration']));

    let baseSlug = slugify(title) || slugify(guid);
    let slug = baseSlug;
    let i = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${i}`;
      i += 1;
    }
    usedSlugs.add(slug);

    return {
      guid,
      slug,
      title,
      description: stripHtml(descriptionHtml),
      descriptionHtml,
      pubDate: new Date(firstText(item.pubDate)),
      audioUrl: enclosure?.url ?? '',
      duration,
      durationSeconds: seconds,
      image: item['itunes:image']?.[0]?.$?.href ?? channelInfo.image,
      link: firstText(item.link)
    };
  });

  episodes.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  cachedFeed = { channel: channelInfo, episodes };
  cachedAt = now;
  return cachedFeed;
}

export async function fetchEpisodeBySlug(slug: string): Promise<PodcastEpisode | undefined> {
  const feed = await fetchPodcastFeed();
  return feed.episodes.find((episode) => episode.slug === slug);
}
