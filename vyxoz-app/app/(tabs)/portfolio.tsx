import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useSettings } from '../../contexts/SettingsContext';

export default function HomeScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { currency, prices } = useSettings();
  const currencySymbol = (() => {
    switch (currency) {
      case 'BRL': return 'R$';
      case 'EUR': return '€';
      default: return '$';
    }
  })();
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
    const conv = (v?: number) => {
      if (!v) return 0;
      if (currency === 'USD') return v;
      if (currency === 'BRL' && prices?.brl) return v * prices.brl;
      if (currency === 'EUR' && prices?.eur) return v * prices.eur;
      return v;
    };

    return tokens.reduce((total, token) => {
      return total + conv(Number(token.value || 0));
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
          <Text style={styles.welcomeText}>{t('welcome_back')}</Text>
          <Text style={styles.usernameText}>{user?.username || t('user')}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summaryContainer}>
  <Text style={styles.sectionTitle}>{t('portfolio_overview')}</Text>
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currencySymbol}{getTotalValue().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Text>
            <Text style={styles.statLabel}>{t('total_value')}</Text>
          </View>
        <View style={styles.statsGrid}>
          
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getWalletCount()}</Text>
            <Text style={styles.statLabel}>{t('tracked_wallets')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTokenCount()}</Text>
            <Text style={styles.statLabel}>{t('total_tokens')}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
  <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/wallets')}
          >
            <Text style={styles.actionButtonText}>📁 {t('manage_wallets')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={refreshTokens}
          >
            <Text style={styles.actionButtonText}>🔄 {t('refresh_data')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Token Portfolio */}
      <View style={styles.portfolioContainer}>
  <Text style={styles.sectionTitle}>{t('token_holdings')}</Text>
        
        {trackedWallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('no_wallets_tracked')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('add_wallets_to_see_portfolio')}
            </Text>
            <TouchableOpacity 
              style={styles.addWalletButton}
              onPress={() => router.push('/wallets')}
            >
              <Text style={styles.addWalletButtonText}>+ {t('track_first_wallet')}</Text>
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
    padding: 4,
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