import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../constants/api';

export interface GlobalTotalData {
  // shape is unknown; keep flexible
  [key: string]: any;
}

export interface GlobalPrices {
  [symbol: string]: number | any;
}

export const useGlobalData = (opts?: { autoRefreshMs?: number }) => {
  const [totalData, setTotalData] = useState<GlobalTotalData | null>(null);
  const [prices, setPrices] = useState<GlobalPrices | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(getApiUrl('/api/globalData/totaldata'));
      const data = res.data?.data ?? res.data ?? null;
      setTotalData(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch global total data', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch total data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(getApiUrl('/api/globalData/prices'));
      const data = res.data?.data ?? res.data ?? null;
      setPrices(data);
      return data;
    } catch (err: any) {
      console.error('Failed to fetch global prices', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch prices');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const [tot, pr] = await Promise.all([fetchTotalData(), fetchPrices()]);
    return { totalData: tot, prices: pr };
  }, [fetchTotalData, fetchPrices]);

  useEffect(() => {
    // initial load
    refreshAll();

    // optional auto-refresh
    const ms = opts?.autoRefreshMs ?? 5 * 60 * 1000; // default 5 minutes
    const interval = setInterval(() => {
      refreshAll();
    }, ms);

    return () => clearInterval(interval);
  }, [refreshAll, opts]);

  return {
    totalData,
    prices,
    loading,
    error,
    fetchTotalData,
    fetchPrices,
    refreshAll,
  } as const;
};

export default useGlobalData;
