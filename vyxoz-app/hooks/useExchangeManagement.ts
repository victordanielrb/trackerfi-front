import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';

export interface Exchange {
  name: string;
  api_key: string;
  api_secret: string;
  connected_at: Date;
  updated_at: Date;
}

export interface ExchangeResponse {
  id: string;
  name: string;
  api_key: string; // masked for security
  api_secret: string; // masked for security
  connected_at: Date;
  updated_at: Date;
}

export const useExchangeManagement = () => {
  const [exchanges, setExchanges] = useState<ExchangeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const fetchExchanges = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        getApiUrl('/api/exchanges'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Handle both success with data and success with empty array
      let exchangesData = [];
      if (response.data?.success) {
        exchangesData = response.data?.exchanges || [];
      } else if (Array.isArray(response.data)) {
        exchangesData = response.data;
      } else {
        // If response structure is unexpected, default to empty array
        exchangesData = [];
      }
      
      setExchanges(exchangesData);
      return exchangesData;
    } catch (error: any) {
      console.error('Failed to fetch exchanges:', error);
      
      // If it's a 404 or the user has no exchanges, that's not really an error
      if (error.response?.status === 404) {
        setExchanges([]);
        setError(null);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch exchanges');
      }
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const addExchange = useCallback(async (name: string, api_key: string, api_secret: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      await axios.post(
        getApiUrl('/api/exchanges'),
        { name, api_key, api_secret },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the list
      await fetchExchanges();
    } catch (error: any) {
      console.error('Failed to add exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to add exchange');
    }
  }, [user, token, fetchExchanges]);

  const getExchangeForEdit = useCallback(async (exchangeId: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      const response = await axios.get(
        getApiUrl(`/api/exchanges/${exchangeId}/edit`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        return response.data.exchange;
      } else {
        throw new Error(response.data?.message || 'Failed to get exchange for editing');
      }
    } catch (error: any) {
      console.error('Failed to get exchange for edit:', error);
      throw new Error(error.response?.data?.message || 'Failed to get exchange for editing');
    }
  }, [user, token]);

  const updateExchange = useCallback(async (exchangeId: string, api_key?: string, api_secret?: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      const updateData: any = {};
      if (api_key) updateData.api_key = api_key;
      if (api_secret) updateData.api_secret = api_secret;

      await axios.put(
        getApiUrl(`/api/exchanges/${exchangeId}`),
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the list
      await fetchExchanges();
    } catch (error: any) {
      console.error('Failed to update exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to update exchange');
    }
  }, [user, token, fetchExchanges]);

  const removeExchange = useCallback(async (exchangeId: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      await axios.delete(
        getApiUrl(`/api/exchanges/${exchangeId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the list
      await fetchExchanges();
    } catch (error: any) {
      console.error('Failed to remove exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove exchange');
    }
  }, [user, token, fetchExchanges]);

  // Auto-fetch on user change
  useEffect(() => {
    if (user && token) {
      fetchExchanges();
    } else {
      setExchanges([]);
    }
  }, [user, token, fetchExchanges]);

  return {
    exchanges,
    loading,
    error,
    addExchange,
    updateExchange,
    removeExchange,
    getExchangeForEdit,
    refetch: fetchExchanges,
  };
};