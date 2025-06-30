import { useState } from 'react';
import BASE_URL from './baseUrl';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: defaultHeaders
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    return apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({
        user_name: username,
        password: password
      })
    });
  };

  const getUserProfile = async () => {
    return apiCall('/user');
  };

  return {
    loading,
    error,
    apiCall,
    login,
    getUserProfile
  };
};

export default useApi; 