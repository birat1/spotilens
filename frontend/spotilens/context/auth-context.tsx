'use client';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('access_token');

    if (tokenFromUrl) {
      localStorage.setItem('spotify_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('spotify_token');

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('spotify_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
