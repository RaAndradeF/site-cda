import type { APIRoute } from 'astro';
import { fetchPodcastFeed } from '../lib/fetchRss';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const feed = await fetchPodcastFeed();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const siteUrl = `${site?.toString().replace(/\/$/, '') ?? ''}${base}`;

  const items = feed.episodes
    .map(
      (episode) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description)}</description>
      <link>${siteUrl}/podcast/${episode.slug}</link>
      <guid isPermaLink="false">${escapeXml(episode.guid)}</guid>
      <pubDate>${episode.pubDate.toUTCString()}</pubDate>
      <enclosure url="${escapeXml(episode.audioUrl)}" type="audio/mpeg" />
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(feed.channel.title)}</title>
    <description>${escapeXml(feed.channel.description)}</description>
    <link>${siteUrl}</link>
    <language>${escapeXml(feed.channel.language)}</language>
    <author>${escapeXml(feed.channel.author)}</author>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
