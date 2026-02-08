/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { MarqueeWrapper } from '@/components/utils/MarqueeWrapper';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function NowPlaying() {
  const [playback, setPlayback] = useState<any>(null);

  // Fetch currently playing track
  const fetchCurrentTrack = useCallback(async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;

      const res = await fetch(
        `${BACKEND_URL}/api/me/player/currently-playing`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          setPlayback(data);
        } else {
          setPlayback(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch currently playing track:', err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentTrack();
    const interval = setInterval(() => {
      const token = localStorage.getItem('spotify_token');
      if (token) fetchCurrentTrack();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchCurrentTrack]);

  if (!playback || !playback.item) return null;

  return (
    /* Now Playing Card */
    <div className="w-full max-w-2xl bg-card border rounded-xl p-6 shadow-sm">
      <h2 className="text-sm font-medium mb-4 text-green-500 animate-pulse uppercase tracking-wider">
        Currently Playing
      </h2>

      {/* Track Info */}
      <div className="flex items-center gap-4">
        {/* Album Art */}
        <a
          href={playback.item.album.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image
            src={playback.item.album.images[0].url}
            alt={playback.item.name}
            width={160}
            height={160}
            unoptimized
            className="rounded-md shadow-md"
          />
        </a>

        {/* Track Name & Artists */}
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <MarqueeWrapper>
            <a
              href={playback.item.external_urls.spotify}
              target="_blank"
              className="text-lg font-bold hover:text-primary underline-offset-2"
            >
              {playback.item.name}
            </a>
          </MarqueeWrapper>

          <MarqueeWrapper>
            <div className="text-sm text-muted-foreground">
              {playback.item.artists.map((artist: any, i: number) => (
                <span key={artist.id}>
                  <a
                    href={artist.external_urls.spotify}
                    target="_blank"
                    className="hover:text-primary underline-offset-2"
                  >
                    {artist.name}
                  </a>
                  {i < playback.item.artists.length - 1 && ', '}
                </span>
              ))}
            </div>
          </MarqueeWrapper>
        </div>
      </div>
    </div>
  );
}
