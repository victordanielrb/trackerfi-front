import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl, API_CONFIG } from '../../constants/api';

export default function TokensScreen() {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newAlertToken, setNewAlertToken] = useState('');
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [newAlertType, setNewAlertType] = useState<'price_above' | 'price_below'>('price_above');

  useEffect(() => {
    fetchFavorites();
    fetchAlerts();
  }, []);

  const fetchFavorites = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.TRACKING.TOKENS);
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data || []);
    } catch (e) {
      console.warn('Failed to load tokens', e);
    }
  };

  const fetchAlerts = async () => {
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.TRACKING.ALERTS);
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.warn('Failed to load alerts', e);
    }
  };

  const createAlert = async () => {
    if (!newAlertToken || !newAlertThreshold) {
      Alert.alert('Erro', 'Token e limite são obrigatórios');
      return;
    }

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.TRACKING.ALERTS);
      const payload = {
        token: { symbol: newAlertToken },
        price_threshold: Number(newAlertThreshold),
        alert_type: newAlertType
      };
      await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      setNewAlertToken('');
      setNewAlertThreshold('');
      fetchAlerts();
    } catch (e) {
      console.warn('Failed to create alert', e);
      Alert.alert('Erro', 'Não foi possível criar alerta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tokens - Favoritos</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item, idx) => String(item.id || item.address || idx)}
        renderItem={({ item }) => (
          <View style={styles.tokenRow}>
            <Text style={styles.tokenText}>{item.symbol || item.name || item.address}</Text>
            <Text style={styles.tokenSub}>{item.value ? `$${Number(item.value).toFixed(2)}` : ''}</Text>
          </View>
        )}
      />

      <View style={styles.section}>
        <Text style={styles.title}>Alertas</Text>
        <FlatList
          data={alerts}
          keyExtractor={(a, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.alertRow}>
              <Text>{item.token?.symbol || item.token?.address} - {item.alert_type} {item.price_threshold}</Text>
              <Text style={styles.small}>{item.last_triggered ? `Triggered: ${item.last_triggered}` : ''}</Text>
            </View>
          )}
        />

        <View style={styles.formRow}>
          <TextInput placeholder="Token symbol/address" value={newAlertToken} onChangeText={setNewAlertToken} style={styles.input} />
          <TextInput placeholder="Price threshold" value={newAlertThreshold} onChangeText={setNewAlertThreshold} style={styles.input} keyboardType="numeric" />
        </View>
        <View style={styles.formRow}> 
          <TouchableOpacity style={[styles.btn, newAlertType === 'price_above' ? styles.btnPrimary : styles.btnOutline]} onPress={() => setNewAlertType('price_above')}>
            <Text style={styles.btnText}>Acima</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, newAlertType === 'price_below' ? styles.btnPrimary : styles.btnOutline]} onPress={() => setNewAlertType('price_below')}>
            <Text style={styles.btnText}>Abaixo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCreate} onPress={createAlert}><Text style={styles.btnText}>Criar</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  tokenRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tokenText: { fontSize: 16 },
  tokenSub: { color: '#666' },
  section: { marginTop: 24 },
  alertRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  small: { color: '#999', fontSize: 12 },
  formRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginRight: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  btnPrimary: { backgroundColor: '#34C759' },
  btnOutline: { borderWidth: 1, borderColor: '#ccc' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnCreate: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 }
});
