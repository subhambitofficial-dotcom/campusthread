const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Safe checking for local storage (Next.js SSR support)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('campusthread_token');
  }
  return null;
};

export const api = {
  // Save credentials on login/register
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusthread_token', token);
    }
  },

  // Clear credentials on logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusthread_token');
      localStorage.removeItem('campusthread_user');
      window.location.href = '/';
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('campusthread_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setCurrentUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusthread_user', JSON.stringify(user));
    }
  },

  // Generic Request Handlers
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('campusthread_token');
            localStorage.removeItem('campusthread_user');
          }
          throw new Error('Your session has expired or is invalid. Please click "Enter Campus" to log in again.');
        }
        throw new Error(data.error || 'Something went wrong with the request.');
      }

      return data;
    } catch (err: any) {
      console.error(`API Fetch Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // REST wrappers
  get: (endpoint: string, options?: RequestInit) => {
    return api.request(endpoint, { ...options, method: 'GET' });
  },

  post: (endpoint: string, body: any, options?: RequestInit) => {
    return api.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put: (endpoint: string, body: any, options?: RequestInit) => {
    return api.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: (endpoint: string, options?: RequestInit) => {
    return api.request(endpoint, { ...options, method: 'DELETE' });
  },
};
