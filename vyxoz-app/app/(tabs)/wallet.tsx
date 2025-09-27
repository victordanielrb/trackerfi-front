import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';

export default function WalletScreen() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const backendBase = 'http://localhost:3000'; // Change if your backend is remote

  async function fetchTokens() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${backendBase}/getTokensFromWallet`, { data: { wallet } });
      // Zerion returns grouped by chain; flatten into array
      const data = res.data;
      const flattened: any[] = [];
      Object.values(data).forEach((arr: any) => flattened.push(...(arr as any[])));
      setTokens(flattened);
    } catch (err: any) {
      setError(err.message || 'Error fetching tokens');
    } finally {
      setLoading(false);
    }
  }

  async function setPrices() {
    if (tokens.length === 0) return setError('No tokens to update');
    setLoading(true);
    setError(null);
    try {
      // Group tokens by chain
      const grouped: { [chain: string]: any[] } = {};
      tokens.forEach(t => {
        const chain = t.chain || 'ethereum';
        if (!grouped[chain]) grouped[chain] = [];
        grouped[chain].push(t);
      });

      const res = await axios.post(`${backendBase}/setPriceTokens`, { tokens: grouped });
      // result is array or object - handle gracefully
      const result = res.data;
      setTokens(prev => {
        // merge price into tokens using address or symbol
        return prev.map(p => {
          const found = (result as any[]).find?.(r => (r.address || '').toLowerCase() === (p.address || '').toLowerCase()) || (result as any)[p.address?.toLowerCase()];
          if (found) return { ...p, ...found };
          return p;
        });
      });
    } catch (err: any) {
      setError(err.message || 'Error setting prices');
    } finally {
      setLoading(false);
    }
  }

  function renderToken({ item }: { item: any }) {
    return (
      <View style={styles.tokenRow}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price ? `$${item.price}` : '—'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Tracker</Text>
      <TextInput
        placeholder="Enter wallet address"
        value={wallet}
        onChangeText={setWallet}
        style={styles.input}
        autoCapitalize="none"
      />
      <View style={styles.row}>
        <Button title="Fetch tokens" onPress={fetchTokens} />
        <View style={{ width: 8 }} />
        <Button title="Set prices" onPress={setPrices} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}

      <FlatList data={tokens} keyExtractor={(i) => i.id || i.address || i.symbol} renderItem={renderToken} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 12 },
  tokenRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  symbol: { fontWeight: '700' },
  name: { color: '#666' },
  price: { marginTop: 4 },
});
