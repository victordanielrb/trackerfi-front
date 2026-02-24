import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions, TransactionWithMeta, Transaction } from '../hooks/useTransactions';
import { useWalletTracking, TrackedWallet } from '../hooks/useWalletTracking';
import { AppTheme } from '@/constants/theme';

interface TransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const TRANSACTION_TYPES = [
  { value: '', label: 'all_types' },
  { value: 'send', label: 'send' },
  { value: 'receive', label: 'receive' },
  { value: 'trade', label: 'trade' },
  { value: 'approve', label: 'approve' },
  { value: 'bid', label: 'bid' },
  { value: 'burn', label: 'burn' },
  { value: 'claim', label: 'claim' },
  { value: 'delegate', label: 'delegate' },
  { value: 'deploy', label: 'deploy' },
  { value: 'deposit', label: 'deposit' },
  { value: 'execute', label: 'execute' },
  { value: 'mint', label: 'mint' },
  { value: 'revoke', label: 'revoke' },
  { value: 'revoke_delegation', label: 'revoke_delegation' },
  { value: 'withdraw', label: 'withdraw' },
];

const CHAINS = [
  { value: '', label: 'all_chains' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'base', label: 'Base' },
  { value: 'bsc', label: 'BSC' },
  { value: 'avalanche', label: 'Avalanche' },
];

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    transactions,
    loading,
    refreshing,
    error,
    totalCount,
    filter,
    fetchTransactions,
    refreshTransactions,
    updateFilter,
    clearFilter,
  } = useTransactions();
  
  const { trackedWallets } = useWalletTracking();
  
  const getLocalizedType = (type: string) => {
    const key = `tx_${type}`;
    const translation = t(key);
    return translation !== key ? translation : type.charAt(0).toUpperCase() + type.slice(1);
  };

  const [showFilters, setShowFilters] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  // Details modal
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithMeta | null>(null);

  // Fetch transactions when modal opens
  useEffect(() => {
    if (visible) {
      fetchTransactions();
    }
  }, [visible]);

  const handleWalletChange = (walletAddress: string) => {
    setSelectedWallet(walletAddress);
    updateFilter({ wallet_address: walletAddress || undefined });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    updateFilter({ type: type || undefined });
  };

  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    updateFilter({ chain: chain || undefined });
  };

  const handleClearFilters = () => {
    setSelectedWallet('');
    setSelectedType('');
    setSelectedChain('');
    clearFilter();
  };

  const handleRefresh = () => {
    refreshTransactions(selectedWallet || undefined);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address?: string) => {
    if (!address) return '—';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string): React.ReactNode => {
    const iconSize = 16;
    const iconColor = '#6B7280';
    switch (type) {
      case 'send':
        return <Ionicons name="arrow-up" size={iconSize} color="#FF3B30" />;
      case 'receive':
        return <Ionicons name="arrow-down" size={iconSize} color="#34C759" />;
      case 'trade':
        return <Ionicons name="swap-horizontal" size={iconSize} color={iconColor} />;
      case 'approve':
        return <Ionicons name="checkmark" size={iconSize} color={iconColor} />;
      case 'bid':
        return <Ionicons name="pricetag" size={iconSize} color={iconColor} />;
      case 'burn':
        return <Ionicons name="flame" size={iconSize} color="#FF6B35" />;
      case 'claim':
        return <Ionicons name="gift" size={iconSize} color={iconColor} />;
      case 'delegate':
        return <Ionicons name="people" size={iconSize} color={iconColor} />;
      case 'deploy':
        return <Ionicons name="cube" size={iconSize} color={iconColor} />;
      case 'deposit':
        return <Ionicons name="download" size={iconSize} color="#34C759" />;
      case 'execute':
        return <Ionicons name="flash" size={iconSize} color="#FFB800" />;
      case 'mint':
        return <MaterialCommunityIcons name="circle-multiple" size={iconSize} color="#FFB800" />;
      case 'revoke':
        return <Ionicons name="close-circle" size={iconSize} color="#FF3B30" />;
      case 'revoke_delegation':
        return <Ionicons name="lock-closed" size={iconSize} color={iconColor} />;
      case 'withdraw':
        return <Ionicons name="arrow-up-circle" size={iconSize} color="#FF3B30" />;
      default:
        return <Ionicons name="ellipse" size={8} color={iconColor} />;
    }
  };

  const getTransactionColor = (type: string, direction?: string) => {
    if (direction === 'in' || type === 'receive') return '#34C759';
    if (direction === 'out' || type === 'send') return '#FF3B30';
    switch (type) {
      case 'trade':
        return '#007AFF';
      case 'approve':
        return '#FF9F0A';
      case 'deposit':
      case 'mint':
        return '#34C759';
      case 'withdraw':
      case 'burn':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const openExplorer = (hash: string, chain?: string) => {
    let explorerUrl = '';
    switch (chain) {
      case 'ethereum':
        explorerUrl = `https://etherscan.io/tx/${hash}`;
        break;
      case 'polygon':
        explorerUrl = `https://polygonscan.com/tx/${hash}`;
        break;
      case 'arbitrum':
        explorerUrl = `https://arbiscan.io/tx/${hash}`;
        break;
      case 'optimism':
        explorerUrl = `https://optimistic.etherscan.io/tx/${hash}`;
        break;
      case 'base':
        explorerUrl = `https://basescan.org/tx/${hash}`;
        break;
      case 'bsc':
        explorerUrl = `https://bscscan.com/tx/${hash}`;
        break;
      case 'avalanche':
        explorerUrl = `https://snowtrace.io/tx/${hash}`;
        break;
      default:
        explorerUrl = `https://etherscan.io/tx/${hash}`;
    }
    Linking.openURL(explorerUrl);
  };

  const formatValue = (tx: TransactionWithMeta) => {
    const sumTransferValue = tx.transaction.transfers?.reduce((acc: number, t: any) => {
      const val = t?.value;
      return acc + (typeof val === 'number' ? Math.abs(val) : 0);
    }, 0) || 0;
    return tx.transaction.type === 'trade' && sumTransferValue > 0 ? `$${sumTransferValue.toFixed(2)}` : '--';
  };
  const renderTransactionItem = ({ item }: { item: TransactionWithMeta }) => {
    const tx = item.transaction;
    const transfer = tx.transfers?.[0];
    const tokenSymbol = transfer?.fungible_info?.symbol || '—';
    const tokenAmount = transfer?.quantity?.float;
    const tokenIcon = transfer?.fungible_info?.icon?.url;
    const color = getTransactionColor(tx.type, tx.direction);

    // Compute display value: only show for trade (swap) transactions
    const sumTransferValue = tx.transfers?.reduce((acc: number, t: any) => {
      const val = t?.value;
      return acc + (typeof val === 'number' ? Math.abs(val) : 0);
    }, 0) || 0;
    const displayValue = tx.type === 'trade' && sumTransferValue > 0 ? `$${sumTransferValue.toFixed(2)}` : '--';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => {
          setSelectedTransaction(item);
          setDetailsVisible(true);
        }}
      >
        <View style={styles.txLeft}>
          <View style={[styles.txIconContainer, { backgroundColor: color + '20' }]}>
            <Text style={[styles.txIcon, { color }]}>
              {getTransactionIcon(tx.type)}
            </Text>
          </View>
          <View style={styles.txInfo}>
            <Text style={styles.txType}>{getLocalizedType(tx.type)}</Text>
            <Text style={styles.txSubtitle}>{formatAddress(tx.hash || tx.id)} • {item.chain}</Text>
            <Text style={styles.txDate}>{formatDate(tx.mined_at)}</Text>
          </View>
        </View>
        <View style={styles.txRight}>
          <View style={styles.txTokenRow}>
            {tokenIcon && (
              <Image source={{ uri: tokenIcon }} style={styles.tokenIcon} />
            )}
            <Text style={[styles.txAmount, { color }]}>
              {tx.direction === 'in' ? '+' : tx.direction === 'out' ? '-' : ''}
              {tokenAmount?.toFixed(4) || '—'} {tokenSymbol}
            </Text>
          </View>
            <Text style={styles.txValue}>
              {displayValue}
            </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: '#627EEA',
      polygon: '#8247E5',
      arbitrum: '#28A0F0',
      optimism: '#FF0420',
      base: '#0052FF',
      bsc: '#F0B90B',
      avalanche: '#E84142',
    };
    return colors[chain] || '#888';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('transaction_history')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? t('hide_filters') : t('show_filters')} 🔽
          </Text>
          {(selectedWallet || selectedType || selectedChain) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {[selectedWallet, selectedType, selectedChain].filter(Boolean).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Details modal for a specific transaction */}
        <Modal
          visible={detailsVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setDetailsVisible(false)}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setDetailsVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{t('transaction_details') || 'Details'}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={{ padding: 16 }}>
              {selectedTransaction ? (
                <View>
                  {/* Header Section */}
                  <View style={styles.detailHeader}>
                    <View style={[styles.detailIconContainer, { backgroundColor: getTransactionColor(selectedTransaction.transaction.type) + '20' }]}>
                      <Text style={[styles.detailIcon, { color: getTransactionColor(selectedTransaction.transaction.type) }]}>
                        {getTransactionIcon(selectedTransaction.transaction.type)}
                      </Text>
                    </View>
                    <Text style={styles.detailType}>{getLocalizedType(selectedTransaction.transaction.type)}</Text>
                    <Text style={styles.detailDate}>{formatDate(selectedTransaction.transaction.mined_at)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: selectedTransaction.transaction.status === 'confirmed' ? '#E8F5E9' : '#FFEBEE' }]}>
                      <Text style={[styles.statusText, { color: selectedTransaction.transaction.status === 'confirmed' ? '#2E7D32' : '#C62828' }]}>
                        {selectedTransaction.transaction.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Details Section */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('chain') || 'Chain'}</Text>
                      <Text style={styles.detailValue}>{selectedTransaction.chain}</Text>
                    </View>
                    
                    {selectedTransaction.transaction.protocol && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('protocol') || 'Protocol'}</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.transaction.protocol}</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('wallet')}</Text>
                      <Text style={styles.detailValue}>{formatAddress(selectedTransaction.wallet_address)}</Text>
                    </View>

                    {selectedTransaction.transaction.address_from && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('from') || 'From'}</Text>
                        <Text style={styles.detailValue}>{formatAddress(selectedTransaction.transaction.address_from)}</Text>
                      </View>
                    )}

                    {selectedTransaction.transaction.address_to && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('to') || 'To'}</Text>
                        <Text style={styles.detailValue}>{formatAddress(selectedTransaction.transaction.address_to)}</Text>
                      </View>
                    )}

                    {selectedTransaction.transaction.fee && selectedTransaction.transaction.fee.value != null && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('fee') || 'Fee'}</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.transaction.fee.value.toFixed(6)} {selectedTransaction.transaction.fee.fungible_info.symbol} 
                          {selectedTransaction.transaction.fee.price ? ` ($${selectedTransaction.transaction.fee.price.toFixed(2)})` : ''}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t('hash') || 'Hash'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={[styles.detailValue, { marginRight: 8, flex: 0 }]} numberOfLines={1} ellipsizeMode="middle">
                          {formatAddress(selectedTransaction.transaction.hash || selectedTransaction.transaction.id)}
                        </Text>
                        <TouchableOpacity 
                          style={styles.copyButtonSmall} 
                          onPress={async () => { await Clipboard.setStringAsync(selectedTransaction.transaction.hash || selectedTransaction.transaction.id); }}
                        >
                          <Text style={styles.copyButtonTextSmall}>{t('copy') || 'Copy'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Transfers Section */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>{t('transfers') || 'Transfers'}</Text>
                    {selectedTransaction.transaction.transfers && selectedTransaction.transaction.transfers.length > 0 ? (
                      selectedTransaction.transaction.transfers.map((tr: any, idx: number) => (
                        <View key={idx} style={styles.transferCard}>
                          <View style={styles.transferHeader}>
                            <Text style={styles.transferSymbol}>{tr.fungible_info?.symbol || '—'}</Text>
                            <Text style={[styles.transferAmount, { color: tr.direction === 'in' ? '#34C759' : '#FF3B30' }]}>
                              {tr.direction === 'in' ? '+' : '-'}{tr.quantity?.float ? tr.quantity.float.toFixed(4) : '—'}
                            </Text>
                          </View>
                          <View style={styles.transferDetails}>
                            <Text style={styles.transferDetailText}>{t('value') || 'Value'}: {typeof tr.value === 'number' ? `$${tr.value.toFixed(2)}` : '--'}</Text>
                            <Text style={styles.transferDetailText}>{t('direction') || 'Direction'}: {tr.direction}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>{t('no_transfers') || 'No transfers available'}</Text>
                    )}
                  </View>

                  <View style={{ marginTop: 24, marginBottom: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.detailActionButton} onPress={() => { openExplorer(selectedTransaction.transaction.hash || selectedTransaction.transaction.id, selectedTransaction.chain); }}>
                      <Text style={styles.detailActionText}>{t('open_in_explorer') || 'Open in Explorer'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.detailActionButton, { backgroundColor: '#f0f0f0' }]} onPress={() => setDetailsVisible(false)}>
                      <Text style={[styles.detailActionText, { color: '#333' }]}>{t('close') || 'Close'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text>{t('no_transaction_selected') || 'No transaction selected'}</Text>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Wallet Selector */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>{t('wallet')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.chip, !selectedWallet && styles.chipActive]}
                  onPress={() => handleWalletChange('')}
                >
                  <Text style={[styles.chipText, !selectedWallet && styles.chipTextActive]}>
                    {t('all_wallets')}
                  </Text>
                </TouchableOpacity>
                {trackedWallets.map((wallet: TrackedWallet) => (
                  <TouchableOpacity
                    key={wallet.address}
                    style={[styles.chip, selectedWallet === wallet.address && styles.chipActive]}
                    onPress={() => handleWalletChange(wallet.address)}
                  >
                    <Text style={[styles.chipText, selectedWallet === wallet.address && styles.chipTextActive]}>
                      {formatAddress(wallet.address)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Type Selector */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>{t('type')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                {TRANSACTION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.chip, selectedType === type.value && styles.chipActive]}
                    onPress={() => handleTypeChange(type.value)}
                  >
                    <Text style={[styles.chipText, selectedType === type.value && styles.chipTextActive]}>
                      {t(type.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Chain Selector */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>{t('chain')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                {CHAINS.map(chain => (
                  <TouchableOpacity
                    key={chain.value}
                    style={[styles.chip, selectedChain === chain.value && styles.chipActive]}
                    onPress={() => handleChainChange(chain.value)}
                  >
                    <Text style={[styles.chipText, selectedChain === chain.value && styles.chipTextActive]}>
                      {chain.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
              <Text style={styles.clearButtonText}>{t('clear_filters')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {t('showing_transactions', { count: transactions.length, total: totalCount })}
          </Text>
        </View>

        {/* Transaction List */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchTransactions()}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => `${item.wallet_address}-${item.transaction.id}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>{t('loading_transactions')}</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color="#6B7280" />
                  <Text style={styles.emptyTitle}>{t('no_transactions')}</Text>
                  <Text style={styles.emptySubtitle}>{t('no_transactions_description')}</Text>
                </View>
              )
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.colors.cardInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: AppTheme.colors.textDark,
  },
  title: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  filterToggleText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  filterBadge: {
    marginLeft: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: AppTheme.colors.card,
    paddingHorizontal: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  filterRow: {
    marginTop: AppTheme.spacing.md,
  },
  filterLabel: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: 20,
    marginRight: AppTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  chipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  chipText: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: AppTheme.colors.card,
  },
  clearButton: {
    marginTop: AppTheme.spacing.md,
    paddingVertical: 10,
    backgroundColor: '#ff3b3020',
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    color: AppTheme.colors.danger,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.background,
  },
  countText: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.sm,
    ...AppTheme.shadows.card,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIcon: {
    fontSize: 18,
  },
  txInfo: {
    marginLeft: AppTheme.spacing.md,
    flex: 1,
  },
  txType: {
    ...AppTheme.typography.body,
    fontWeight: 'bold',
    color: AppTheme.colors.textDark,
    textTransform: 'capitalize',
  },
  txSubtitle: {
    ...AppTheme.typography.small,
    fontWeight: '500',
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  txDate: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  txWallet: {
    fontSize: 11,
    color: AppTheme.colors.textLight,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: AppTheme.spacing.xs,
  },
  txAmount: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  txValue: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  txTypeLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 6,
  },
  copyButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  detailActionButton: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  detailActionText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  chainBadge: {
    marginTop: AppTheme.spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.xs,
  },
  chainText: {
    fontSize: 10,
    color: AppTheme.colors.card,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: AppTheme.spacing.md,
  },
  emptyTitle: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  emptySubtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.danger,
    marginBottom: AppTheme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: 10,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.sm,
  },
  retryText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  // New styles for details modal
  detailHeader: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
    paddingBottom: AppTheme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  detailIcon: {
    fontSize: 32,
  },
  detailType: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  detailDate: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginBottom: AppTheme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.md,
  },
  statusText: {
    ...AppTheme.typography.small,
    fontWeight: 'bold',
  },
  detailSection: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.cardInner,
  },
  detailLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    flex: 1,
  },
  detailValue: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textDark,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  sectionTitle: {
    ...AppTheme.typography.body,
    fontWeight: 'bold',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  transferCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  transferSymbol: {
    ...AppTheme.typography.body,
    fontWeight: 'bold',
    color: AppTheme.colors.textDark,
  },
  transferAmount: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  transferDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferDetailText: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.colors.textLight,
    fontStyle: 'italic',
    marginTop: AppTheme.spacing.md,
  },
  copyButtonSmall: {
    backgroundColor: AppTheme.colors.cardInner,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.xs,
  },
  copyButtonTextSmall: {
    fontSize: 10,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
});

export default TransactionHistoryModal;
