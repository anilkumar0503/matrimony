import { useState, useCallback } from 'react';

export function useAdminFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    
    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchWithAuth, loading, error };
}
