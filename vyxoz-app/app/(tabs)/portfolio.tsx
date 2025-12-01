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
import * as Print from 'expo-print';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useWalletTracking, TrackedWalletToken } from '../../hooks/useWalletTracking';
import { useFuturesPositions } from '../../hooks/useFuturesPositions';
import PortfolioTokenDisplay from '../../components/PortfolioTokenDisplay';
import FuturesPositionsDisplay from '../../components/FuturesPositionsDisplay';
import PortfolioChart from '../../components/PortfolioChart';
import TransactionHistoryModal from '../../components/TransactionHistoryModal';
import { useSettings } from '../../contexts/SettingsContext';
import { AppTheme } from '@/constants/theme';

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
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

  const generatePortfolioPDFHTML = (
    totalValue: number,
    change24h: { abs: number; pct: number },
    topHoldings: TrackedWalletToken[]
  ) => {
    const holdingsRows = topHoldings.map((token, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${token.symbol}</td>
        <td>${token.name}</td>
        <td>${Number(token.quantity || 0).toFixed(4)}</td>
        <td>${currencySymbol}${Number(token.price || 0).toFixed(2)}</td>
        <td>${currencySymbol}${convertCurrency(Number(token.value || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="color: ${(token.price_change_24h || 0) >= 0 ? '#34C759' : '#FF3B30'}">${((token.price_change_24h || 0) * 100).toFixed(2)}%</td>
      </tr>
    `).join('');

    const changeSign = change24h.abs >= 0 ? '+' : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Portfolio Report - TrackerFi</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              color: #333;
              max-width: 900px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #007AFF;
            }
            .logo { font-size: 32px; font-weight: 900; color: #007AFF; margin-bottom: 8px; }
            .subtitle { color: #666; font-size: 14px; }
            .date { color: #999; font-size: 12px; margin-top: 8px; }
            
            .summary-card {
              background: linear-gradient(135deg, #007AFF 0%, #00C6FF 100%);
              border-radius: 16px;
              padding: 32px;
              color: white;
              text-align: center;
              margin-bottom: 32px;
            }
            .total-label { font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
            .total-value { font-size: 42px; font-weight: 800; margin: 12px 0; }
            .change { font-size: 18px; }
            .change-value { font-weight: 700; }
            
            .stats-row { display: flex; justify-content: center; gap: 40px; margin-top: 20px; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: 700; }
            .stat-label { font-size: 12px; opacity: 0.8; text-transform: uppercase; }
            
            .section { margin-bottom: 32px; }
            .section-title { 
              font-size: 18px; 
              font-weight: 700; 
              color: #333; 
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 12px;
            }
            th { 
              background-color: #f8f9fa; 
              color: #333;
              font-weight: 600;
              text-align: left;
              padding: 12px 8px;
              border-bottom: 2px solid #dee2e6;
            }
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #eee;
            }
            tr:hover { background-color: #f8f9fa; }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TrackerFi</div>
            <div class="subtitle">${t('portfolio_report')}</div>
            <div class="date">${t('generated_on')} ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div class="summary-card">
            <div class="total-label">${t('total_value')}</div>
            <div class="total-value">${currencySymbol}${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="change">
              <span class="change-value">${changeSign}${currencySymbol}${Math.abs(convertCurrency(change24h.abs)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>(${changeSign}${(change24h.pct * 100).toFixed(2)}%)</span>
              <span style="opacity: 0.7; margin-left: 4px;">${t('24h_change')}</span>
            </div>
            <div class="stats-row">
              <div class="stat">
                <div class="stat-value">${getWalletCount()}</div>
                <div class="stat-label">${t('tracked_wallets')}</div>
              </div>
              <div class="stat">
                <div class="stat-value">${getTokenCount()}</div>
                <div class="stat-label">${t('tokens')}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🏆 ${t('top_holdings')}</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t('symbol')}</th>
                  <th>${t('name')}</th>
                  <th>${t('quantity')}</th>
                  <th>${t('price')}</th>
                  <th>${t('value')}</th>
                  <th>${t('24h')}</th>
                </tr>
              </thead>
              <tbody>
                ${holdingsRows || `<tr><td colspan="7" style="text-align: center; color: #999;">${t('no_holdings')}</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>${t('generated_by_trackerfi')}</p>
            <p>trackerfi.app</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportPortfolioPDF = async () => {
    try {
      const totalValue = getTotalValue();
      const change24h = getTotal24hChange();
      
      // Get top 10 holdings sorted by value
      const topHoldings = [...tokens]
        .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
        .slice(0, 10);

      const html = generatePortfolioPDFHTML(totalValue, change24h, topHoldings);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: 'application/pdf',
          dialogTitle: t('share_portfolio_report')
        });
      } else {
        Alert.alert(t('export_pdf'), t('pdf_saved_to') + ': ' + uri);
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert(t('error'), t('failed_to_export_pdf'));
    }
  };

  // Share modal state and ref for future capture-to-image
  const [shareVisible, setShareVisible] = useState(false);
  const [transactionsVisible, setTransactionsVisible] = useState(false);
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
            <Ionicons name="share-outline" size={20} color="#fff" />
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="share-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.shareActionText}>{t('share_portfolio')}</Text>
              </View>
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
            <Ionicons name="wallet-outline" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setTransactionsVisible(true)}
          >
            <Ionicons name="receipt-outline" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={refreshAll}
          >
            <Ionicons name="refresh-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportPortfolioPDF}
          >
            <Ionicons name="document-text-outline" size={22} color={AppTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History Modal */}
      <TransactionHistoryModal
        visible={transactionsVisible}
        onClose={() => setTransactionsVisible(false)}
      />

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
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
    paddingTop: 60,
    backgroundColor: AppTheme.colors.card,
  },
  welcomeText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  usernameText: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
  },
  summaryContainer: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    padding: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.card,
  },
  sectionTitle: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    marginHorizontal: AppTheme.spacing.xs,
    marginBottom: AppTheme.spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.xs,
  },
  statLabel: {
    ...AppTheme.typography.small,
    padding: AppTheme.spacing.xs,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    marginTop: 0,
    padding: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.card,
  },
  chartContainer: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    marginTop: 0,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.lg,
    ...AppTheme.shadows.card,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    marginHorizontal: AppTheme.spacing.xs,
    alignItems: 'center',
  },
  actionButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  exportButton: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    marginHorizontal: AppTheme.spacing.xs,
    alignItems: 'center',
  },
  exportButtonText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  portfolioContainer: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    marginTop: 0,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.card,
    paddingTop: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.lg,
    marginBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
    marginBottom: AppTheme.spacing.lg,
  },
  addWalletButton: {
    backgroundColor: AppTheme.colors.success,
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
  },
  addWalletButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginRight: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: AppTheme.colors.card,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
  },
  shareCard: {
    width: 340,
    height: 500,
    borderRadius: AppTheme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.xl,
  },
  shareTitle: {
    ...AppTheme.typography.body,
    fontWeight: '700',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  shareValue: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.primary,
    marginBottom: 6,
  },
  shareChange: {
    ...AppTheme.typography.body,
    fontWeight: '700',
    marginBottom: AppTheme.spacing.md,
  },
  shareMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  shareMeta: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
  },
  shareActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  shareActionButton: {
    flex: 1,
    marginHorizontal: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareActionText: {
    color: AppTheme.colors.card,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: AppTheme.colors.border,
  },
  shareAttribution: {
    fontSize: 10,
    color: AppTheme.colors.textLight,
    marginTop: AppTheme.spacing.sm,
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
    color: AppTheme.colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareHeader: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  shareAppName: {
    fontSize: 24,
    fontWeight: '900',
    color: AppTheme.colors.card,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: AppTheme.spacing.xs,
  },
  shareSubtitle: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareContent: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  shareTotalLabel: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: AppTheme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareTotalValue: {
    fontSize: 36,
    fontWeight: '900',
    color: AppTheme.colors.card,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: AppTheme.spacing.md,
  },
  shareChangeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: AppTheme.spacing.sm,
  },
  shareChangeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: AppTheme.colors.card,
    marginRight: AppTheme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shareChangePercent: {
    ...AppTheme.typography.sectionTitle,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shareTimeLabel: {
    ...AppTheme.typography.small,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: AppTheme.spacing.md,
  },
  shareStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: AppTheme.spacing.md,
    marginTop: 6,
  },
  shareStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: AppTheme.borderRadius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    minWidth: 72,
    marginHorizontal: 6,
  },
  shareStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: AppTheme.colors.card,
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
    ...AppTheme.typography.small,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: AppTheme.spacing.xs,
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
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
});