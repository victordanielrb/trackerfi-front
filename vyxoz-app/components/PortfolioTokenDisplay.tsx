import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { TrackedWalletToken } from '../hooks/useWalletTracking';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

interface PortfolioTokenDisplayProps {
  tokens: TrackedWalletToken[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  showWalletAddress?: boolean;
  onTokenPress?: (token: TrackedWalletToken) => void;
}

type SortOption = 'value' | 'balance' | 'performance' | 'alphabetical' | 'chain';

export default function PortfolioTokenDisplay({ 
  tokens,
  loading,
  error,
  onRefresh,
  showWalletAddress = true,
  onTokenPress
}: PortfolioTokenDisplayProps) {

  const [sortBy, setSortBy] = useState<SortOption>('value');
  const { t } = useTranslation();
  const { currency, prices } = useSettings();

  const currencySymbol = (() => {
    switch (currency) {
      case 'BRL': return 'R$';
      case 'EUR': return '€';
      default: return '$';
    }
  })();

  const convert = (usdValue?: number | string) => {
    const v = typeof usdValue === 'string' ? parseFloat(usdValue) : (usdValue || 0);
    if (!v) return 0;
    if (currency === 'USD') return v;
    if (currency === 'BRL' && prices?.brl) return v * prices.brl;
    if (currency === 'EUR' && prices?.eur) return v * prices.eur;
    return v;
  };

  const getChainColor = (chain: string) => {
    const chainUpper = chain?.toUpperCase();
    switch (chainUpper) {
      case 'ETHEREUM': case 'ETH': return '#627EEA';
      case 'POLYGON': case 'MATIC': return '#8247E5';
      case 'BSC': case 'BINANCE': return '#F3BA2F';
      case 'ARBITRUM': case 'ARB': return '#28A0F0';
      case 'OPTIMISM': case 'OP': return '#FF0420';
      case 'AVALANCHE': case 'AVAX': return '#E84142';
      case 'SOLANA': case 'SOL': return '#9945FF';
      case 'SUI': return '#6FBCF0';
      case 'BASE': return '#0052FF';
      case 'FANTOM': case 'FTM': return '#1969FF';
      case 'EVM': return '#8B5CF6';
      default: return '#666';
    }
  };

  const getChainDisplayName = (chain: string) => {
    const chainUpper = chain?.toUpperCase();
    switch (chainUpper) {
      case 'EVM': return 'EVM';
      case 'ETH': return 'Ethereum';
      case 'MATIC': return 'Polygon';
      case 'ARB': return 'Arbitrum';
      case 'OP': return 'Optimism';
      case 'AVAX': return 'Avalanche';
      case 'SOL': return 'Solana';
      case 'FTM': return 'Fantom';
      default: return chain || 'Unknown';
    }
  };

  // Sort tokens based on selected option
  const sortedTokens = useMemo(() => {
    return [...tokens].sort((a, b) => {
      switch (sortBy) {
        case 'value':
          // Value = USD value of your token holdings
          const valueA = parseFloat(a.value?.toString() || '0');
          const valueB = parseFloat(b.value?.toString() || '0');
          return valueB - valueA;
        case 'balance':
          // Balance = quantity of tokens you own
          const balanceA = parseFloat(a.quantity?.toString() || '0');
          const balanceB = parseFloat(b.quantity?.toString() || '0');
          return balanceB - balanceA;
        case 'performance':
          const perfA = a.price_change_24h || 0;
          const perfB = b.price_change_24h || 0;
          return perfB - perfA;
        case 'alphabetical':
          const nameA = (a.name || a.symbol || '').toLowerCase();
          const nameB = (b.name || b.symbol || '').toLowerCase();
          return nameA.localeCompare(nameB);
        case 'chain':
          const chainA = getChainDisplayName(a.chain).toLowerCase();
          const chainB = getChainDisplayName(b.chain).toLowerCase();
          return chainA.localeCompare(chainB);
        default:
          return 0;
      }
    });
  }, [tokens, sortBy]);

  const getTokensByBlockchain = () => {
    const grouped: { [key: string]: TrackedWalletToken[] } = {};
    sortedTokens.forEach(token => {
      const chain = getChainDisplayName(token.chain);
      if (!grouped[chain]) {
        grouped[chain] = [];
      }
      grouped[chain].push(token);
    });
    return grouped;
  };

  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortTitle}>{t('sort_by')}</Text>
      <View style={styles.sortButtons}>
        {[
          { key: 'value', short: t('holdings') },
          { key: 'balance', short: t('quantity') },
          { key: 'alphabetical', short: t('name') },
          { key: 'chain', short: t('chain') }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.sortButtonActive
            ]}
            onPress={() => setSortBy(option.key as SortOption)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option.key && styles.sortButtonTextActive
            ]}>
              {option.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderToken = ({ item }: { item: TrackedWalletToken }) => {
    const chainDisplayName = getChainDisplayName(item.chain);
    const performance = item.price_change_24h || 0;
    
    return (
      <TouchableOpacity 
        style={styles.tokenCard}
        onPress={() => onTokenPress?.(item)}
      >
        {/* Header with Token Name and Chain */}
        <View style={styles.tokenHeader}>
          <View style={styles.tokenNameSection}>
            <Text style={styles.tokenName}>{item.name || 'Unknown Token'}</Text>
            <Text style={styles.tokenSymbol}>({item.symbol || 'UNK'})</Text>
          </View>
          
          {/* Big Prominent Chain Badge */}
          <View style={[styles.chainBadge, { backgroundColor: getChainColor(item.chain) }]}>
            <Text style={styles.chainText}>{chainDisplayName}</Text>
          </View>
        </View>

        {/* Values Grid - Price, Quantity, Holdings */}
        <View style={styles.valuesGrid}>
          {/* Token Price */}
          {item.price && !isNaN(parseFloat(item.price.toString())) && (
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>{t('price')}</Text>
              <Text style={styles.priceText}>
                {currencySymbol}{convert(item.price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
            </View>
          )}

          {/* Token Quantity */}
          {item.quantity && !isNaN(parseFloat(item.quantity.toString())) && (
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>{t('quantity')}</Text>
              <Text style={styles.balanceText}>
                {parseFloat(item.quantity.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6
                })}
              </Text>
            </View>
          )}

          {/* Holdings (USD Value) */}
          {item.value && !isNaN(parseFloat(item.value.toString())) && (
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>{t('holdings')}</Text>
              <Text style={styles.valueText}>
                {currencySymbol}{convert(item.value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Performance Row */}
        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>{t('24h_change')}</Text>
          <Text style={[
            styles.performanceText,
            performance >= 0 ? styles.performancePositive : styles.performanceNegative
          ]}>
            {performance >= 0 ? '+' : ''}{(performance * 100).toFixed(2)}%
          </Text>
        </View>

        {/* Addresses - keep raw strings out of Views by using explicit Text children */}
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>{t('contract') + ':'}</Text>
          <Text style={styles.addressValue} numberOfLines={1}>{item.address || 'N/A'}</Text>
        </View>

        {showWalletAddress && (
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>{t('wallet') + ':'}</Text>
            <Text style={styles.addressValue} numberOfLines={1}>{item.wallet_address || 'N/A'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBlockchainSection = ({ item }: { item: [string, TrackedWalletToken[]] }) => {
    const [blockchain, blockchainTokens] = item;
    const totalValue = blockchainTokens.reduce((sum, token) => {
      return sum + convert(parseFloat(token.value?.toString() || '0'));
    }, 0);
    
    return (
      <View style={styles.blockchainSection}>
        <View style={[styles.blockchainHeader, { backgroundColor: getChainColor(blockchain) + '20' }]}>
          <View style={styles.blockchainTitleContainer}>
            <View style={[styles.chainIndicator, { backgroundColor: getChainColor(blockchain) }]} />
            <Text style={styles.blockchainTitle}>{blockchain}</Text>
          </View>
          <View style={styles.blockchainStats}>
            <Text style={styles.tokenCount}>{blockchainTokens.length} {t('tokens')}</Text>
              <Text style={styles.blockchainValue}>
                {currencySymbol}{totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
          </View>
        </View>
        
        <FlatList
          data={blockchainTokens}
          renderItem={renderToken}
          keyExtractor={(token, index) => `${blockchain}-${token.id || token.address}-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
  <Text style={styles.loadingText}>{t('loading_portfolio')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tokens.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t('no_tokens_found')}</Text>
        <Text style={styles.emptySubtext}>{t('track_wallets_to_see_portfolio')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSortButtons()}
      
      {sortBy === 'chain' ? (
        // Only group by blockchain when sorting by chain
        <FlatList
          data={Object.entries(getTokensByBlockchain())}
          renderItem={renderBlockchainSection}
          keyExtractor={([blockchain]) => blockchain}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // For all other sorting options, show flat list of all tokens
        <FlatList
          data={sortedTokens}
          renderItem={renderToken}
          keyExtractor={(item, index) => `${item.id || item.address}-${index}`}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
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
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Sort Controls
  sortContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  sortButtonTextActive: {
    color: '#fff',
  },

  // Token Cards
  tokenCard: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenNameSection: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },

  // Big Chain Badge
  chainBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  chainText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Values Grid
  valuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  valueLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  performanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  performancePositive: {
    color: '#2ecc71',
    backgroundColor: '#e8f5e8',
  },
  performanceNegative: {
    color: '#e74c3c',
    backgroundColor: '#fdeaea',
  },

  // Price and Address
  addressText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  addressLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 6,
    fontWeight: '600'
  },
  addressValue: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    flex: 1
  },

  // Blockchain Sections
  blockchainSection: {
    marginBottom: 24,
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  blockchainTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  blockchainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  blockchainStats: {
    alignItems: 'flex-end',
  },
  tokenCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  blockchainValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
});