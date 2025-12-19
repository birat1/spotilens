'use client'

import { Button } from "@/components/ui/button"
import { login } from "@/services/auth";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={login}>Login with Spotify</Button>
    </div>
  );
}
