import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  Image,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWalletTracking } from '../../hooks/useWalletTracking';
import { useFuturesPositions } from '../../hooks/useFuturesPositions';
import PortfolioTokenDisplay from '../../components/PortfolioTokenDisplay';
import FuturesPositionsDisplay from '../../components/FuturesPositionsDisplay';
import PortfolioChart from '../../components/PortfolioChart';
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
    walletSummaries,
  } = useWalletTracking();

  const {
    positions: futuresPositions,
    loading: futuresLoading,
    error: futuresError,
    errors: futuresErrors,
    refetch: refetchFutures,
  } = useFuturesPositions();

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

  const getTotal24hChange = () => {
    // Sum wallet-level changes exposed by the hook
    if (!walletSummaries) return { abs: 0, pct: 0 };
    const entries = Object.values(walletSummaries);
    const abs = entries.reduce((s, w) => s + (w.totalChange || 0), 0);
    const totalVal = entries.reduce((s, w) => s + (w.totalValue || 0), 0);
    const pct = totalVal !== 0 ? abs / totalVal : 0;
    return { abs, pct };
  };

  const getWalletCount = () => trackedWallets.length;
  const getTokenCount = () => tokens.length;

  const refreshAll = async () => {
    await Promise.all([
      refreshTokens(),
      refetchFutures()
    ]);
  };
  const exportPortfolioPDF = () => {
    // TODO: implement PDF export. Placeholder for now.
    Alert.alert(t('export_pdf'), t('export_pdf') + ' — TODO');
    // Future implementation: collect visible portfolio data, render to PDF
    // and trigger share / save flow.
  };

  // Share modal state and ref for future capture-to-image
  const [shareVisible, setShareVisible] = useState(false);
  const shareRef = useRef<ViewShot | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const convertCurrency = (v?: number) => {
    if (!v) return 0;
    if (currency === 'USD') return v;
    if (currency === 'BRL' && prices?.brl) return v * prices.brl;
    if (currency === 'EUR' && prices?.eur) return v * prices.eur;
    return v;
  };

  const onSharePress = useCallback(async () => {
    try {
      if (!shareRef.current?.capture) {
        // Fallback to text share if capture fails
        const total = getTotalValue();
        const change = getTotal24hChange();
        const abs = convertCurrency(change.abs);
        const pct = change.pct * 100;
        const msg = `${t('portfolio_overview')}\n${t('total_value')}: ${currencySymbol}${total.toFixed(2)}\n24h: ${abs >= 0 ? '+' : ''}${currencySymbol}${abs.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
        await Share.share({ message: msg });
        return;
      }

      // Capture the share card as image
      const uri = await shareRef.current.capture();
      setCapturedUri(uri);

      console.log('Captured portfolio card:', uri);

      // Verify file exists (debug) and use expo-sharing for robust native sharing
      try {
        const info = await FileSystem.getInfoAsync(uri);
        console.log('Share file info:', info);
      } catch (fsErr) {
        console.warn('Failed to stat file before sharing', fsErr);
      }
      // On Android convert file:// URI to content:// via FileSystem.getContentUriAsync
      let shareUri = uri;
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(uri);
          console.log('Converted to content URI:', contentUri);
          shareUri = contentUri;
        } catch (e) {
          console.warn('getContentUriAsync failed, will try raw file URI', e);
        }
      }

      // Use expo-sharing which handles Android/iOS file URIs in Expo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, { dialogTitle: `My Portfolio - ${t('portfolio_overview')}` });
      } else {
        // Fallback to text share if sharing module not available
        await Share.share({ message: `My Portfolio Performance - ${t('portfolio_overview')} (image at ${shareUri})` });
      }

    } catch (err) {
      console.error('Share failed:', err);
      // Fallback to text share
      try {
        const total = getTotalValue();
        const change = getTotal24hChange();
        const abs = convertCurrency(change.abs);
        const pct = change.pct * 100;
        const msg = `${t('portfolio_overview')}\n${t('total_value')}: ${currencySymbol}${total.toFixed(2)}\n24h: ${abs >= 0 ? '+' : ''}${currencySymbol}${abs.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
        await Share.share({ message: msg });
      } catch (fallbackErr) {
        console.error('Fallback share also failed:', fallbackErr);
        Alert.alert('Share Error', 'Unable to share portfolio');
      }
    }
  }, [currencySymbol, currency, prices, t, getTotalValue, getTotal24hChange, convertCurrency]);

  const getGradientColors = (): readonly [string, string, string] => {
    const change = getTotal24hChange();
    const pct = change.pct;
    
    if (pct > 0.001) { // Positive (green gradient)
      return ['#34C759', '#28A745', '#1E7B32'] as const;
    } else if (pct < -0.001) { // Negative (red gradient)
      return ['#FF3B30', '#DC2626', '#B91C1C'] as const;
    } else { // Neutral (gray gradient)
      return ['#8E8E93', '#6D6D70', '#48484A'] as const;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading || futuresLoading} onRefresh={refreshAll} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{t('welcome_back')}</Text>
          <Text style={styles.usernameText}>{user?.username || t('user')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={() => setShareVisible(true)}>
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Share modal (instagram-style card) */}
      <Modal visible={shareVisible} animationType="slide" transparent onRequestClose={() => setShareVisible(false)}>
        <View style={styles.modalOverlay}>
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShareVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <ViewShot 
            ref={shareRef}
            options={{ 
              fileName: "portfolio-card", 
              format: "png", 
              quality: 0.9 
            }}
          >
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareCard}
            >
              {/* Header */}
              <View style={styles.shareHeader}>
                <Text style={styles.shareAppName}>TrackerFi</Text>
                <Text style={styles.shareSubtitle}>{t('portfolio_overview')}</Text>
              </View>

              {/* Main Content */}
              <View style={styles.shareContent}>
                <Text style={styles.shareTotalLabel}>{t('total_value')}</Text>
                <Text style={styles.shareTotalValue}>
                  {currencySymbol}{getTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                
                <View style={styles.shareChangeContainer}>
                  {(() => {
                    const change = getTotal24hChange();
                    const abs = convertCurrency(change.abs);
                    const pct = change.pct * 100;
                    return (
                      <>
                        <Text style={styles.shareChangeValue}>
                          {abs >= 0 ? '+' : ''}{currencySymbol}{Math.abs(abs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={styles.shareChangePercent}>
                          ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                        </Text>
                      </>
                    );
                  })()}
                </View>
                
                <Text style={styles.shareTimeLabel}>{t('24h_change')}</Text>

                {/* Additional Stats */}
                <View style={styles.shareStatsRow}>
                  <View style={styles.shareStatItem}>
                    <Text style={styles.shareStatValue}>{getWalletCount()}</Text>
                    <Text style={styles.shareStatLabel}>{t('tracked_wallets')}</Text>
                  </View>
                  <View style={styles.shareStatItem}>
                    <Text style={styles.shareStatValue}>{getTokenCount()}</Text>
                    <Text style={styles.shareStatLabel}>{t('tokens')}</Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.shareFooter}>
                <Text style={styles.shareFooterText}>{t('track_your_crypto_portfolio')}</Text>
                <Text style={styles.shareWatermark}>trackerfi.app</Text>
              </View>
            </LinearGradient>
          </ViewShot>

          {/* Action Buttons */}
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.shareActionButton} onPress={onSharePress}>
              <Text style={styles.shareActionText}>📤 {t('share_portfolio')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            {/* 24h change */}
            {(() => {
              const change = getTotal24hChange();
              const abs = change.abs;
              const pct = change.pct;
              const color = abs >= 0 ? '#34C759' : '#FF3B30';
              return (
                <Text style={[styles.statLabel, { marginTop: 6, color }] }>
                  {abs >= 0 ? '+' : ''}{currencySymbol}{Math.abs(abs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pct >= 0 ? '+' : ''}{(pct * 100).toFixed(2)}%)
                </Text>
              );
            })()}
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
            <Text style={styles.actionButtonText}>📁  {'>'} </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={refreshAll}
          >
            <Text style={styles.actionButtonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportPortfolioPDF}
          >
            <Text style={styles.exportButtonText}>📄 {'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Portfolio Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('portfolio_history')}</Text>
        <PortfolioChart onPress={() => router.push('/wallets')} />
      </View>

      {/* Futures Positions */}
      <View style={styles.portfolioContainer}>
        <Text style={styles.sectionTitle}>{t('futures_positions')}</Text>
        
        <FuturesPositionsDisplay
          positions={futuresPositions}
          loading={futuresLoading}
          error={futuresError}
          errors={futuresErrors || []}
          onRefresh={refetchFutures}
        />
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
  },  actionsContainer: {
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
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
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
  exportButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#007AFF',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginRight: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareCard: {
    width: 340,
    height: 500,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  shareValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 6,
  },
  shareChange: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  shareMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  shareMeta: {
    fontSize: 12,
    color: '#666',
  },
  shareActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  shareActionButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#ccc',
  },
  shareAttribution: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // New gradient share card styles
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shareAppName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  shareSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareContent: {
    alignItems: 'center',
    marginBottom: 12,
    flex: 1,
    justifyContent: 'center',
  },
  shareTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareTotalValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  shareChangeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  shareChangeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginRight: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shareChangePercent: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shareTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  shareStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  shareStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 72,
    marginHorizontal: 6,
  },
  shareStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  shareStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  shareFooter: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  shareFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  shareWatermark: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'lowercase',
  },
  cancelActionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelActionText: {
    color: '#fff',
    fontWeight: '600',
  },
});