import axios from 'axios';

/**
 * Global Axios API Client
 * Configured with baseURL, request interceptor to attach JWT,
 * and response interceptor to handle 401 Unauthorized / Token Expiration.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('corkboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 errors globally and notify the app
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');

      if (!isAuthRoute) {
        // Dispatch global event for session expiration
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: {
              message:
                error.response.data?.message ||
                'Your session has expired. Please sign in again.',
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
