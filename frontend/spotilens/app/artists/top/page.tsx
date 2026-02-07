'use client';

import Image from 'next/image';
import { useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/auth-context';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopArtists() {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('short_term');

  const { data, error, isValidating } = useSWR(
    user ? `/me/top/artists?time_range=${timeRange}&limit=50` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 300000, // 5 minutes
    }
  );

  const artists = data?.items || [];
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
              Top Artists
            </h1>
            <p className="text-muted-foreground text-xs">
              Based on your recent listening habits
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
              Loading top artists...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {isValidating && !isLoading && (
              <div className="absolute top-4 right-8 text-[10px] text-primary animate-pulse uppercase font-bold">
                Loading...
              </div>
            )}

            {artists.map((artist: any, index: number) => (
              <div
                key={artist.id}
                className="flex items-center gap-6 bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
              >
                {/* Rank */}
                <div className="text-2xl font-black text-muted-foreground/30 min-w-[3rem] text-center">
                  {index + 1}
                </div>

                {/* Artist Image */}
                <div className="relative h-26 w-26 flex-shrink-0 overflow-hidden rounded-md shadow-md">
                  {artist.images?.[0]?.url && (
                    <Image
                      src={artist.images[0].url}
                      alt={artist.name}
                      fill
                      unoptimized
                      className="object-cover duration-500 hover:scale-110"
                    />
                  )}
                </div>

                {/* Artist Info */}
                <div className="flex flex-col min-w-0">
                  {/* Artist Name */}
                  <a
                    href={artist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-2xl text-foreground truncate hover:text-primary transition-colors"
                  >
                    {artist.name}
                  </a>

                  {/* Artist Genre */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
                    {artist.genres?.[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
