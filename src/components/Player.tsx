import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface PlayerProps {
  audioUrl: string;
  title: string;
  fallbackDuration?: number;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Player({ audioUrl, title, fallbackDuration = 0 }: PlayerProps) {
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(fallbackDuration);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsPlaying(false);
    setProgress(0);

    const howl = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      onload: () => {
        setDuration(howl.duration() || fallbackDuration);
        setIsLoading(false);
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
      },
      onloaderror: () => setIsLoading(false)
    });

    howlRef.current = howl;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      howl.unload();
      howlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useEffect(() => {
    const tick = () => {
      const howl = howlRef.current;
      if (howl && isPlaying) {
        setProgress(howl.seek() as number);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const howl = howlRef.current;
    if (!howl) return;
    if (howl.playing()) {
      howl.pause();
    } else {
      howl.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    howlRef.current?.seek(value);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
    howlRef.current?.volume(value);
  };

  const toggleMute = () => {
    const howl = howlRef.current;
    if (!howl) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    howl.volume(nextMuted ? 0 : volume || 1);
  };

  return (
    <div className="w-full rounded-2xl bg-bg-card/90 border border-primary-light/30 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          className="shrink-0 h-14 w-14 rounded-full bg-accent-red hover:bg-accent-red-dark disabled:opacity-50 text-white grid place-items-center transition-colors"
        >
          {isLoading ? (
            <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-primary">{title}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs tabular-nums text-text-muted w-10 text-right">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              className="range-accent flex-1 h-1.5 accent-accent-red cursor-pointer"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(progress, duration || 0)}
              onChange={handleSeek}
              aria-label="Progresso do episodio"
            />
            <span className="text-xs tabular-nums text-text-muted w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            className="text-text-secondary hover:text-accent-yellow"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            className="range-accent w-20 h-1.5 accent-accent-red cursor-pointer"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
