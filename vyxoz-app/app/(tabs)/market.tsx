import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

interface MarketData {
  btc_dominance?: number;
  eth_dominance?: number;
  total_market_cap?: number;
  total_volume_24h?: number;
  market_cap_change_24h?: number;
  active_cryptocurrencies?: number;
  market_cap_percentage?: {
    btc?: number;
    eth?: number;
  };
}

interface PriceData {
  usd?: number;
  brl?: number;
  eur?: number;
}

export default function MarketScreen() {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = (() => {
    switch (currency) {
      case 'BRL': return 'R$';
      case 'EUR': return '€';
      default: return '$';
    }
  })();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch market data from your backend
      const [marketResponse, pricesResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/globaldata/totaldata`),
        fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/globaldata/prices`)
      ]);

      if (!marketResponse.ok) throw new Error('Failed to fetch market data');
      if (!pricesResponse.ok) throw new Error('Failed to fetch prices');

      const marketResult = await marketResponse.json();
      const pricesResult = await pricesResponse.json();

      setMarketData(marketResult);
      setPrices(pricesResult);
    } catch (err) {
      console.error('Market data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const formatCurrency = (value?: number) => {
    if (!value) return '0';
    
    let convertedValue = value;
    if (currency === 'BRL' && prices?.brl) {
      convertedValue = value * prices.brl;
    } else if (currency === 'EUR' && prices?.eur) {
      convertedValue = value * prices.eur;
    }

    if (convertedValue >= 1e12) {
      return `${currencySymbol}${(convertedValue / 1e12).toFixed(2)}T`;
    } else if (convertedValue >= 1e9) {
      return `${currencySymbol}${(convertedValue / 1e9).toFixed(2)}B`;
    } else if (convertedValue >= 1e6) {
      return `${currencySymbol}${(convertedValue / 1e6).toFixed(2)}M`;
    }
    return `${currencySymbol}${convertedValue.toLocaleString()}`;
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('loading_market_data')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('error')}: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchMarketData} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('market_data_title')}</Text>
        <Text style={styles.subtitle}>{t('global_crypto_metrics')}</Text>
      </View>

      {/* Market Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('market_overview')}</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(marketData?.total_market_cap)}
            </Text>
            <Text style={styles.statLabel}>{t('total_market_cap')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(marketData?.total_volume_24h)}
            </Text>
            <Text style={styles.statLabel}>{t('volume_24h')}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[
              styles.statValue,
              { color: (marketData?.market_cap_change_24h || 0) >= 0 ? '#34C759' : '#FF3B30' }
            ]}>
              {formatPercentage(marketData?.market_cap_change_24h)}
            </Text>
            <Text style={styles.statLabel}>{t('market_cap_change_24h')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {marketData?.active_cryptocurrencies?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.statLabel}>{t('active_cryptocurrencies')}</Text>
          </View>
        </View>
      </View>

      {/* Dominance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('market_dominance')}</Text>
        
        <View style={styles.dominanceCard}>
          <View style={styles.dominanceRow}>
            <Text style={styles.dominanceLabel}>Bitcoin (BTC)</Text>
            <Text style={styles.dominanceValue}>
              {formatPercentage(marketData?.btc_dominance || marketData?.market_cap_percentage?.btc)}
            </Text>
          </View>
          
          <View style={styles.dominanceRow}>
            <Text style={styles.dominanceLabel}>Ethereum (ETH)</Text>
            <Text style={styles.dominanceValue}>
              {formatPercentage(marketData?.eth_dominance || marketData?.market_cap_percentage?.eth)}
            </Text>
          </View>
        </View>
      </View>

      {/* Exchange Rates */}
      {prices && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exchange_rates')}</Text>
          
          <View style={styles.ratesCard}>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>1 USD =</Text>
              <Text style={styles.rateValue}>R$ {prices.brl?.toFixed(2) || '0.00'}</Text>
            </View>
            
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>1 USD =</Text>
              <Text style={styles.rateValue}>€ {prices.eur?.toFixed(4) || '0.0000'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dominanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  dominanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dominanceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dominanceValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  ratesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rateLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  rateValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    margin: 20,
  },
});