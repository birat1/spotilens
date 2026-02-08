export const fetcher = async (url: string) => {
  const token = localStorage.getItem('spotify_token');

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = new Error('An error occurred while fetching the data.');
    throw err;
  }

  return res.json();
};
