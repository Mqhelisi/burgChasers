import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // API Configuration
  const API_URL = `${API_BASE}/api`;

  /**
   * Get current user from backend using stored token
   * Called on app load to restore authentication state
   */


  const getCurrentUser = async () => {
    const token = localStorage.getItem('refreshToken');
    console.log(token)
    if (!token) {
      setLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }

    // Try to refresh token
  const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await getCurrentUser();
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

    try {
    // console.log(token)

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
        }
      });

      // Log status for debugging token issues
      if (!response.ok) {
        let body = null;
        try { body = await response.json(); } catch (e) { body = await response.text(); }
        console.warn('Auth check failed', response.status, body);
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return data.user;
      } else {
        // Token is invalid, expired, or malformed -> clear and treat as logged out
        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem('token');
        }
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return null;
    }
  };

  /**
   * Initialize authentication on app load
   */
  useEffect(() => {
    getCurrentUser();
  }, []);

  /**
   * Login function - Works for both buyers and sellers
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token to localStorage (sanitized)
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Set user
        setUser(data.user);
        setIsAuthenticated(true);

        return { 
          success: true, 
          user: data.user,
          message: 'Login successful'
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.'
      };
    }
  };

  /**
   * Register buyer account
   */
  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token to localStorage (sanitized)
        sanitizeAndStoreToken(data.token);
        
        // Set user state
        setUser(data.user);
        setIsAuthenticated(true);

        return { 
          success: true, 
          user: data.user,
          message: 'Registration successful'
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.'
      };
    }
  };

  /**
   * Register seller account (direct registration)
   */
  const registerSeller = async (sellerData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sellerData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token to localStorage (sanitized)
        sanitizeAndStoreToken(data.token);
        
        // Set user state
        setUser(data.user);
        setIsAuthenticated(true);

        return { 
          success: true, 
          user: data.user,
          seller: data.seller,
          message: data.message || 'Seller account created successfully'
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Seller registration failed'
        };
      }
    } catch (error) {
      console.error('Seller registration error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.'
      };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // API call helper with automatic token refresh
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    // console.log(token)
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      await tryRefreshToken();
      const newToken = localStorage.getItem('token');
      
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }

    return response;
  };

  /**
   * Update user profile (for in-app updates without re-fetching)
   * Useful when user data changes (like verification status)
   */
  const updateUserProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    }
    return null;
  };

  /**
   * Refresh user data from backend
   * Useful after operations that change user state
   */
  const refreshUser = async () => {
    return await getCurrentUser();
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    return user && user.role === role;
  };

  /**
   * Check if user is a seller
   */
  const isSeller = () => {
    return hasRole('seller');
  };

  /**
   * Check if user is a buyer
   */
  const isBuyer = () => {
    return hasRole('buyer');
  };

  /**
   * Get authentication token
   */
    const getToken = () => {
      const t = localStorage.getItem('token');
      if (!t) return null;
      // Remove accidental surrounding quotes and whitespace
      return t.replace(/^\"?(.*)\"?$/,'$1').trim();
  };

    const sanitizeAndStoreToken = (token) => {
      if (!token) return;
      const clean = token.replace(/^\"?(.*)\"?$/,'$1').trim();
      localStorage.setItem('token', clean);
    };
  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    
    // Actions
    login,
    register,
    registerSeller,
    logout,
    refreshUser,
    updateUserProfile,
    apiCall,
    
    // Helpers
    hasRole,
    isSeller,
    isBuyer,
    getToken,
    
    // API URL (for components that need to make direct API calls)
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
