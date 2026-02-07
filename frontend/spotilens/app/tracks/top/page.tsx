/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import { useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/auth-context';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopTracks() {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('short_term');

  const { data, error, isValidating } = useSWR(
    user
      ? `${BACKEND_URL}/me/top/tracks?time_range=${timeRange}&limit=50`
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 300000, // 5 minutes
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-extrabold tracking-tighter uppercase text-foreground">
              Top Tracks
            </h1>
            <p className="text-muted-foreground text-xs">
              Your most played tracks
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-card border text-foreground text-sm rounded-lg block p-2.5 outline-none transition-all cursor-pointer"
            >
              <option value="short_term">Last 4 Weeks</option>
              <option value="medium_term">Last 6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="text-muted-foreground animate-pulse">
              Loading top tracks...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {isValidating && !isLoading && (
              <div className="absolute top-4 right-8 text-[10px] text-primary animate-pulse uppercase font-bold">
                Loading...
              </div>
            )}

            {tracks.map((track: any, index: number) => (
              <div
                key={track.id}
                className="flex items-center gap-6 bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
              >
                {/* Rank */}
                <div className="text-2xl font-black text-muted-foreground/30 min-w-[3rem] text-center">
                  {index + 1}
                </div>

                {/* Album Image */}
                <div className="relative h-26 w-26 flex-shrink-0 overflow-hidden rounded-md shadow-md">
                  {track.album.images?.[0]?.url && (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.name}
                      fill
                      unoptimized
                      className="object-cover duration-500 hover:scale-110"
                    />
                  )}
                </div>

                {/* Track Info */}
                <div className="flex flex-col min-w-0">
                  {/* Track Name */}
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-lg text-foreground truncate hover:text-primary transition-colors"
                  >
                    {track.name}
                  </a>

                  {/* Track Artist(s) */}
                  <div className="text-xs font-semibold text-muted-foreground truncate flex gap-1">
                    {track.artists?.map((artist: any, index: number) => (
                      <span key={artist.id}>
                        <a
                          href={artist.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {artist.name}
                        </a>
                        {index < track.artists.length - 1 && ','}
                      </span>
                    ))}
                  </div>

                  {/* Album Name */}
                  <a
                    href={track.album.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground/80 truncate hover:text-primary transition-colors mt-2"
                  >
                    {track.album.name}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
