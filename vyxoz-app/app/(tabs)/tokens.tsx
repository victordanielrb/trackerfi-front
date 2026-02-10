import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ScrollView, Modal, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl, API_CONFIG } from '../../constants/api';
import { useTranslation } from 'react-i18next';
import TradingChart from '../../components/TradingChart';
import { AppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
}

interface TokenDetail {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  mcap?: number;
  usd_24h_volume?: number;
  price_change_24h?: number;
  usd_24h_change?: number;
  icon_url?: string;
}

interface TokenTradingData {
  id: string;
  symbol: string;
  name: string;
  current_price_usd: number | null;
  price_change_percentage_1h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_14d: number | null;
  price_change_percentage_30d: number | null;
  price_change_percentage_200d: number | null;
  price_change_percentage_1y: number | null;
  high_24h_usd: number | null;
  low_24h_usd: number | null;
  ath_usd: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl_usd: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  market_cap_usd: number | null;
  total_volume_24h_usd: number | null;
  
  // OHLC data for different timeframes [timestamp, open, high, low, close]
  ohlc_1d?: Array<[number, number, number, number, number]>;
  ohlc_7d?: Array<[number, number, number, number, number]>;
  ohlc_14d?: Array<[number, number, number, number, number]>;
  ohlc_30d?: Array<[number, number, number, number, number]>;
  ohlc_90d?: Array<[number, number, number, number, number]>;
  ohlc_180d?: Array<[number, number, number, number, number]>;
  ohlc_365d?: Array<[number, number, number, number, number]>;
  
  // Price data for different timeframes [timestamp, price]
  prices_1d?: Array<[number, number]>;
  prices_7d?: Array<[number, number]>;
  prices_14d?: Array<[number, number]>;
  prices_30d?: Array<[number, number]>;
  prices_90d?: Array<[number, number]>;
  prices_180d?: Array<[number, number]>;
  prices_365d?: Array<[number, number]>;
  
  // Legacy fields for backward compatibility
  ohlc_24h?: Array<[number, number, number, number, number]>;
  prices_24h?: Array<[number, number]>;
  
  last_updated: string;
}

