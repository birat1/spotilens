/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import useSWR from 'swr';

import { useAuth } from '@/context/auth-context';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RecentTracks() {
  const { user, loading: authLoading } = useAuth();

  const { data, error, isValidating } = useSWR(
    user ? `/me/recently-played?limit=50` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 30000, // 30 seconds
    }
  );

  const tracks = data?.items || [];
  const isLoading = !data && !error;

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground animate-pulse font-medium">
          Authenticating...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase text-foreground">
            Recently Played Tracks
          </h1>
          <p className="text-muted-foreground text-xs">
            Your listening history (last 50 tracks)
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="text-muted-foreground animate-pulse">
              Loading history...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-10 gap-y-10">
            {isValidating && !isLoading && (
              <div className="absolute top-4 right-8 text-[10px] text-primary animate-pulse uppercase font-bold">
                Loading...
              </div>
            )}

            {tracks.map((item: any) => {
              const { track } = item;
              const playedAt = new Date(item.played_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const albumImage = track.album_art_url;
              const trackUrl = track.id
                ? `https://open.spotify.com/track/${track.id}`
                : null;
              const artistNames = track.artist_name?.split(', ') ?? [];

              return (
                <div
                  key={`${track.id}-${item.played_at}`}
                  className="group flex flex-col"
                >
                  {/* Album Image */}
                  <div className="relative aspect-square w-full mb-3">
                    {trackUrl ? (
                      <a
                        href={trackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all"
                      >
                        {albumImage && (
                          <Image
                            src={albumImage}
                            alt={track.name}
                            fill
                            unoptimized
                            className="object-cover hover:scale-105 hover:opacity-80 transition-all duration-500 cursor-pointer"
                          />
                        )}
                      </a>
                    ) : (
                      <div className="absolute inset-0 rounded-md overflow-hidden shadow-sm">
                        {albumImage && (
                        <Image
                          src={albumImage}
                          alt={track.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex flex-col min-w-0 space-y-1 text-center">
                    {/* Track Name */}
                    {trackUrl ? (
                      <a
                        href={trackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors block"
                      >
                        {track.name}
                      </a>
                    ) : (
                      <span className="font-bold text-sm text-foreground truncate block">
                        {track.name}
                      </span>
                    )}

                    {/* Track Artist(s) */}
                    <div className="text-xs font-medium text-muted-foreground truncate">
                      {artistNames.join(', ')}
                    </div>

                    {/* Played At */}
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">
                      {playedAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
