import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface AddExchangeFormProps {
  onAddExchange: (name: string, apiKey: string, apiSecret: string) => Promise<void>;
  onCancel: () => void;
}

export default function AddExchangeForm({ onAddExchange, onCancel }: AddExchangeFormProps) {
  const [exchangeName, setExchangeName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!exchangeName.trim()) {
      setError(t('please_enter_exchange_name') || 'Please enter an exchange name');
      return;
    }

    if (!apiKey.trim()) {
      setError(t('api_key_required') || 'API Key is required');
      return;
    }

    if (!apiSecret.trim()) {
      setError(t('api_secret_required') || 'API Secret is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAddExchange(exchangeName.toLowerCase().trim(), apiKey.trim(), apiSecret.trim());
      // Form will be closed by parent component on success
    } catch (error: any) {
      setError(error.message || 'Failed to add exchange');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('add_exchange')}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('exchange_name')}</Text>
            <TextInput
              style={styles.input}
              value={exchangeName}
              onChangeText={setExchangeName}
              placeholder={t('enter_exchange_name') + ' (e.g. binance, coinbase, mexc)'}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('api_key')}</Text>
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
            <Text style={styles.label}>{t('api_secret')}</Text>
            <TextInput
              style={styles.input}
              value={apiSecret}
              onChangeText={setApiSecret}
              placeholder={t('enter_api_secret')}
              placeholderTextColor="#999"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityNoteText}>
              🔒 {t('exchange_security_note')}
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
              disabled={loading || !exchangeName || !apiKey || !apiSecret}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{t('add_exchange')}</Text>
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
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#0066cc',
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
    backgroundColor: '#007AFF',
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
});