import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG, getApiUrl } from '../constants/api';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: string;
  position_type: string;
  quantity?: string;
  price?: number;
  value?: number; // USD value
  price_change_24h?: number;
  decimals?: number;
  icon_url?: string;
  updated_at?: string;
}

export interface WalletTokens {
  wallet_address: string;
  blockchain: string;
  tokens: Token[];
}

export interface Wallet {
  id: string;
  user_id: string;
  blockchain: 'SUI' | 'EVM' | 'SOLANA';
  wallet_address: string;
  connected_at: string;
}

export function useWalletTokens() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTokens, setWalletTokens] = useState<Record<string, WalletTokens>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, token, isAuthenticated } = useAuth();

  const fetchWallets = useCallback(async () => {
    if (!user?.id || !token || !isAuthenticated) return;

    try {
      setError(null);
      const response = await axios.get(
        getApiUrl(`${API_CONFIG.ENDPOINTS.WALLETS.BASE}/user/${user.id}`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const walletsData = response.data.data || [];
        setWallets(walletsData);
        return walletsData;
      } else {
        setError('Failed to fetch wallets');
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching wallets:', error);
      setError(error.response?.data?.message || 'Failed to load wallets');
      return [];
    }
  }, [user?.id, token, isAuthenticated]);

  const fetchTokensForWallet = useCallback(async (walletId: string) => {
    if (!token) return;

    try {
      const response = await axios.get(
        getApiUrl(`${API_CONFIG.ENDPOINTS.WALLETS.BASE}/${walletId}/tokens`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const walletTokenData = response.data.data;
        setWalletTokens(prev => ({
          ...prev,
          [walletId]: walletTokenData
        }));
        return walletTokenData;
      }
    } catch (error: any) {
      console.error(`Error fetching tokens for wallet ${walletId}:`, error);
      // Don't set error for individual wallet failures
    }
  }, [token]);

  const fetchAllTokens = useCallback(async (walletList?: Wallet[]) => {
    const walletsToUse = walletList || wallets;
    if (walletsToUse.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch tokens for all wallets in parallel
      const tokenPromises = walletsToUse.map(wallet => 
        fetchTokensForWallet(wallet.id)
      );

      await Promise.allSettled(tokenPromises);
    } catch (error) {
      console.error('Error fetching all tokens:', error);
      setError('Failed to fetch some wallet tokens');
    } finally {
      setLoading(false);
    }
  }, [wallets, fetchTokensForWallet]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      // First fetch wallets
      const walletsData = await fetchWallets();
      
      // Then fetch tokens for all wallets
      if (walletsData.length > 0) {
        await fetchAllTokens(walletsData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchWallets, fetchAllTokens]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshData();
    }
  }, [isAuthenticated, user?.id]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || wallets.length === 0) return;

    const interval = setInterval(() => {
      fetchAllTokens();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, wallets.length, fetchAllTokens]);

  const getAllTokens = useCallback(() => {
    const allTokens: (Token & { wallet_address: string; blockchain: string })[] = [];
    
    Object.values(walletTokens).forEach(walletData => {
      walletData.tokens.forEach(token => {
        allTokens.push({
          ...token,
          wallet_address: walletData.wallet_address,
          blockchain: walletData.blockchain
        });
      });
    });

    return allTokens;
  }, [walletTokens]);

  const getTokensByBlockchain = useCallback(() => {
    const tokensByBlockchain: Record<string, (Token & { wallet_address: string })[]> = {};
    
    Object.values(walletTokens).forEach(walletData => {
      if (!tokensByBlockchain[walletData.blockchain]) {
        tokensByBlockchain[walletData.blockchain] = [];
      }
      
      walletData.tokens.forEach(token => {
        tokensByBlockchain[walletData.blockchain].push({
          ...token,
          wallet_address: walletData.wallet_address
        });
      });
    });

    return tokensByBlockchain;
  }, [walletTokens]);

  return {
    wallets,
    walletTokens,
    loading,
    refreshing,
    error,
    fetchWallets,
    fetchTokensForWallet,
    fetchAllTokens,
    refreshData,
    getAllTokens,
    getTokensByBlockchain
  };
}