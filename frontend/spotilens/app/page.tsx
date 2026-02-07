'use client';

import Image from 'next/image';

import { NowPlaying } from '@/components/now-playing';
import { Button } from '@/components/ui/button';
import { NavigationCard } from '@/components/ui/NavigationCard';
import { useAuth } from '@/context/auth-context';
import { login } from '@/services/auth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">Loading...</div>
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-6 min-h-0 pt-[5vh]">
      {user ? (
        <>
          {/* User Info */}
          <div className="flex flex-row items-center gap-6">
            {user.images?.[0]?.url && (
              <Image
                src={user.images[0].url}
                alt={user.display_name}
                width={200}
                height={200}
                unoptimized
                priority
                className="aspect-square rounded-full object-cover shadow-2xl"
              />
            )}

            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-muted-foreground">
                Welcome,
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight">
                {user.display_name}
              </h1>
            </div>
          </div>

          {/* Now Playing */}
          <NowPlaying />

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl px-4 mt-4">
            <NavigationCard
              href="/artists/top"
              title="Top Artists"
              description="Discover your most listened to artists."
            />
            <NavigationCard
              href="/tracks/top"
              title="Top Tracks"
              description="See your all-time favorite songs."
            />
            <NavigationCard
              href="/tracks/recent"
              title="Recently Played"
              description="Check out your recently played tracks."
            />
          </div>
        </>
      ) : (
        // Logged out state
        <Button onClick={login} className="bg-green-600 hover:bg-green-700">
          Login with Spotify
        </Button>
      )}
    </div>
  );
}
