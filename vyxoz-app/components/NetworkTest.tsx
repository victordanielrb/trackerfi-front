import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const NetworkTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testEndpoints = [
    'http://localhost:3000/health',
    'http://localhost:3000/api/auth/login',
    'http://127.0.0.1:3000/health',
    'http://192.168.1.100:3000/health',
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const newResults: string[] = [];

    for (const endpoint of testEndpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 5000 });
        newResults.push(`✅ ${endpoint}: ${response.status} - ${JSON.stringify(response.data).substring(0, 50)}`);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          newResults.push(`❌ ${endpoint}: Connection refused - Backend not running`);
        } else if (error.code === 'ENOTFOUND') {
          newResults.push(`❌ ${endpoint}: Host not found`);
        } else if (error.code === 'ETIMEDOUT') {
          newResults.push(`❌ ${endpoint}: Timeout`);
        } else {
          newResults.push(`❌ ${endpoint}: ${error.message}`);
        }
      }
    }

    setResults(newResults);
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Connectivity Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Network Connection'}
        </Text>
      </TouchableOpacity>

      <View style={styles.results}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>

      {results.length > 0 && (
        <Text style={styles.info}>
          💡 If all tests fail, make sure your backend is running on localhost:3000
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  info: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    fontSize: 14,
  },
});

export default NetworkTest;