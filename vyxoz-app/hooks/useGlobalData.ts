import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

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
  // prevent duplicate simultaneous requests
  const isFetchingRef = useRef(false);

  // Use auth + settings to control when to fetch
  const { isAuthenticated } = useAuth();
  const { language } = useSettings();

  // Trigger a fetch when the user becomes authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    (async () => {
      try {
        await refreshAll();
      } catch (e) {
        // ignore - errors are handled in fetch helpers
      } finally {
        isFetchingRef.current = false;
      }
    })();
  }, [isAuthenticated, refreshAll]);

  // Fetch when language changes (user requested this behaviour). This allows
  // language switch to refresh any language-sensitive global data even when
  // the user is not logged in.
  useEffect(() => {
    // if a fetch is already in progress, skip
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    (async () => {
      try {
        await refreshAll();
      } catch (e) {
        // ignore
      } finally {
        isFetchingRef.current = false;
      }
    })();
    // intentionally only depend on language so currency changes won't trigger
    // this effect
  }, [language, refreshAll]);

  // optional auto-refresh - only if explicitly requested. This interval should
  // run while the hook is mounted (and respects isAuthenticated guard inside
  // refreshAll if desired by consumers). We keep this separate from the
  // auth/language triggers above.
  useEffect(() => {
    const ms = opts?.autoRefreshMs;
    if (ms && ms > 0) {
      const interval = setInterval(() => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        refreshAll().finally(() => { isFetchingRef.current = false; });
      }, ms);
      return () => clearInterval(interval);
    }
    return;
  }, [opts?.autoRefreshMs, refreshAll]);

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
