import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { API_CONFIG, getApiUrl } from '../constants/api';
import { AppTheme } from '@/constants/theme';

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
  const lineColor = isPositive ? AppTheme.colors.success : AppTheme.colors.danger;
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
          <ActivityIndicator size="small" color={AppTheme.colors.primary} />
          <Text style={styles.loadingText}>{t('loading_chart')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={AppTheme.colors.textMuted} style={{ marginBottom: 12 }} />
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
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    ...AppTheme.shadows.card,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: AppTheme.spacing.sm,
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.body,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: AppTheme.spacing.sm,
  },
  emptyText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textLight,
    textAlign: 'center',
    marginTop: AppTheme.spacing.xs,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  timeRangeButton: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.cardInner,
  },
  timeRangeButtonActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  timeRangeText: {
    ...AppTheme.typography.small,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  },
  timeRangeTextActive: {
    color: AppTheme.colors.card,
  },
  changeContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
    gap: AppTheme.spacing.xs,
  },
  currentValue: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  changeValue: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  changePercent: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  selectedDate: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textLight,
    marginTop: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: AppTheme.spacing.sm,
    overflow: 'hidden',
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.xs,
  },
  dateLabel: {
    ...AppTheme.typography.small,
    fontSize: 10,
    color: AppTheme.colors.textLight,
  },
  pointerLabel: {
    backgroundColor: AppTheme.colors.textDark,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.xs,
  },
  pointerValue: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
});
