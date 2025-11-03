import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';

export interface FuturesPosition {
  exchange: string;
  positionId: number;
  symbol: string;
  positionType: number; // 1: long, 2: short
  holdVol: number;
  holdAvgPrice: number;
  liquidatePrice: number;
  realised: number;
  leverage: number;
  createTime: number;
  updateTime: number;
  pnl?: number;
}

export const useFuturesPositions = () => {
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const { user, token } = useAuth();

  const fetchPositions = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);
      setErrors([]);
      
      const response = await axios.get(
        getApiUrl('/api/exchanges/futures'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data?.success) {
        setPositions(response.data.positions || []);
        setErrors(response.data.errors || []);
      } else {
        setError(response.data?.message || 'Failed to fetch futures positions');
      }
    } catch (error: any) {
      console.error('Failed to fetch futures positions:', error);
      
      if (error.response?.status === 404) {
        setPositions([]);
        setError(null);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch futures positions');
      }
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Auto-fetch on user change
  useEffect(() => {
    if (user && token) {
      fetchPositions();
    } else {
      setPositions([]);
    }
  }, [user, token, fetchPositions]);

  return {
    positions,
    loading,
    error,
    errors,
    refetch: fetchPositions,
  };
};