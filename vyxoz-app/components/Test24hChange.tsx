import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../constants/api';

interface TestResult {
  success: boolean;
  timestamp: string;
  testResults: {
    summary: {
      totalDuplicates: number;
      inconsistentChanges: number;
      inconsistentPrices: number;
      maxChangeVariance: number;
      maxPriceVariance: number;
    };
    issues: {
      inconsistentPriceChanges: number;
      inconsistentPrices: number;
      details: {
        priceChangeIssues: Array<{
          symbol: string;
          chain: string;
          contractAddress: string;
          variance: number;
          instances: number;
        }>;
        priceIssues: Array<{
          symbol: string;
          chain: string;
          contractAddress: string;
          priceRange: {
            min: number;
            max: number;
          };
          instances: number;
        }>;
      };
    };
    recommendations: string[];
  };
}

export default function Test24hChangeComponent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (userId?: string, wallets?: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let url = `${API_BASE_URL}/api/test/24h-change`;
      const params = new URLSearchParams();
      
      if (userId) {
        params.append('userId', userId);
      } else if (wallets && wallets.length > 0) {
        params.append('wallets', wallets.join(','));
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runSampleTest = () => {
    Alert.alert(
      'Run 24h Change Test',
      'This will test token consistency across sample wallets. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Run Test', onPress: () => runTest() }
      ]
    );
  };

  const runUserTest = () => {
    // For now, we'll just run with sample data
    // In a real implementation, you'd get the current user ID
    Alert.alert(
      'Run User Test',
      'This will test your tracked wallets for token consistency. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Run Test', onPress: () => runTest() }
      ]
    );
  };

  const renderSummary = () => {
    if (!results) return null;

    const { summary } = results.testResults;
    const hasIssues = summary.inconsistentChanges > 0 || summary.inconsistentPrices > 0;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Test Summary</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Duplicate Tokens Found:</Text>
          <Text style={styles.statValue}>{summary.totalDuplicates}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Inconsistent 24h Changes:</Text>
          <Text style={[styles.statValue, hasIssues ? styles.errorText : styles.successText]}>
            {summary.inconsistentChanges}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Inconsistent Prices:</Text>
          <Text style={[styles.statValue, hasIssues ? styles.errorText : styles.successText]}>
            {summary.inconsistentPrices}
          </Text>
        </View>
        
        {summary.maxChangeVariance > 0 && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Max Change Variance:</Text>
            <Text style={styles.statValue}>{summary.maxChangeVariance.toFixed(4)}%</Text>
          </View>
        )}
        
        <View style={[styles.statusBadge, hasIssues ? styles.errorBadge : styles.successBadge]}>
          <Text style={[styles.statusText, hasIssues ? styles.errorText : styles.successText]}>
            {hasIssues ? '⚠️ Issues Detected' : '✅ All Tests Passed'}
          </Text>
        </View>
      </View>
    );
  };

  const renderIssues = () => {
    if (!results || results.testResults.issues.inconsistentPriceChanges === 0) return null;

    return (
      <View style={styles.issuesContainer}>
        <Text style={styles.issuesTitle}>Detected Issues</Text>
        
        {results.testResults.issues.details.priceChangeIssues.map((issue, index) => (
          <View key={index} style={styles.issueCard}>
            <Text style={styles.issueSymbol}>{issue.symbol}</Text>
            <Text style={styles.issueChain}>{issue.chain}</Text>
            <Text style={styles.issueVariance}>
              Variance: {issue.variance.toFixed(4)}%
            </Text>
            <Text style={styles.issueInstances}>
              Found in {issue.instances} wallets
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!results || results.testResults.recommendations.length === 0) return null;

    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recommendations</Text>
        
        {results.testResults.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>24h Change Consistency Test</Text>
        <Text style={styles.subtitle}>
          Test if same tokens across different wallets show consistent 24h price changes
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runSampleTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🧪 Run Sample Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={runUserTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>👤 Test My Wallets</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Running consistency test...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Test Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      {results && (
        <View style={styles.resultsContainer}>
          {renderSummary()}
          {renderIssues()}
          {renderRecommendations()}
          
          <Text style={styles.timestamp}>
            Test run at: {new Date(results.timestamp).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  buttonsContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    margin: 20,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  successText: {
    color: '#34C759',
  },
  errorText: {
    color: '#ff3b30',
  },
  statusBadge: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successBadge: {
    backgroundColor: '#e8f5e8',
  },
  errorBadge: {
    backgroundColor: '#fdeaea',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  issuesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 16,
  },
  issueCard: {
    padding: 16,
    backgroundColor: '#fdeaea',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  issueSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  issueChain: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  issueVariance: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '600',
  },
  issueInstances: {
    fontSize: 12,
    color: '#666',
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  recommendationItem: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  timestamp: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});