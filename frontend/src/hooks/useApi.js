import { useState, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, request, setData };
};
