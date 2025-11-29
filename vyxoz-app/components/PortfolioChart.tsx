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
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

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

  // Get display values based on selected point or default (total change)
  const getDisplayValues = () => {
    if (selectedPointIndex !== null && chartData.length > 0) {
      const currentValue = chartData[selectedPointIndex].value;
      const previousValue = selectedPointIndex > 0 
        ? chartData[selectedPointIndex - 1].value 
        : chartData[0].value;
      const change = currentValue - previousValue;
      const percent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
      return { 
        currentValue, 
        change, 
        percent,
        date: chartData[selectedPointIndex].date,
        isSelected: true
      };
    }
    // Default: show last value and total change
    const totalChange = getChange();
    return {
      currentValue: chartData.length > 0 ? chartData[chartData.length - 1].value : 0,
      change: totalChange.value,
      percent: totalChange.percent,
      date: chartData.length > 0 ? chartData[chartData.length - 1].date : null,
      isSelected: false
    };
  };

  const displayValues = getDisplayValues();
  const isPositive = displayValues.change >= 0;
  const lineColor = isPositive ? '#34C759' : '#FF3B30';
  const screenWidth = Dimensions.get('window').width;
  // Container has 16px padding on each side = 32px total
  const chartWidth = screenWidth - 32;
  // Calculate spacing to fit all points within the chart width
  // The chart content width = initialSpacing + (spacing * (n-1)) + endSpacing
  // With initialSpacing=8 and endSpacing=8, we have chartWidth - 16 for the line
  const pointSpacing = chartData.length > 1 
    ? (chartWidth - 16) / (chartData.length - 1) 
    : 0;

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
        <Text style={styles.currentValue}>
          {currencySymbol}{displayValues.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeValue, { color: lineColor }]}>
            {isPositive ? '+' : ''}{currencySymbol}{Math.abs(displayValues.change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.changePercent, { color: lineColor }]}>
            ({isPositive ? '+' : ''}{displayValues.percent.toFixed(2)}%)
          </Text>
        </View>
        {displayValues.isSelected && displayValues.date && (
          <Text style={styles.selectedDate}>
            {displayValues.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={chartWidth}
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
          initialSpacing={8}
          endSpacing={8}
          spacing={pointSpacing}
          disableScroll
          focusEnabled
          showDataPointOnFocus
          onFocus={(item: any, index: number) => {
            if (typeof index === 'number' && index >= 0 && index < chartData.length) {
              setSelectedPointIndex(index);
            }
          }}
          onDataPointClick={(item: any, index: number) => {
            // Do nothing on click - only drag should update
          }}
          pointerConfig={{
            pointerStripHeight: 100,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 1,
            pointerColor: lineColor,
            radius: 5,
            pointerLabelWidth: 100,
            pointerLabelHeight: 40,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              const item = items?.[0];
              if (!item) return null;
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 8,
    overflow: 'hidden',
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
