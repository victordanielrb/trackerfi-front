import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExchangeResponse, useExchangeManagement } from '../hooks/useExchangeManagement';

interface EditExchangeFormProps {
  exchange: ExchangeResponse;
  onUpdateExchange: (exchangeId: string, apiKey?: string, apiSecret?: string) => Promise<void>;
  onCancel: () => void;
}

export default function EditExchangeForm({ exchange, onUpdateExchange, onCancel }: EditExchangeFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const { t } = useTranslation();
  const { getExchangeForEdit } = useExchangeManagement();

  // Load decrypted credentials when component mounts
  useEffect(() => {
    const loadDecryptedCredentials = async () => {
      try {
        setLoadingCredentials(true);
        const decryptedExchange = await getExchangeForEdit(exchange.id);
        setApiKey(decryptedExchange.api_key);
        setApiSecret(decryptedExchange.api_secret);
      } catch (error: any) {
        console.error('Failed to load decrypted credentials:', error);
        setError('Failed to load credentials for editing');
      } finally {
        setLoadingCredentials(false);
      }
    };

    loadDecryptedCredentials();
  }, [exchange.id, getExchangeForEdit]);

  const handleSubmit = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError('Both API key and API secret are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await onUpdateExchange(exchange.id, apiKey.trim(), apiSecret.trim());
      // Form will be closed by parent component on success
    } catch (error: any) {
      setError(error.message || 'Failed to update exchange');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCredentials) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('edit_exchange')}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t('loading_credentials')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('edit_exchange')}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exchangeInfo}>
            <Text style={styles.exchangeName}>
              {exchange.name.charAt(0).toUpperCase() + exchange.name.slice(1)}
            </Text>
            <Text style={styles.currentApiKey}>
              {t('current_api_key')}: {exchange.api_key}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {t('api_key')} *
            </Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder={t('enter_api_key')}
              placeholderTextColor="#999"
              secureTextEntry={false}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {t('api_secret')} *
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={apiSecret}
                onChangeText={setApiSecret}
                placeholder={t('enter_api_secret')}
                placeholderTextColor="#999"
                secureTextEntry={!showApiSecret}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowApiSecret(!showApiSecret)}
              >
                <Text style={styles.toggleButtonText}>
                  {showApiSecret ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityNoteText}>
              🔒 {t('exchange_update_security_note')}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{t('update_exchange')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  exchangeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentApiKey: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  securityNote: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff9500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  toggleButtonText: {
    fontSize: 16,
  },
});