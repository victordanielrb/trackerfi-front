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
  // active_cryptocurrencies removed per request
  market_cap_percentage?: {
    btc?: number;
    eth?: number;
  };
  // optional top-asset prices (may be provided by backend)
  btc_price?: number;
  eth_price?: number;
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

  // Robust number parser: supports numbers, numeric strings, and nested shapes.
  // Handles European decimal commas like "5134,53" by converting to dot when no dot exists.
  const parseNumber = (v: any): number | undefined => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string') {
      let s = v.trim();
      // If string contains comma but no dot, assume comma is decimal separator
      if (s.includes(',') && !s.includes('.')) {
        s = s.replace(/,/g, '.');
      } else {
        // remove thousands separators (commas or spaces)
        s = s.replace(/[ ,]+/g, '');
      }
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : undefined;
    }
    if (typeof v === 'object') {
      // common nested shapes: { usd: 123 }, { value: 123 }, { price: 123 }
      const candidates = ['usd', 'brl', 'eur', 'value', 'price', 'amount'];
      for (const k of candidates) {
        if (k in v) {
          const n = parseNumber((v as any)[k]);
          if (n !== undefined) return n;
        }
      }
      // fallback: first numeric property
      for (const key of Object.keys(v)) {
        const n = parseNumber((v as any)[key]);
        if (n !== undefined) return n;
      }
    }
    return undefined;
  };

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

      const marketResultRaw = await marketResponse.json();
      const pricesResultRaw = await pricesResponse.json();

      // Backend can return wrapped shapes like { data: {...} } or direct objects.
      const marketRaw = marketResultRaw?.data ?? marketResultRaw ?? {};
      const pricesRaw = pricesResultRaw?.prices ?? pricesResultRaw ?? {};

      // Coerce numeric fields defensively and map backend field names
      const marketResult: MarketData & { btc_price?: number; eth_price?: number } = {
        total_market_cap: parseNumber(marketRaw.market_cap ?? marketRaw.total_market_cap ?? marketRaw.total_market_cap_usd) ?? parseNumber(marketRaw.market_cap_usd) ?? 0,
        total_volume_24h: parseNumber(marketRaw.volume_24h ?? marketRaw.total_volume ?? marketRaw.total_volume_usd) ?? 0,
        market_cap_change_24h: parseNumber(marketRaw.market_cap_change_24h ?? marketRaw.market_cap_change_percentage_24h_usd ?? marketRaw.market_cap_change_percentage_24h) ?? 0,
        btc_dominance: parseNumber(marketRaw.btc_dominance ?? marketRaw.market_cap_percentage?.btc),
        eth_dominance: parseNumber(marketRaw.eth_dominance ?? marketRaw.market_cap_percentage?.eth),
        market_cap_percentage: {
          btc: parseNumber(marketRaw.market_cap_percentage?.btc),
          eth: parseNumber(marketRaw.market_cap_percentage?.eth),
        },
        btc_price: parseNumber(marketRaw.btc_price ?? marketRaw.btc_price_usd ?? marketRaw.bitcoin_price) ,
        eth_price: parseNumber(marketRaw.eth_price ?? marketRaw.eth_price_usd ?? marketRaw.ethereum_price),
      };

      // prices endpoint may return either a small mapping { usd, brl, eur }
      // or an entire coin detail object with market_data.current_price
      const extractPrice = (obj: any, key: string) => {
        // try direct fields
        const direct = parseNumber(obj?.[key]);
        if (direct !== undefined) return direct;
        // try common alias fields
        const alt = parseNumber(obj?.[`${key}_price`] ?? obj?.[`${key}_rate`]);
        if (alt !== undefined) return alt;
        // try coin-detail shape
        const coinDetail = obj?.market_data?.current_price ?? obj?.current_price ?? obj?.market_data;
        if (coinDetail) {
          const v = parseNumber(coinDetail[key] ?? coinDetail[key.toLowerCase()]);
          if (v !== undefined) return v;
        }
        return undefined;
      };

      const pricesResult: PriceData = {
        usd: extractPrice(pricesRaw, 'usd') ?? 1,
        brl: extractPrice(pricesRaw, 'brl'),
        eur: extractPrice(pricesRaw, 'eur'),
      };

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
    if (value === null || value === undefined || !isFinite(value)) return `${currencySymbol}0`;
    
    let convertedValue = value;
    if (currency === 'BRL' && prices?.brl) {
      convertedValue = value * (prices.brl as number);
    } else if (currency === 'EUR' && prices?.eur) {
      convertedValue = value * (prices.eur as number);
    }

    if (!isFinite(convertedValue)) return `${currencySymbol}0`;

    if (convertedValue >= 1e12) {
      return `${currencySymbol}${(convertedValue / 1e12).toFixed(2)}T`;
    } else if (convertedValue >= 1e9) {
      return `${currencySymbol}${(convertedValue / 1e9).toFixed(2)}B`;
    } else if (convertedValue >= 1e6) {
      return `${currencySymbol}${(convertedValue / 1e6).toFixed(2)}M`;
    }
    return `${currencySymbol}${Number(convertedValue).toLocaleString()}`;
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null || !isFinite(value)) return '0%';
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

      {/* Top assets (BTC / ETH) - show even if exchange rates are not available */}
      {(marketData?.btc_price !== undefined || marketData?.eth_price !== undefined) && (
        <View style={[styles.section, { marginTop: 8 }]}> 
          <Text style={styles.sectionTitle}>{t('top_assets') || 'Top assets'}</Text>
          <View style={styles.ratesCard}>
            {marketData?.btc_price !== undefined && (
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>BTC</Text>
                <Text style={styles.rateValue}>{formatCurrency(marketData.btc_price)}</Text>
              </View>
            )}

            {marketData?.eth_price !== undefined && (
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>ETH</Text>
                <Text style={styles.rateValue}>{formatCurrency(marketData.eth_price)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

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
          
            {/* active_cryptocurrencies removed */}
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
              <Text style={styles.rateValue}>R$ {prices.brl !== undefined && isFinite(prices.brl as number) ? (prices.brl as number).toFixed(2) : '0.00'}</Text>
            </View>
            
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>1 USD =</Text>
              <Text style={styles.rateValue}>€ {prices.eur !== undefined && isFinite(prices.eur as number) ? (prices.eur as number).toFixed(4) : '0.0000'}</Text>
            </View>
          </View>
          {/* Top asset prices (BTC / ETH) */}
          {(marketData?.btc_price || marketData?.eth_price) && (
            <View style={[styles.ratesCard, { marginTop: 12 }]}> 
              {marketData?.btc_price !== undefined && (
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>BTC</Text>
                  <Text style={styles.rateValue}>{formatCurrency(marketData.btc_price)}</Text>
                </View>
              )}

              {marketData?.eth_price !== undefined && (
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>ETH</Text>
                  <Text style={styles.rateValue}>{formatCurrency(marketData.eth_price)}</Text>
                </View>
              )}
            </View>
          )}
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