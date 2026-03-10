# Frontend Integration Guide

## Overview

This guide explains how your frontend should interact with the Flask backend to:
1. Receive access tokens on login/registration
2. Store tokens securely
3. Send tokens with API requests
4. Access protected endpoints
5. Handle token expiration (30 minutes)
6. Refresh tokens

---

## Authentication Flow

### Step 1: User Logs In

**Frontend sends:**
```javascript
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend returns:**
```javascript
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "buyer",
    // ... other user fields
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // Access token (30 min)
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // Refresh token (30 days)
}
```

### Step 2: Frontend Stores Tokens

```javascript
// Store tokens in localStorage
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);

// Store user info (optional)
localStorage.setItem('user', JSON.stringify(data.user));
```

### Step 3: Frontend Sends Token with Requests

**For all protected endpoints:**
```javascript
fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(productData)
})
```

---

## Complete Frontend Example

### AuthContext Implementation

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize - get current user on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Get current user from backend
  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token expired or invalid
        await tryRefreshToken();
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Login
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
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Set user
        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Register buyer
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // API call helper with automatic token refresh
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
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

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    apiCall,  // Use this for authenticated API calls
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Making API Calls

### Public Endpoints (No Token Required)

```javascript
// Get all sellers
fetch('http://localhost:5000/api/sellers')
  .then(res => res.json())
  .then(data => console.log(data.sellers));

// Get products
fetch('http://localhost:5000/api/products?category=Electronics')
  .then(res => res.json())
  .then(data => console.log(data.products));
```

### Protected Endpoints (Token Required)

#### Method 1: Using fetch directly
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Product',
    price: 99.99,
    description: 'Product description',
    images: ['url1', 'url2']
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Product created:', data.product);
  }
});
```

#### Method 2: Using apiCall helper (Recommended)
```javascript
const { apiCall } = useAuth();

const createProduct = async () => {
  const response = await apiCall('/products', {
    method: 'POST',
    body: JSON.stringify({
      name: 'New Product',
      price: 99.99,
      description: 'Product description',
      images: ['url1', 'url2']
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('Product created:', data.product);
  }
};
```

#### Method 3: Using axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          }
        );
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.token}`;
          return axios.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Usage
await api.post('/products', productData);
```

---

## Example Components

### Login Component
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      if (result.user.role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Create Product Component
```javascript
import { useState } from 'react';
import { useAuth } from '../AuthContext';

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { apiCall } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: formData.images
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Product created successfully!');
        setFormData({ name: '', price: '', description: '', images: [] });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {/* Form fields... */}
      <button type="submit">Create Product</button>
    </form>
  );
};
```

### Protected Route Component
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children, requireSeller }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireSeller && user.role !== 'seller') {
    return <Navigate to="/" />;
  }

  return children;
};

// Usage in routes
<Route 
  path="/seller-dashboard" 
  element={
    <ProtectedRoute requireSeller>
      <SellerDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## Token Lifecycle

### 1. Token Creation (30 minutes)
When user logs in or registers, backend creates:
- **Access Token**: Expires in 30 minutes
- **Refresh Token**: Expires in 30 days

### 2. Token Usage
Every API call to protected endpoint includes:
```
Authorization: Bearer <access_token>
```

### 3. Token Expiration
After 30 minutes:
- Access token expires
- Backend returns 401 error
- Frontend should refresh token

### 4. Token Refresh
```javascript
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
  "success": true,
  "token": "new_access_token"
}
```

### 5. Complete Flow
```
1. User logs in → Get tokens
2. Use access token for 30 minutes
3. Token expires → Get 401 error
4. Use refresh token → Get new access token
5. Retry original request with new token
6. Continue for up to 30 days
7. After 30 days → Must login again
```

---

## API Endpoints Reference

### Public Endpoints (No Token)
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register buyer
- `POST /api/auth/register-seller` - Register seller
- `GET /api/sellers` - List sellers
- `GET /api/sellers/<id>` - Get seller
- `GET /api/products` - List products
- `GET /api/products/<id>` - Get product
- `GET /api/reviews?product_id=<id>` - List reviews

### Protected Endpoints (Token Required)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/sellers/request-verification` - Request verification
- `POST /api/sellers/<id>/verify` - Verify seller (admin)
- `GET /api/sellers/pending-verifications` - List pending (admin)
- `POST /api/products` - Create product (seller)
- `PUT /api/products/<id>` - Update product (seller)
- `DELETE /api/products/<id>` - Delete product (seller)
- `POST /api/votes` - Vote on product
- `POST /api/reviews` - Create review

---

## Error Handling

### 400 - Bad Request
```javascript
{
  "success": false,
  "message": "Invalid input data",
  "errors": "..." // Validation details
}
```

### 401 - Unauthorized
```javascript
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

Action: Refresh token or redirect to login

### 403 - Forbidden
```javascript
{
  "success": false,
  "message": "Unauthorized. Only sellers can create products."
}
```

Action: Show error, redirect if needed

### 404 - Not Found
```javascript
{
  "success": false,
  "message": "Product not found"
}
```

### 409 - Conflict
```javascript
{
  "success": false,
  "message": "Email already registered"
}
```

### 422 - Validation Error
```javascript
{
  "success": false,
  "message": "Validation error. Please check your input.",
  "errors": {
    "name": "Name is required",
    "price": "Price must be a number"
  }
}
```

---

## Complete Request Examples

### Login
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();

if (data.success) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  // User is logged in
}
```

### Create Product (Protected)
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Wireless Headphones',
    price: 129.99,
    description: 'Premium noise-cancelling headphones',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ]
  })
});

const data = await response.json();

if (data.success) {
  console.log('Product created:', data.product);
  console.log('Remaining slots:', data.remaining);
}
```

### Request Verification
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/sellers/request-verification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

if (data.success) {
  console.log(data.message); // "Verification requested!"
}
```

---

## Summary

### Frontend Responsibilities:
1. ✅ Store tokens in localStorage on login/register
2. ✅ Include `Authorization: Bearer <token>` header on protected requests
3. ✅ Handle 401 errors by refreshing token
4. ✅ Redirect to login when refresh fails
5. ✅ Clear tokens on logout

### Backend Provides:
1. ✅ Access token (30 min expiration)
2. ✅ Refresh token (30 day expiration)
3. ✅ Token validation on protected endpoints
4. ✅ Clear error messages
5. ✅ Consistent JSON responses

### Security:
- ✅ Tokens in Authorization header (not URL)
- ✅ HTTPS in production
- ✅ httpOnly cookies optional (for extra security)
- ✅ Token expiration enforced
- ✅ CORS configured properly
