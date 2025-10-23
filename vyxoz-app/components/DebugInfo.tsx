import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { API_CONFIG, getApiUrl } from '../constants/api';

export default function DebugInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Info</Text>
      <Text style={styles.info}>Base URL: {API_CONFIG.BASE_URL}</Text>
      <Text style={styles.info}>Login URL: {getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN)}</Text>
      <Text style={styles.info}>Register URL: {getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});