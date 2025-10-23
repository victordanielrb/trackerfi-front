import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWalletTracking } from '../../hooks/useWalletTracking';
import PortfolioTokenDisplay from '../../components/PortfolioTokenDisplay';

export default function HomeScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  
  const {
    trackedWallets,
    tokens,
    loading,
    error,
    refreshTokens,
  } = useWalletTracking();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const getTotalValue = () => {
    return tokens.reduce((total, token) => {
      return total + (token.value || 0);
    }, 0);
  };

  const getWalletCount = () => trackedWallets.length;
  const getTokenCount = () => tokens.length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshTokens} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Portfolio Overview</Text>
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ${getTotalValue().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        <View style={styles.statsGrid}>
          
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getWalletCount()}</Text>
            <Text style={styles.statLabel}>Tracked Wallets</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTokenCount()}</Text>
            <Text style={styles.statLabel}>Total Tokens</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/wallets')}
          >
            <Text style={styles.actionButtonText}>📁 Manage Wallets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={refreshTokens}
          >
            <Text style={styles.actionButtonText}>🔄 Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Token Portfolio */}
      <View style={styles.portfolioContainer}>
        <Text style={styles.sectionTitle}>Token Holdings</Text>
        
        {trackedWallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Wallets Tracked</Text>
            <Text style={styles.emptySubtitle}>
              Add wallets to track to see your portfolio
            </Text>
            <TouchableOpacity 
              style={styles.addWalletButton}
              onPress={() => router.push('/(tabs)/wallets')}
            >
              <Text style={styles.addWalletButtonText}>+ Track Your First Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PortfolioTokenDisplay
            tokens={tokens}
            loading={loading}
            error={error}
            onRefresh={refreshTokens}
            showWalletAddress={true}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryContainer: {
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
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  portfolioContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addWalletButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addWalletButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});