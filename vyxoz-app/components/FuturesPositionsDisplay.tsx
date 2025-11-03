import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FuturesPosition } from '../hooks/useFuturesPositions';

interface FuturesPositionsDisplayProps {
  positions: FuturesPosition[];
  loading: boolean;
  error: string | null;
  errors: string[];
  onRefresh: () => void;
}

export default function FuturesPositionsDisplay({
  positions,
  loading,
  error,
  errors,
  onRefresh,
}: FuturesPositionsDisplayProps) {
  const { t } = useTranslation();

  const getPositionTypeText = (type: number) => {
    return type === 1 ? 'LONG' : 'SHORT';
  };

  const getPositionTypeColor = (type: number) => {
    return type === 1 ? '#34C759' : '#FF3B30';
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderPosition = ({ item }: { item: FuturesPosition }) => (
    <View style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{item.symbol.replace('_', '/')}</Text>
          <View style={[styles.badge, { backgroundColor: getPositionTypeColor(item.positionType) }]}>
            <Text style={styles.badgeText}>{getPositionTypeText(item.positionType)}</Text>
          </View>
        </View>
        <View style={styles.exchangeContainer}>
          <Text style={styles.exchange}>{item.exchange.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.positionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('size')}</Text>
          <Text style={styles.detailValue}>{item.holdVol}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('entry_price')}</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.holdAvgPrice)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('liquidation_price')}</Text>
          <Text style={[styles.detailValue, styles.liquidationPrice]}>
            {formatCurrency(item.liquidatePrice)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('leverage')}</Text>
          <Text style={styles.detailValue}>{item.leverage}x</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('realized_pnl')}</Text>
          <Text style={[
            styles.detailValue,
            { color: item.realised >= 0 ? '#34C759' : '#FF3B30' }
          ]}>
            {formatCurrency(item.realised)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('open_date')}</Text>
          <Text style={styles.detailValue}>{formatDate(item.createTime)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('loading_futures_positions')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (positions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t('no_futures_positions')}</Text>
        <Text style={styles.emptySubtext}>
          {t('no_futures_positions_description')}
        </Text>
        {errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={styles.errorsTitle}>{t('exchange_errors')}:</Text>
            {errors.map((err, index) => (
              <Text key={index} style={styles.errorItem}>• {err}</Text>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errors.length > 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{t('some_exchanges_failed')}</Text>
        </View>
      )}
      
      <FlatList
        data={positions}
        renderItem={renderPosition}
        keyExtractor={(item) => `${item.exchange}-${item.positionId}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorsContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  errorItem: {
    fontSize: 12,
    color: '#856404',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  positionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  exchangeContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exchange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  positionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  liquidationPrice: {
    color: '#FF3B30',
  },
});