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
    const fetchProfile = async (token: string) => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          localStorage.removeItem('spotify_access_token');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('access_token');

    if (tokenFromUrl) {
      localStorage.setItem('spotify_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);

      fetchProfile(accessToken);
    } else {
      const existingToken = localStorage.getItem('spotify_access_token');
      if (existingToken) {
        fetchProfile(existingToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
