'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export function SiteHeader() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 w-full items-center px-8">
          <Link href="/" className="font-bold text-lg">
            Spotilens
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 w-full max-w-full items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            Spotilens
          </Link>
        </div>

        <div className="flex items-center">
          <a href="/auth/logout">
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
