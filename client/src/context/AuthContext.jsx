import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('corkboard_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  /**
   * Clear session and remove credentials
   */
  const logout = useCallback((reason = null) => {
    // Note on Security Trade-off:
    // Storing JWT in memory + localStorage enables seamless page reloads and cross-tab access
    // while being susceptible to XSS if untrusted scripts run. Production apps with sensitive
    // compliance requirements should use httpOnly secure cookies with CSRF tokens.
    localStorage.removeItem('corkboard_token');
    localStorage.removeItem('corkboard_user');
    setToken(null);
    setUser(null);

    if (reason) {
      addToast({
        type: 'warning',
        title: 'Session Ended',
        message: reason,
      });
    }
  }, [addToast]);

  // Load existing session on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('corkboard_token');
      const storedUser = localStorage.getItem('corkboard_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }

        // Verify token with backend
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('corkboard_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Initial session check failed:', err.response?.data?.message || err.message);
          // If 401, global interceptor triggers
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen for global 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = (event) => {
      logout(event.detail?.message || 'Your session expired. Please sign in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  /**
   * Authenticate user with email and password
   */
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('corkboard_token', receivedToken);
      localStorage.setItem('corkboard_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${receivedUser.name}. Corkboard ready.`,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Could not sign in. Please verify your email and password.';
      const errors = error.response?.data?.errors || {};

      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message,
      });

      return { success: false, message, errors };
    }
  };

  /**
   * Register a new user account
   */
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('corkboard_token', receivedToken);
      localStorage.setItem('corkboard_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      addToast({
        type: 'success',
        title: 'Account Created!',
        message: `Welcome to PinBoard, ${receivedUser.name}! Your workspace is pinned.`,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to register account. Please check your inputs.';
      const errors = error.response?.data?.errors || {};

      addToast({
        type: 'error',
        title: 'Registration Failed',
        message,
      });

      return { success: false, message, errors };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
