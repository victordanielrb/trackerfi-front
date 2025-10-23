import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useWalletTokens, Token } from '../hooks/useWalletTokens';

interface TokenDisplayProps {
  groupByBlockchain?: boolean;
  showWalletAddress?: boolean;
  onTokenPress?: (token: Token & { wallet_address: string; blockchain: string }) => void;
}

export default function TokenDisplay({ 
  groupByBlockchain = false, 
  showWalletAddress = true,
  onTokenPress 
}: TokenDisplayProps) {
  const { 
    wallets, 
    walletTokens, 
    loading, 
    refreshing, 
    error, 
    refreshData,
    getAllTokens,
    getTokensByBlockchain 
  } = useWalletTokens();

  const allTokens = getAllTokens();
  const tokensByBlockchain = getTokensByBlockchain();

  const renderToken = ({ item }: { item: Token & { wallet_address: string; blockchain: string } }) => (
    <TouchableOpacity 
      style={styles.tokenCard}
      onPress={() => onTokenPress?.(item)}
    >
      <View style={styles.tokenHeader}>
        <View style={styles.tokenInfo}>
          <View style={styles.tokenNameRow}>
            <Text style={styles.tokenName}>{item.name}</Text>
            <Text style={styles.tokenSymbol}>({item.symbol})</Text>
          </View>
          {item.value && !isNaN(parseFloat(item.value.toString())) && (
            <Text style={styles.tokenValue}>
              ${parseFloat(item.value.toString()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Text>
          )}
        </View>
        <View style={[styles.chainBadge, { backgroundColor: getChainColor(item.chain) }]}>
          <Text style={styles.chainText}>{item.chain}</Text>
        </View>
      </View>
      
      <View style={styles.tokenDetails}>
        {item.quantity && !isNaN(parseFloat(item.quantity || '0')) && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Balance:</Text>
            <Text style={styles.detailValue}>
              {parseFloat(item.quantity || '0').toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 6
              })} {item.symbol}
            </Text>
          </View>
        )}
        
        {item.price && !isNaN(parseFloat(item.price.toString())) && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.detailValue}>
                ${parseFloat(item.price.toString()).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })}
              </Text>
              {item.price_change_24h !== undefined && !isNaN(item.price_change_24h || 0) && (
                <Text style={[
                  styles.priceChange,
                  (item.price_change_24h || 0) >= 0 ? styles.priceChangePositive : styles.priceChangeNegative
                ]}>
                  {(item.price_change_24h || 0) >= 0 ? '+' : ''}{((item.price_change_24h || 0) * 100).toFixed(2)}%
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
      
      <Text style={styles.tokenAddress} numberOfLines={1}>
        Contract: {item.address}
      </Text>
      
      {showWalletAddress && (
        <Text style={styles.walletAddress} numberOfLines={1}>
          Wallet: {item.wallet_address}
        </Text>
      )}
      
      <View style={styles.tokenFooter}>
        <Text style={styles.tokenType}>Type: {item.position_type}</Text>
        {item.updated_at && (
          <Text style={styles.lastUpdated}>
            Updated: {new Date(item.updated_at).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderBlockchainSection = ({ item }: { item: [string, (Token & { wallet_address: string })[]] }) => {
    const [blockchain, tokens] = item;
    
    return (
      <View style={styles.blockchainSection}>
        <View style={styles.blockchainHeader}>
          <Text style={styles.blockchainTitle}>{blockchain}</Text>
          <Text style={styles.tokenCount}>{tokens.length} tokens</Text>
        </View>
        
        <FlatList
          data={tokens.map(token => ({ ...token, blockchain }))}
          renderItem={renderToken}
          keyExtractor={(item, index) => `${blockchain}-${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const getChainColor = (blockchain: string) => {
    switch (blockchain) {
      case 'EVM': return '#627EEA';
      case 'SOLANA': return '#9945FF';
      case 'SUI': return '#6FBCF0';
      default: return '#666';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tokens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (wallets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No wallets connected</Text>
        <Text style={styles.emptySubtext}>Connect a wallet to view your tokens</Text>
      </View>
    );
  }

  if (allTokens.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tokens found</Text>
        <Text style={styles.emptySubtext}>
          {Object.keys(walletTokens).length === 0 
            ? 'Loading wallet data...' 
            : 'Your wallets don\'t contain any tokens'
          }
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (groupByBlockchain) {
    return (
      <FlatList
        data={Object.entries(tokensByBlockchain)}
        renderItem={renderBlockchainSection}
        keyExtractor={([blockchain]) => blockchain}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      data={allTokens}
      renderItem={renderToken}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
      }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  refreshButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
  },
  blockchainSection: {
    marginBottom: 24,
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  blockchainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenCount: {
    fontSize: 14,
    color: '#666',
  },
  tokenCard: {
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
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  chainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chainText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenQuantity: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    marginBottom: 4,
  },
  tokenAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  tokenType: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  tokenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  tokenDetails: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceChangePositive: {
    color: '#2ecc71',
    backgroundColor: '#e8f5e8',
  },
  priceChangeNegative: {
    color: '#e74c3c',
    backgroundColor: '#fdeaea',
  },
  tokenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
});