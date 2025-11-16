import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWalletTracking } from '../../hooks/useWalletTracking';
import { useExchangeManagement, ExchangeResponse } from '../../hooks/useExchangeManagement';
import { useTranslation } from 'react-i18next';
import AddTrackedWalletForm from '../../components/AddTrackedWalletForm';
import AddExchangeForm from '../../components/AddExchangeForm';
import EditExchangeForm from '../../components/EditExchangeForm';
import ConfirmDialog from '../../components/ConfirmDialog';

// Web-safe alert function
const showAlert = (title: string, message: string) => {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}: ${message}`);
  } else {
    console.warn(`${title}: ${message}`);
  }
};

export default function WalletsScreen() {
  const [activeTab, setActiveTab] = useState<'wallets' | 'exchanges'>('wallets');
  const [modalVisible, setModalVisible] = useState(false);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [editExchangeModal, setEditExchangeModal] = useState<{
    visible: boolean;
    exchange: ExchangeResponse | null;
  }>({
    visible: false,
    exchange: null,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    address: string;
    chain: string;
  }>({
    visible: false,
    address: '',
    chain: ''
  });
  const [exchangeConfirmDialog, setExchangeConfirmDialog] = useState<{
    visible: boolean;
    exchangeId: string;
    exchangeName: string;
  }>({
    visible: false,
    exchangeId: '',
    exchangeName: ''
  });
  
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const {
    trackedWallets,
    loading: walletsLoading,
    error: walletsError,
    addTrackedWallet,
    removeTrackedWallet,
    refetch: refetchWallets
  } = useWalletTracking();

  const {
    exchanges,
    loading: exchangesLoading,
    error: exchangesError,
    addExchange,
    updateExchange,
    removeExchange,
    refetch: refetchExchanges
  } = useExchangeManagement();

  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleAddWallet = async (address: string, chain: string) => {
    try {
      await addTrackedWallet(address, chain);
      setModalVisible(false);
    } catch (error: any) {
      throw error; // Let AddTrackedWalletForm handle the error display
    }
  };

  const handleAddExchange = async (name: string, apiKey: string, apiSecret: string) => {
    try {
      await addExchange(name, apiKey, apiSecret);
      setExchangeModalVisible(false);
      // addExchange already calls fetchExchanges internally, no need for manual refetch
    } catch (error: any) {
      throw error; // Let AddExchangeForm handle the error display
    }
  };

  const handleUpdateExchange = async (exchangeId: string, apiKey?: string, apiSecret?: string) => {
    try {
      await updateExchange(exchangeId, apiKey, apiSecret);
      setEditExchangeModal({ visible: false, exchange: null });
      showAlert(t('success'), t('exchange_updated'));
      // updateExchange already calls fetchExchanges internally, no need for manual refetch
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failed_update_exchange'));
    }
  };

  const handleRemoveWallet = async () => {
    try {
      await removeTrackedWallet(confirmDialog.address, confirmDialog.chain);
      setConfirmDialog({ visible: false, address: '', chain: '' });
      showAlert(t('success'), t('wallet_removed_from_tracking'));
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failed_remove_wallet'));
    }
  };

  const handleRemoveExchange = async () => {
    try {
      await removeExchange(exchangeConfirmDialog.exchangeId);
      setExchangeConfirmDialog({ visible: false, exchangeId: '', exchangeName: '' });
      showAlert(t('success'), t('exchange_removed'));
      // removeExchange already calls fetchExchanges internally, no need for manual refetch
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failed_remove_exchange'));
    }
  };

  const showDeleteConfirmation = (address: string, chain: string) => {
    setConfirmDialog({
      visible: true,
      address,
      chain
    });
  };

  const showExchangeDeleteConfirmation = (exchangeId: string, exchangeName: string) => {
    setExchangeConfirmDialog({
      visible: true,
      exchangeId,
      exchangeName
    });
  };

  const showEditExchange = (exchange: ExchangeResponse) => {
    setEditExchangeModal({
      visible: true,
      exchange
    });
  };

  const renderWallet = ({ item }: { item: { address: string; chain: string } }) => (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <View style={[styles.chainBadge, { backgroundColor: getChainColor(item.chain) }]}>
          <Text style={styles.chainText}>{item.chain}</Text>
        </View>
        <TouchableOpacity
          onPress={() => showDeleteConfirmation(item.address, item.chain)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>{t('remove')}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.addressText} numberOfLines={1}>
        {item.address}
      </Text>
      
      <Text style={styles.walletNote}>
        {t('tracking_wallet_note')}
      </Text>
    </View>
  );

  const renderExchange = ({ item }: { item: ExchangeResponse }) => (
    <View style={styles.exchangeCard}>
      <View style={styles.exchangeHeader}>
        <View style={[styles.exchangeBadge, { backgroundColor: getExchangeColor(item.name) }]}>
          <Text style={styles.exchangeText}>
            {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
          </Text>
        </View>
        <View style={styles.exchangeActions}>
          <TouchableOpacity
            onPress={() => showEditExchange(item)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{t('edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showExchangeDeleteConfirmation(item.id, item.name)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>{t('remove')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.apiKeyText}>
        {t('api_key')}: {item.api_key}
      </Text>
      
      <Text style={styles.exchangeNote}>
        {t('exchange_security_note')}
      </Text>
    </View>
  );

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'EVM': return '#627EEA';
      case 'SOLANA': return '#9945FF';
      case 'SUI': return '#4DA2FF';
      default: return '#666';
    }
  };

  const getExchangeColor = (exchange: string) => {
    switch (exchange.toLowerCase()) {
      case 'binance': return '#F3BA2F';
      case 'coinbase': return '#0052FF';
      case 'kraken': return '#5741D9';
      case 'kucoin': return '#24AE8F';
      case 'bybit': return '#F7A600';
      case 'okx': return '#000000';
      case 'huobi': return '#2FB5EB';
      case 'mexc': return '#0A84FF';
      case 'gate': return '#007BFF';
      default: return '#666';
    }
  };

  if ((activeTab === 'wallets' && walletsLoading && trackedWallets.length === 0) || 
      (activeTab === 'exchanges' && exchangesLoading && exchanges.length === 0)) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {activeTab === 'wallets' ? t('loading_tracked_wallets') : t('loading_exchanges')}
        </Text>
      </View>
    );
  }

  const currentLoading = activeTab === 'wallets' ? walletsLoading : exchangesLoading;
  const currentError = activeTab === 'wallets' ? walletsError : exchangesError;
  const currentRefetch = activeTab === 'wallets' ? refetchWallets : refetchExchanges;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('manage_wallets_exchanges')}</Text>
        
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'wallets' && styles.activeTabButton]}
            onPress={() => setActiveTab('wallets')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'wallets' && styles.activeTabButtonText]}>
              💼 {t('wallets')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'exchanges' && styles.activeTabButton]}
            onPress={() => setActiveTab('exchanges')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'exchanges' && styles.activeTabButtonText]}>
              🏦 {t('exchanges')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.portfolioButton}
            onPress={() => router.push('/portfolio')}
          >
            <Text style={styles.portfolioButtonText}>📊 {t('view_portfolio')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => activeTab === 'wallets' ? setModalVisible(true) : setExchangeModalVisible(true)}
          >
            <Text style={styles.addButtonText}>
              + {activeTab === 'wallets' ? t('track_wallet') : t('add_exchange')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{currentError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={currentRefetch}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'wallets' ? (
        // Wallets Tab Content
        trackedWallets.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{t('no_wallets_tracked')}</Text>
            <Text style={styles.emptySubtext}>
              {t('track_any_wallet_to_monitor')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={trackedWallets}
            renderItem={renderWallet}
            keyExtractor={(item) => `${item.address}-${item.chain}`}
            refreshControl={
              <RefreshControl refreshing={currentLoading} onRefresh={currentRefetch} />
            }
            contentContainerStyle={styles.listContainer}
          />
        )
      ) : (
        // Exchanges Tab Content
        exchanges.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{t('no_exchanges_added')}</Text>
            <Text style={styles.emptySubtext}>
              {t('add_exchange_to_manage_apis')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={exchanges}
            renderItem={renderExchange}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={currentLoading} onRefresh={currentRefetch} />
            }
            contentContainerStyle={styles.listContainer}
          />
        )
      )}

      {/* Add Wallet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <AddTrackedWalletForm
            onAddWallet={handleAddWallet}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </Modal>

      {/* Add Exchange Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exchangeModalVisible}
        onRequestClose={() => setExchangeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <AddExchangeForm
            onAddExchange={handleAddExchange}
            onCancel={() => setExchangeModalVisible(false)}
          />
        </View>
      </Modal>

      {/* Edit Exchange Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editExchangeModal.visible}
        onRequestClose={() => setEditExchangeModal({ visible: false, exchange: null })}
      >
        <View style={styles.modalContainer}>
          {editExchangeModal.exchange && (
            <EditExchangeForm
              exchange={editExchangeModal.exchange}
              onUpdateExchange={handleUpdateExchange}
              onCancel={() => setEditExchangeModal({ visible: false, exchange: null })}
            />
          )}
        </View>
      </Modal>

      {/* Delete Wallet Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={t('remove_tracked_wallet')}
        message={t('remove_tracked_wallet_message', { address: confirmDialog.address })}
        confirmText={t('remove')}
        cancelText={t('cancel')}
        onConfirm={handleRemoveWallet}
        onCancel={() => setConfirmDialog({ visible: false, address: '', chain: '' })}
      />

      {/* Delete Exchange Confirmation Dialog */}
      <ConfirmDialog
        visible={exchangeConfirmDialog.visible}
        title={t('remove_exchange')}
        message={t('remove_exchange_message', { exchange: exchangeConfirmDialog.exchangeName })}
        confirmText={t('remove')}
        cancelText={t('cancel')}
        onConfirm={handleRemoveExchange}
        onCancel={() => setExchangeConfirmDialog({ visible: false, exchangeId: '', exchangeName: '' })}
      />
    </View>
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
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    margin: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginVertical: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  headerButtons: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  portfolioButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  portfolioButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chainBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chainText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 8,
  },
  walletNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  // Exchange card styles
  exchangeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exchangeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exchangeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  exchangeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  apiKeyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 8,
  },
  exchangeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});