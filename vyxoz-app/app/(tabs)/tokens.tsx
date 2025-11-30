import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ScrollView, Modal, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl, API_CONFIG } from '../../constants/api';
import { useTranslation } from 'react-i18next';
import TradingChart from '../../components/TradingChart';

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
          <ActivityIndicator style={styles.searchLoader} size="small" color="#007AFF" />
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
          <Text style={styles.alertsHeaderBtnText}>🔔 Alertas</Text>
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
              <Text style={styles.tokenText}>{item.symbol || item.name || item.address}</Text>
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
              <ActivityIndicator size="large" color="#007AFF" style={{ margin: 20 }} />
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
                      <Text style={styles.alertToken}>{item.token_symbol || item.token?.symbol || 'Unknown'}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  alertsHeaderBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertsHeaderBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tokenRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  favoriteTokenRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  tokenText: { fontSize: 16 },
  tokenSub: { color: '#666' },
  section: { marginTop: 24 },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f2f2f2', backgroundColor: '#fff' },
  small: { color: '#999', fontSize: 12 },
  formRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  btnPrimary: { backgroundColor: '#34C759' },
  btnOutline: { borderWidth: 1, borderColor: '#ccc' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnCreate: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  
  // Search styles
  searchContainer: { marginVertical: 16, position: 'relative' },
  searchInput: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#ddd',
    fontSize: 16
  },
  searchLoader: { position: 'absolute', right: 12, top: 12 },
  searchResultsContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 300
  },
  searchResultItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchResultSymbol: { 
    fontSize: 16, 
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 8,
    minWidth: 60
  },
  searchResultName: { fontSize: 14, color: '#666', flex: 1 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  modalScrollView: {
    padding: 20,
    flexGrow: 1
  },
  closeBtn: { 
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8
  },
  closeBtnText: { fontSize: 24, color: '#666' },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  modalSymbol: { fontSize: 16, color: '#666', marginBottom: 16 },
  
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: { fontSize: 16, color: '#666' },
  detailValue: { fontSize: 16, fontWeight: '600' },
  
  chartBtn: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 16,
    alignItems: 'center'
  },
  chartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  favoriteBtn: { 
    backgroundColor: '#34C759', 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 8,
    alignItems: 'center'
  },
  favoriteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  removeBtn: { 
    backgroundColor: '#FF3B30', 
    padding: 8, 
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80
  },
  removeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  tradingSection: { 
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  tradingText: { fontSize: 14, marginVertical: 2 },
  ohlcText: { fontSize: 12, color: '#666', marginVertical: 2, fontFamily: 'monospace' },
  
  backBtn: { 
    backgroundColor: '#666', 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 8,
    alignItems: 'center'
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
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
  alertToken: { fontSize: 16, fontWeight: '700', color: '#333' },
  alertDetail: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 16, fontStyle: 'italic' },
  
  // Modal Alert Section
  modalAlertSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  createAlertBtn: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  createAlertBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  alertForm: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  alertFormLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  alertInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveAlertBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveAlertBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
