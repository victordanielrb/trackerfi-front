import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG, getApiUrl } from '../constants/api';

export interface TrackedWallet {
  address: string;
  chain: string;
}

export interface TrackedWalletToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: string;
  position_type: string;
  quantity?: string;
  price?: number;
  value?: number;
  price_change_24h?: number;
  decimals?: number;
  icon_url?: string;
  updated_at?: string;
  wallet_address: string;
  wallet_chain: string;
}

export const useWalletTracking = () => {
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [tokens, setTokens] = useState<TrackedWalletToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const fetchTrackedWallets = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        getApiUrl('/api/tracking/wallets'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setTrackedWallets(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch tracked wallets:', error);
      setError(error.response?.data?.error || 'Failed to fetch tracked wallets');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const fetchTokensFromTrackedWallets = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        getApiUrl('/api/tracking/tokens'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setTokens(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch tokens from tracked wallets:', error);
      setError(error.response?.data?.error || 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const addTrackedWallet = useCallback(async (address: string, chain: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      await axios.post(
        getApiUrl('/api/tracking/wallets'),
        { address, chain },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the list
      await fetchTrackedWallets();
    } catch (error: any) {
      console.error('Failed to add tracked wallet:', error);
      throw new Error(error.response?.data?.error || 'Failed to add wallet');
    }
  }, [user, token, fetchTrackedWallets]);

  const removeTrackedWallet = useCallback(async (address: string, chain: string) => {
    if (!user || !token) throw new Error('User not authenticated');

    try {
      await axios.delete(
        getApiUrl('/api/tracking/wallets'),
        {
          data: { address, chain },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the list
      await fetchTrackedWallets();
    } catch (error: any) {
      console.error('Failed to remove tracked wallet:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove wallet');
    }
  }, [user, token, fetchTrackedWallets]);

  const refreshTokens = useCallback(async () => {
    await fetchTokensFromTrackedWallets();
  }, [fetchTokensFromTrackedWallets]);

  // Auto-fetch on user change
  useEffect(() => {
    if (user && token) {
      fetchTrackedWallets();
      fetchTokensFromTrackedWallets();
    } else {
      setTrackedWallets([]);
      setTokens([]);
    }
  }, [user, token, fetchTrackedWallets, fetchTokensFromTrackedWallets]);

  // Auto-refresh tokens every 5 minutes
  useEffect(() => {
    if (!user || !token || trackedWallets.length === 0) return;

    const interval = setInterval(() => {
      fetchTokensFromTrackedWallets();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, token, trackedWallets.length, fetchTokensFromTrackedWallets]);

  return {
    trackedWallets,
    tokens,
    loading,
    error,
    addTrackedWallet,
    removeTrackedWallet,
    refreshTokens,
    refetch: fetchTrackedWallets,
  };
};