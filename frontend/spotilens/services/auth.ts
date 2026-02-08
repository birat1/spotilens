export async function login() {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  window.location.href = `${backendUrl}/api/auth/login`;
}

export function logout() {
  localStorage.removeItem('spotify_token');
  window.location.href = '/';
}
