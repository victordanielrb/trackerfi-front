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
import AddTrackedWalletForm from '../../components/AddTrackedWalletForm';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    address: string;
    chain: string;
  }>({
    visible: false,
    address: '',
    chain: ''
  });
  
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const {
    trackedWallets,
    loading,
    error,
    addTrackedWallet,
    removeTrackedWallet,
    refetch
  } = useWalletTracking();

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

  const handleRemoveWallet = async () => {
    try {
      await removeTrackedWallet(confirmDialog.address, confirmDialog.chain);
      setConfirmDialog({ visible: false, address: '', chain: '' });
      showAlert('Success', 'Wallet removed from tracking list');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to remove wallet');
    }
  };

  const showDeleteConfirmation = (address: string, chain: string) => {
    setConfirmDialog({
      visible: true,
      address,
      chain
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
          <Text style={styles.deleteButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.addressText} numberOfLines={1}>
        {item.address}
      </Text>
      
      <Text style={styles.walletNote}>
        Tracking wallet across all supported blockchains
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

  if (loading && trackedWallets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tracked wallets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Wallets</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.portfolioButton}
            onPress={() => router.push('/(tabs)/portfolio')}
          >
            <Text style={styles.portfolioButtonText}>📊 View Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Track Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {trackedWallets.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No wallets tracked</Text>
          <Text style={styles.emptySubtext}>
            Track any wallet address to monitor their tokens
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={trackedWallets}
            renderItem={renderWallet}
            keyExtractor={(item) => `${item.address}-${item.chain}`}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} />
            }
            contentContainerStyle={styles.listContainer}
          />
        </>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title="Remove Tracked Wallet"
        message={`Stop tracking this wallet?\n\n${confirmDialog.address}`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveWallet}
        onCancel={() => setConfirmDialog({ visible: false, address: '', chain: '' })}
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
  headerButtons: {
    marginVertical:5,
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
  title: {
    margin:10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});