export default function TokensScreen() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newAlertToken, setNewAlertToken] = useState('');
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [newAlertType, setNewAlertType] = useState<'price_above' | 'price_below'>('price_above');
  
  // Token search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Token detail modal state
  const [selectedToken, setSelectedToken] = useState<TokenDetail | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Trading data modal state
  const [tradingData, setTradingData] = useState<TokenTradingData | null>(null);
  const [chartModalVisible, setChartModalVisible] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Alert creation state
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertsModalVisible, setAlertsModalVisible] = useState(false);

  useEffect(() => {
    fetchFavorites();
    fetchAlerts();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const timer = setTimeout(() => {
      searchTokens(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchTokens = async (query: string) => {
    try {
      setSearchLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const res = await axios.get(`${baseUrl}/api/tokens/all?search=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(res.data.tokens || []);
      setShowSearchResults(true);
    } catch (e) {
      console.warn('Failed to search tokens', e);
    } finally {
      setSearchLoading(false);
    }
  };

  const onTokenSelect = async (tokenId: string) => {
    try {
      setShowSearchResults(false);
      setDetailLoading(true);
      setDetailModalVisible(true);
      
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const res = await axios.get(`${baseUrl}/api/tokens/details/${tokenId}`);
      setSelectedToken(res.data);
    } catch (e) {
      console.warn('Failed to load token details', e);
      Alert.alert('Erro', 'Não foi possível carregar detalhes do token');
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadTradingData = async (tokenId: string) => {
    try {
      setChartLoading(true);
      setChartModalVisible(true);
      
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const res = await axios.get(`${baseUrl}/api/tokens/trading/${tokenId}`);
      setTradingData(res.data);
    } catch (e) {
      console.warn('Failed to load trading data', e);
      Alert.alert('Erro', 'Não foi possível carregar dados de trading');
      setChartModalVisible(false);
    } finally {
      setChartLoading(false);
    }
  };

  const addToFavorites = async (tokenId: string) => {
    try {
      const url = getApiUrl(`/api/users/favorites/${tokenId}`);
      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('Sucesso', 'Token adicionado aos favoritos!');
      fetchFavorites();
      // Clear search after adding to favorites
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
      setDetailModalVisible(false);
    } catch (e) {
      console.warn('Failed to add to favorites', e);
      Alert.alert('Erro', 'Não foi possível adicionar aos favoritos');
    }
  };

  const removeFromFavorites = async (tokenId: string) => {
    try {
      const url = getApiUrl(`/api/users/favorites/${tokenId}`);
      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('Sucesso', 'Token removido dos favoritos!');
      fetchFavorites();
    } catch (e) {
      console.warn('Failed to remove from favorites', e);
      Alert.alert('Erro', 'Não foi possível remover dos favoritos');
    }
  };

  const fetchFavorites = async () => {
    try {
      const url = getApiUrl('/api/users/favorites');
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data.favorites || []);
    } catch (e) {
      console.warn('Failed to load favorites', e);
    }
  };

  const fetchAlerts = async () => {
    try {
      const url = getApiUrl('/api/tracking/alerts');
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(res.data.alerts || []);
    } catch (e: any) {
      console.warn('Failed to load alerts:', e.message);
    }
  };

  const createAlert = async () => {
    if (!selectedToken || !newAlertThreshold) {
      Alert.alert('Erro', 'Token e limite são obrigatórios');
      return;
    }

    try {
      const url = getApiUrl('/api/tracking/alerts');
      const payload = {
        token_id: selectedToken.id,
        token_symbol: selectedToken.symbol,
        token_name: selectedToken.name,
        price_threshold: Number(newAlertThreshold),
        alert_type: newAlertType
      };
      await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      setNewAlertToken('');
      setNewAlertThreshold('');
      setIsCreatingAlert(false);
      Alert.alert('Sucesso', 'Alerta criado!');
      fetchAlerts();
    } catch (e) {
      console.warn('Failed to create alert', e);
      Alert.alert('Erro', 'Não foi possível criar alerta');
    }
  };

  const deleteAlert = async (index: number) => {
    try {
      const url = getApiUrl(`/api/tracking/alerts/${index}`);
      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      fetchAlerts();
    } catch (e) {
      console.warn('Failed to delete alert', e);
      Alert.alert('Erro', 'Não foi possível remover o alerta');
    }
  };

  return (
    <View style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tokens')}</Text>
        <Text style={styles.headerSubtitle}>{t('track_favorite_tokens')}</Text>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar token (Bitcoin, ETH, etc.)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => {
            console.log("submit",searchQuery);
            
            if (searchQuery.length >= 2) {
              searchTokens(searchQuery);
            }
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchLoading && (
          <ActivityIndicator style={styles.searchLoader} size="small" color={AppTheme.colors.primary} />
        )}
      </View>

      {/* Search Results Dropdown */}
      {showSearchResults && searchResults.length > 0 && (
        <ScrollView style={styles.searchResultsContainer} nestedScrollEnabled={true}>
          {searchResults.map((token) => (
            <TouchableOpacity
              key={token.id}
              style={styles.searchResultItem}
              onPress={() => onTokenSelect(token.id)}
            >
              <Text style={styles.searchResultSymbol}>{token.symbol.toUpperCase()}</Text>
              <Text style={styles.searchResultName}>{token.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.title}>Tokens - Favoritos</Text>
        <TouchableOpacity 
          style={styles.alertsHeaderBtn}
          onPress={async () => {
            await fetchAlerts(); // Refresh alerts before opening modal
            setAlertsModalVisible(true);
          }}
        >
          <Text style={styles.alertsHeaderBtnText}>
            <Ionicons name="notifications-outline" size={16} color="#fff" /> Alertas
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        scrollEnabled={false}
        data={favorites}
        keyExtractor={(item, idx) => String(item.id || item.address || idx)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.favoriteTokenRow}
            onPress={() => item.id && onTokenSelect(item.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.tokenText}>{item.symbol?.toUpperCase() || item.name || item.address}</Text>
              <Text style={styles.tokenSub}>{item.value ? `$${Number(item.value).toFixed(2)}` : ''}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeBtn} 
              onPress={(e) => {
                e.stopPropagation();
                removeFromFavorites(item.id);
              }}
            >
              <Text style={styles.removeBtnText}>Remover</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Token Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailLoading ? (
              <ActivityIndicator size="large" color={AppTheme.colors.primary} style={{ margin: 20 }} />
            ) : selectedToken ? (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailModalVisible(false)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedToken.name}</Text>
                <Text style={styles.modalSymbol}>{selectedToken.symbol?.toUpperCase()}</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Preço Atual</Text>
                  <Text style={styles.detailValue}>${selectedToken.price?.toFixed(2) || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Market Cap</Text>
                  <Text style={styles.detailValue}>${selectedToken.mcap?.toLocaleString() || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Volume 24h</Text>
                  <Text style={styles.detailValue}>${selectedToken.usd_24h_volume?.toLocaleString() || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mudança 24h</Text>
                  <Text style={[styles.detailValue, { color: (selectedToken.usd_24h_change || 0) >= 0 ? '#34C759' : '#FF3B30' }]}>
                    {(selectedToken.usd_24h_change || 0) >= 0 ? '+' : ''}{selectedToken.usd_24h_change?.toFixed(2)}%
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.chartBtn} 
                  onPress={() => {
                    if (selectedToken.id) loadTradingData(selectedToken.id);
                  }}
                >
                  <Text style={styles.chartBtnText}>Ver Dados de Trading</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.favoriteBtn} 
                  onPress={() => {
                    if (selectedToken.id) addToFavorites(selectedToken.id);
                  }}
                >
                  <Text style={styles.favoriteBtnText}>Adicionar aos Favoritos</Text>
                </TouchableOpacity>

                {/* New Alert Section */}
                <View style={styles.modalAlertSection}>
                  <TouchableOpacity 
                    style={styles.createAlertBtn}
                    onPress={() => setIsCreatingAlert(!isCreatingAlert)}
                  >
                    <Text style={styles.createAlertBtnText}>
                      {isCreatingAlert ? 'Cancelar Alerta' : 'Criar Alerta de Preço'}
                    </Text>
                  </TouchableOpacity>
                  
                  {isCreatingAlert && (
                    <View style={styles.alertForm}>
                      <Text style={styles.alertFormLabel}>Me avise quando o preço for:</Text>
                      <View style={styles.alertTypeContainer}>
                        <TouchableOpacity 
                          style={[styles.typeBtn, newAlertType === 'price_above' ? styles.typeBtnActive : null]} 
                          onPress={() => setNewAlertType('price_above')}
                        >
                          <Text style={[styles.typeBtnText, newAlertType === 'price_above' ? styles.typeBtnTextActive : null]}>Acima de</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.typeBtn, newAlertType === 'price_below' ? styles.typeBtnActive : null]} 
                          onPress={() => setNewAlertType('price_below')}
                        >
                          <Text style={[styles.typeBtnText, newAlertType === 'price_below' ? styles.typeBtnTextActive : null]}>Abaixo de</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TextInput 
                        placeholder="Preço alvo (USD)" 
                        value={newAlertThreshold} 
                        onChangeText={setNewAlertThreshold} 
                        style={styles.alertInput} 
                        keyboardType="numeric" 
                      />
                      
                      <TouchableOpacity style={styles.saveAlertBtn} onPress={createAlert}>
                        <Text style={styles.saveAlertBtnText}>Salvar Alerta</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Alerts List Modal */}
      <Modal visible={alertsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 300 }]}>
            <ScrollView style={{ padding: 20 }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setAlertsModalVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Meus Alertas</Text>
              
              {alerts.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum alerta configurado.</Text>
              ) : (
                alerts.map((item, index) => (
                  <View key={index} style={styles.alertRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.alertToken}>{item.token_symbol?.toUpperCase() || item.token?.symbol?.toUpperCase() || 'Unknown'}</Text>
                      <Text style={styles.alertDetail}>
                        {item.alert_type === 'price_above' ? 'Acima de' : 'Abaixo de'} ${item.price_threshold ?? 'N/A'}
                      </Text>
                      {item.last_triggered ? (
                        <Text style={styles.small}>Disparado: {new Date(item.last_triggered).toLocaleString()}</Text>
                      ) : null}
                      <Text style={styles.small}>Disparos: {item.triggered_count || 0}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteAlert(index)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Trading Data Chart Modal */}
      <Modal visible={chartModalVisible} animationType="slide" transparent>
        <View style={styles.chartModalOverlay}>
          <View style={styles.chartModalContent}>
            <TradingChart 
              data={tradingData} 
              loading={chartLoading} 
              onClose={() => setChartModalVisible(false)} 
            />
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    backgroundColor: AppTheme.colors.card,
    paddingHorizontal: AppTheme.spacing.xl,
    paddingTop: 60,
    paddingBottom: AppTheme.spacing.lg,
  },
  headerTitle: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  headerSubtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  container: { 
    flex: 1, 
    padding: AppTheme.spacing.md, 
    backgroundColor: AppTheme.colors.background 
  },
  title: { 
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm, 
    marginTop: AppTheme.spacing.md 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
  },
  alertsHeaderBtn: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.sm,
  },
  alertsHeaderBtnText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  tokenRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: AppTheme.spacing.sm, 
    borderBottomWidth: 1, 
    borderBottomColor: AppTheme.colors.border, 
    backgroundColor: AppTheme.colors.card 
  },
  favoriteTokenRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: AppTheme.spacing.md, 
    paddingHorizontal: AppTheme.spacing.md,
    borderBottomWidth: 1, 
    borderBottomColor: AppTheme.colors.border, 
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.sm,
    marginBottom: AppTheme.spacing.xs,
    ...AppTheme.shadows.card,
  },
  tokenText: { 
    ...AppTheme.typography.body,
    color: AppTheme.colors.textDark,
  },
  tokenSub: { 
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.small,
  },
  section: { marginTop: AppTheme.spacing.xl },
  alertRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: AppTheme.spacing.sm, 
    borderBottomWidth: 1, 
    borderBottomColor: AppTheme.colors.cardInner, 
    backgroundColor: AppTheme.colors.card 
  },
  small: { 
    color: AppTheme.colors.textLight, 
    ...AppTheme.typography.small,
  },
  formRow: { 
    flexDirection: 'row', 
    marginTop: AppTheme.spacing.md, 
    alignItems: 'center' 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: AppTheme.colors.border, 
    padding: AppTheme.spacing.sm, 
    borderRadius: AppTheme.borderRadius.sm, 
    marginRight: AppTheme.spacing.sm, 
    backgroundColor: AppTheme.colors.card 
  },
  btn: { 
    paddingVertical: 10, 
    paddingHorizontal: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.sm 
  },
  btnPrimary: { backgroundColor: AppTheme.colors.success },
  btnOutline: { borderWidth: 1, borderColor: AppTheme.colors.border },
  btnText: { color: AppTheme.colors.card, fontWeight: '700' },
  btnCreate: { 
    backgroundColor: AppTheme.colors.primary, 
    paddingVertical: 10, 
    paddingHorizontal: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.sm, 
    marginLeft: AppTheme.spacing.sm 
  },
  
  // Search styles
  searchContainer: { marginVertical: AppTheme.spacing.md, position: 'relative' },
  searchInput: { 
    backgroundColor: AppTheme.colors.card, 
    padding: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.md, 
    borderWidth: 1, 
    borderColor: AppTheme.colors.border,
    ...AppTheme.typography.body,
  },
  searchLoader: { position: 'absolute', right: AppTheme.spacing.md, top: AppTheme.spacing.md },
  searchResultsContainer: { 
    backgroundColor: AppTheme.colors.card, 
    borderRadius: AppTheme.borderRadius.md, 
    marginTop: AppTheme.spacing.sm,
    ...AppTheme.shadows.card,
    maxHeight: 300
  },
  searchResultItem: { 
    padding: AppTheme.spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: AppTheme.colors.cardInner,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchResultSymbol: { 
    ...AppTheme.typography.body,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    marginRight: AppTheme.spacing.sm,
    minWidth: 60
  },
  searchResultName: { 
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted, 
    flex: 1 
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    ...AppTheme.shadows.card,
  },
  modalScrollView: {
    padding: AppTheme.spacing.lg,
    flexGrow: 1
  },
  closeBtn: { 
    alignSelf: 'flex-end',
    padding: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.sm
  },
  closeBtnText: { fontSize: 24, color: AppTheme.colors.textMuted },
  modalTitle: { 
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs, 
    marginTop: AppTheme.spacing.sm 
  },
  modalSymbol: { 
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted, 
    marginBottom: AppTheme.spacing.md 
  },
  
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.cardInner
  },
  detailLabel: { 
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted 
  },
  detailValue: { 
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.textDark,
  },
  
  chartBtn: { 
    backgroundColor: AppTheme.colors.primary, 
    padding: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.md, 
    marginTop: AppTheme.spacing.md,
    alignItems: 'center'
  },
  chartBtnText: { 
    color: AppTheme.colors.card, 
    ...AppTheme.typography.body,
    fontWeight: '700' 
  },
  
  favoriteBtn: { 
    backgroundColor: AppTheme.colors.success, 
    padding: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.md, 
    marginTop: AppTheme.spacing.sm,
    alignItems: 'center'
  },
  favoriteBtnText: { 
    color: AppTheme.colors.card, 
    ...AppTheme.typography.body,
    fontWeight: '700' 
  },
  
  removeBtn: { 
    backgroundColor: AppTheme.colors.danger, 
    padding: AppTheme.spacing.sm, 
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
    minWidth: 80
  },
  removeBtnText: { 
    color: AppTheme.colors.textDark, 
    ...AppTheme.typography.body,
    fontWeight: '600' 
  },
  
  tradingSection: { 
    marginBottom: AppTheme.spacing.md,
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.sm
  },
  sectionTitle: { 
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm 
  },
  tradingText: { 
    ...AppTheme.typography.body,
    marginVertical: 2 
  },
  ohlcText: { 
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted, 
    marginVertical: 2, 
    fontFamily: 'monospace' 
  },
  
  backBtn: { 
    backgroundColor: AppTheme.colors.textMuted, 
    padding: AppTheme.spacing.md, 
    borderRadius: AppTheme.borderRadius.md, 
    marginTop: AppTheme.spacing.sm,
    alignItems: 'center'
  },
  backBtnText: { 
    color: AppTheme.colors.card, 
    ...AppTheme.typography.body,
    fontWeight: '600' 
  },
  
  // Chart modal styles - fullscreen
  chartModalOverlay: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  chartModalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // Alert styles
  alertToken: { 
    ...AppTheme.typography.body,
    fontWeight: '700', 
    color: AppTheme.colors.textDark 
  },
  alertDetail: { 
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted, 
    marginTop: 2 
  },
  emptyText: { 
    textAlign: 'center', 
    color: AppTheme.colors.textLight, 
    marginTop: AppTheme.spacing.md, 
    fontStyle: 'italic' 
  },
  
  // Modal Alert Section
  modalAlertSection: {
    marginTop: AppTheme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    paddingTop: AppTheme.spacing.md,
  },
  createAlertBtn: {
    backgroundColor: AppTheme.colors.primaryLight,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
  },
  createAlertBtnText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  alertForm: {
    marginTop: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
  },
  alertFormLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginBottom: AppTheme.spacing.md,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: AppTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card,
  },
  typeBtnActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  typeBtnText: {
    color: AppTheme.colors.textDark,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: AppTheme.colors.card,
  },
  alertInput: {
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    marginBottom: AppTheme.spacing.md,
  },
  saveAlertBtn: {
    backgroundColor: AppTheme.colors.primary,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
  },
  saveAlertBtnText: {
    color: AppTheme.colors.card,
    fontWeight: '700',
    ...AppTheme.typography.body,
  },
});
