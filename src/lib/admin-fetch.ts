export async function adminFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminAccessToken");
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    window.postMessage('ADMIN_401', '*');
    throw new Error('Unauthorized');
  }

  return response;
}
