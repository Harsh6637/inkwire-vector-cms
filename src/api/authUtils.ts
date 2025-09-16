// authUtils.ts - Centralized token management
import { authApi } from './authApi';

/**
* Get stored credentials from localStorage
*/
const getStoredCredentials = () => {
try {
const userData = localStorage.getItem('inkwire_user');
if (userData) {
      const user = JSON.parse(userData);
      return {
        email: user.email,
        password: 'P@$word123' // You'll need to store this securely or handle differently
      };
    }
  } catch (error) {
    console.error('Error getting stored credentials:', error);
  }

  // Fallback - you might want to redirect to login instead
  return {
    email: 'admin@inkwire.co',
    password: 'P@$word123'
  };
};

/**
 * Makes an authenticated API request with automatic token refresh
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const makeRequest = async (token: string): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  // Try with current token
  let token = localStorage.getItem('inkwire_token');

  if (!token) {
    // No token exists, get a new one
    try {
      const credentials = getStoredCredentials();
      const response = await authApi.login(credentials);
      token = response.token;
      localStorage.setItem('inkwire_token', token);
    } catch (error) {
      throw new Error('Failed to authenticate');
    }
  }

  let response = await makeRequest(token);

  // If unauthorized, refresh token and retry once
  if (response.status === 401) {
    try {
      const credentials = getStoredCredentials();
      const authResponse = await authApi.login(credentials);
      token = authResponse.token;
      localStorage.setItem('inkwire_token', token);

      // Retry with new token
      response = await makeRequest(token);
    } catch (error) {
      // If refresh fails, clear storage and throw error
      localStorage.removeItem('inkwire_token');
      localStorage.removeItem('inkwire_user');
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  return response;
};