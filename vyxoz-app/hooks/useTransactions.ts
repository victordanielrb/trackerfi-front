import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';

export interface TransactionTransfer {
  fungible_info?: {
    name: string;
    symbol: string;
    icon?: {
      url: string;
    };
  };
  direction: 'in' | 'out';
  quantity: {
    float: number;
    numeric: string;
  };
  value?: number;
  price?: number;
  nft_info?: {
    name?: string;
    collection?: string;
    image_url?: string;
  };
}

export interface TransactionFee {
  value: number;
  price: number;
  fungible_info: {
    name: string;
    symbol: string;
    icon?: {
      url: string;
    };
  };
}

export interface Transaction {
  id: string;
  type: string;
  protocol?: string;
  mined_at: string;
  hash: string;
  status: 'confirmed' | 'pending' | 'failed';
  direction?: 'in' | 'out' | 'self';
  address_from?: string;
  address_to?: string;
  chain?: string;
  fee?: TransactionFee;
  transfers?: TransactionTransfer[];
  applications?: Array<{
    name: string;
    icon?: { url: string };
  }>;
}

export interface TransactionWithMeta {
  wallet_address: string;
  chain: string;
  transaction: Transaction;
  fetched_at: string;
}

export interface TransactionFilter {
  wallet_address?: string;
  chain?: string;
  type?: string;
  direction?: 'in' | 'out' | 'self';
  from_date?: string;
  to_date?: string;
  limit?: number;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const { user, token } = useAuth();

  const fetchTransactions = useCallback(async (currentFilter?: TransactionFilter) => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const activeFilter = currentFilter || filter;

      if (activeFilter.wallet_address) params.append('wallet', activeFilter.wallet_address);
      if (activeFilter.chain) params.append('chain', activeFilter.chain);
      if (activeFilter.type) params.append('type', activeFilter.type);
      if (activeFilter.direction) params.append('direction', activeFilter.direction);
      if (activeFilter.from_date) params.append('from_date', activeFilter.from_date);
      if (activeFilter.to_date) params.append('to_date', activeFilter.to_date);
      if (activeFilter.limit) params.append('limit', activeFilter.limit.toString());

      const queryString = params.toString();
      const url = getApiUrl(`/api/tracking/transactions${queryString ? `?${queryString}` : ''}`);
    console.log("wallet tx",url);
    
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      setTransactions(data.transactions || []);
      setTotalCount(data.total_count || 0);
      
      return data.transactions;
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [user, token, filter]);

  const refreshTransactions = useCallback(async (walletAddress?: string) => {
    if (!user || !token) return;

    try {
      setRefreshing(true);
      setError(null);

      // Our CI job (GitHub Action) refreshes transactions hourly and stores them in DB.
      // For manual refresh, we simply re-fetch from the DB (read-only) to get the latest cached values.
      await fetchTransactions(walletAddress ? { wallet_address: walletAddress } : undefined);
    } catch (err: any) {
      console.error('Failed to refresh transactions:', err);
      setError(err.response?.data?.error || 'Failed to refresh transactions');
    } finally {
      setRefreshing(false);
    }
  }, [user, token, fetchTransactions]);

  const updateFilter = useCallback((newFilter: Partial<TransactionFilter>) => {
    setFilter(prev => {
      const updated = { ...prev, ...newFilter };
      // Fetch with new filter
      fetchTransactions(updated);
      return updated;
    });
  }, [fetchTransactions]);

  const clearFilter = useCallback(() => {
    setFilter({});
    fetchTransactions({});
  }, [fetchTransactions]);

  // Auto-fetch on mount
  useEffect(() => {
    if (user && token) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setTotalCount(0);
    }
  }, [user, token]);

  return {
    transactions,
    loading,
    refreshing,
    error,
    totalCount,
    filter,
    fetchTransactions,
    refreshTransactions,
    updateFilter,
    clearFilter,
  };
};

export default useTransactions;
