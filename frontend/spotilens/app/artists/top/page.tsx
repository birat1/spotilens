'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';

export default function TopArtists() {
  const { user, loading: authLoading } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('short_term');

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const res = await fetch(
          `/me/top/artists?time_range=${timeRange}&limit=50`
        );
        if (res.ok) {
          const data = await res.json();
          setArtists(data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch top artists:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchTopArtists();
    }
  }, [authLoading, user, timeRange]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground animate-pulse font-medium">
          Loading top artists...
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

        {/* Artist List */}
        <div className="grid grid-cols-1 gap-4">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center gap-6 bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              {/* Rank Badge */}
              <div className="text-2xl font-black text-muted-foreground/30 min-w-[3rem] text-center">
                {index + 1}
              </div>

              {/* Artist Image */}
              <div className="relative h-26 w-26 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
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
                <a
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-2xl text-foreground truncate hover:text-primary transition-colors"
                >
                  {artist.name}
                </a>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
                  {artist.genres?.[0] || 'Artist'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
