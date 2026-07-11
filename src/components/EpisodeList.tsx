import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { Clock, Calendar } from 'lucide-react';
import SearchBar from './SearchBar';
import { withBase } from '../lib/site';

export interface EpisodeListItem {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  image: string;
  tags: string[];
}

interface EpisodeListProps {
  episodes: EpisodeListItem[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

export default function EpisodeList({ episodes }: EpisodeListProps) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(episodes, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.35,
        ignoreLocation: true
      }),
    [episodes]
  );

  const results = useMemo(() => {
    if (!query.trim()) return episodes;
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse, episodes]);

  return (
    <div>
      <div className="max-w-xl mx-auto mb-10">
        <SearchBar onSearch={setQuery} />
      </div>

      {results.length === 0 ? (
        <p className="text-center text-text-secondary py-16">
          Nenhum episodio encontrado para &quot;{query}&quot;.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((episode) => (
            <a
              key={episode.slug}
              href={withBase(`/podcast/${episode.slug}`)}
              className="group flex flex-col rounded-2xl bg-bg-card/80 border border-primary-light/30 overflow-hidden hover:border-accent-yellow transition-colors"
            >
              {episode.image && (
                <img
                  src={episode.image}
                  alt={episode.title}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold text-text-primary group-hover:text-accent-yellow transition-colors line-clamp-2">
                  {episode.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary line-clamp-3 flex-1">
                  {episode.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} />
                    {dateFormatter.format(new Date(episode.pubDate))}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    {episode.duration}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
