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

export interface WalletSummary {
  wallet_address: string;
  wallet_chain?: string;
  totalValue: number; // USD
  totalChange: number; // USD absolute 24h change
  percentChange: number; // decimal, e.g. 0.05 == +5%
}

export const useWalletTracking = () => {
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [tokens, setTokens] = useState<TrackedWalletToken[]>([]);
  const [walletSummaries, setWalletSummaries] = useState<Record<string, WalletSummary>>({});
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
      // Support both wrapped responses { success, data: [...] } and raw arrays
      const walletsData = response.data?.data ?? response.data ?? [];
      setTrackedWallets(walletsData);
      return walletsData;
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
      // Support both wrapped responses { success, data: [...] } and raw arrays
      const tokensData = response.data?.data ?? response.data ?? [];
      setTokens(tokensData);
      // compute wallet summaries immediately when tokens fetched
      try {
        const groups: Record<string, { wallet_chain?: string; totalValue: number; totalChange: number }> = {};
        tokensData.forEach((t: TrackedWalletToken) => {
          const wallet = t.wallet_address || 'unknown';
          const val = Number(t.value || 0);
          const changePct = Number(t.price_change_24h || 0);
          if (!groups[wallet]) groups[wallet] = { wallet_chain: t.wallet_chain, totalValue: 0, totalChange: 0 };
          groups[wallet].totalValue += val;
          groups[wallet].totalChange += val * changePct;
        });

        const summaries: Record<string, WalletSummary> = {};
        Object.keys(groups).forEach(k => {
          const g = groups[k];
          summaries[k] = {
            wallet_address: k,
            wallet_chain: g.wallet_chain,
            totalValue: g.totalValue,
            totalChange: g.totalChange,
            percentChange: g.totalValue !== 0 ? (g.totalChange / g.totalValue) : 0,
          };
        });
        setWalletSummaries(summaries);
      } catch (e) {
        console.error('Failed to compute wallet summaries:', e);
      }
      return tokensData;
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
      const wallets = await fetchTrackedWallets();
      // Also refresh tokens so UI updates immediately after adding a wallet
      if (wallets && wallets.length > 0) {
        await fetchTokensFromTrackedWallets();
      }
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
      const wallets = await fetchTrackedWallets();
      // Refresh tokens after removing a wallet
      if (wallets) {
        await fetchTokensFromTrackedWallets();
      }
    } catch (error: any) {
      console.error('Failed to remove tracked wallet:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove wallet');
    }
  }, [user, token, fetchTrackedWallets]);

  const refreshTokens = useCallback(async () => {
    // Refresh both tracked wallets and tokens for complete portfolio update
    await fetchTrackedWallets();
    return await fetchTokensFromTrackedWallets();
  }, [fetchTrackedWallets, fetchTokensFromTrackedWallets]);

  // Auto-fetch on user change - FIXED: removed callbacks from dependency to prevent loops
  useEffect(() => {
    if (user && token) {
      fetchTrackedWallets();
      fetchTokensFromTrackedWallets();
    } else {
      setTrackedWallets([]);
      setTokens([]);
    }
  }, [user, token]); // FIXED: removed fetchTrackedWallets, fetchTokensFromTrackedWallets from deps

  return {
    trackedWallets,
    tokens,
    loading,
    error,
    addTrackedWallet,
    removeTrackedWallet,
    refreshTokens,
    refetch: fetchTrackedWallets,
    walletSummaries,
  };
};