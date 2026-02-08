export const fetcher = async (url: string) => {
  const token = localStorage.getItem('spotify_access_token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let res = await fetch(url, { headers });

  // If access token has expired, try refreshing it
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (refreshToken) {
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (refreshRes.ok) {
        // Update access token in localStorage
        const data = await refreshRes.json();
        localStorage.setItem('spotify_access_token', data.access_token);

        // Update refresh token if provided
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }

        // Retry original request with new token
        res = await fetch(url, {
          headers: { ...headers, Authorization: `Bearer ${data.access_token}` },
        });
      } else {
        // If refresh fails, clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/';
      }
    }
  }

  if (!res.ok) throw new Error('Failed to fetch data.');
  return res.json();
};
