const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function login() {
  window.location.href = `${backendUrl}/api/auth/login`;
}

export function logout() {
  localStorage.removeItem('spotify_token');

  window.location.href = `${backendUrl}/api/auth/logout`;
}
