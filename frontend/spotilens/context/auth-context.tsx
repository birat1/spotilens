'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserProfile {
  display_name: string;
  images: { url: string }[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/me/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        // If user is not authenticated and is trying to access a protected route, redirect to home
        if (!data && pathname != '/') {
          router.push('/');
        }
      })
      .catch(() => {
        setUser(null);
        if (pathname != '/') router.push('/');
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
