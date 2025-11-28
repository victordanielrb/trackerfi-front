import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { API_CONFIG, getApiUrl } from '../constants/api';

interface Snapshot {
  _id: string;
  timestamp: string;
  total_value_usd: number;
}

interface PortfolioChartProps {
  onPress?: () => void;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function PortfolioChart({ onPress }: PortfolioChartProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { currency, prices } = useSettings();
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const currencySymbol = (() => {
    switch (currency) {
      case 'BRL': return 'R$';
      case 'EUR': return '€';
      default: return '$';
    }
  })();

  const convertCurrency = (v: number) => {
    if (currency === 'USD') return v;
    if (currency === 'BRL' && prices?.brl) return v * prices.brl;
    if (currency === 'EUR' && prices?.eur) return v * prices.eur;
    return v;
  };

  const fetchSnapshots = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.TRACKING.SNAPSHOTS}?days=${days}&limit=100`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch snapshots');
      }
      
      const data = await response.json();
      setSnapshots(data.snapshots || []);
    } catch (err: any) {
      console.error('Error fetching snapshots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [token, timeRange]);

  const getChartData = () => {
    if (!snapshots.length) return [];
    
    // Sort by timestamp ascending for chart
    const sorted = [...snapshots].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return sorted.map((s, index) => ({
      value: convertCurrency(s.total_value_usd),
      date: new Date(s.timestamp),
      label: index === 0 || index === sorted.length - 1 
        ? new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : '',
      dataPointText: '',
    }));
  };

  const chartData = getChartData();
  
  const getChange = () => {
    if (chartData.length < 2) return { value: 0, percent: 0 };
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const change = last - first;
    const percent = first !== 0 ? (change / first) * 100 : 0;
    return { value: change, percent };
  };

  const change = getChange();
  const isPositive = change.value >= 0;
  const lineColor = isPositive ? '#34C759' : '#FF3B30';
  const screenWidth = Dimensions.get('window').width;

  if (loading) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>{t('loading_chart')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>
            {error || t('no_chart_data')}
          </Text>
          <Text style={styles.emptySubtext}>{t('chart_data_available_after_snapshots')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive
            ]}>
              {range === 'all' ? t('all') : range.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Change Summary */}
      <View style={styles.changeContainer}>
        <Text style={[styles.changeValue, { color: lineColor }]}>
          {isPositive ? '+' : ''}{currencySymbol}{Math.abs(change.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.changePercent, { color: lineColor }]}>
          ({isPositive ? '+' : ''}{change.percent.toFixed(2)}%)
        </Text>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={screenWidth - 80}
          height={120}
          color={lineColor}
          thickness={2}
          hideDataPoints={chartData.length > 15}
          dataPointsColor={lineColor}
          dataPointsRadius={3}
          startFillColor={lineColor}
          endFillColor={lineColor}
          startOpacity={0.3}
          endOpacity={0.05}
          areaChart
          curved
          hideRules
          hideYAxisText
          hideAxesAndRules
          yAxisOffset={minValue * 0.95}
          adjustToWidth
          initialSpacing={10}
          endSpacing={10}
          pointerConfig={{
            pointerStripHeight: 100,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 1,
            pointerColor: lineColor,
            radius: 5,
            pointerLabelWidth: 100,
            pointerLabelHeight: 40,
            pointerLabelComponent: (items: any) => {
              const item = items[0];
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerValue}>
                    {currencySymbol}{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>

      {/* Date Labels */}
      <View style={styles.dateLabels}>
        {chartData.length > 0 && (
          <>
            <Text style={styles.dateLabel}>
              {chartData[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.dateLabel}>
              {chartData[chartData.length - 1].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 6,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 10,
    color: '#999',
  },
  pointerLabel: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointerValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
