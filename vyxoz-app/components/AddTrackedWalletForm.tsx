import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

interface AddTrackedWalletFormProps {
  onAddWallet: (address: string, chain: string) => Promise<void>;
  onCancel: () => void;
}

// Web-safe alert function
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.error(`${title}: ${message}`);
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};

export const AddTrackedWalletForm: React.FC<AddTrackedWalletFormProps> = ({
  onAddWallet,
  onCancel,
}) => {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('EVM');
  const [loading, setLoading] = useState(false);

  const chains = [
    { label: 'Evm', value: 'EVM' },
    { label: 'Solana', value: 'SOLANA' },
    { label: 'Sui', value: 'SUI' },
  ];

  const handleAddWallet = async () => {
    if (!address.trim()) {
      showAlert('Error', 'Please enter a wallet address');
      return;
    }

    try {
      setLoading(true);
      await onAddWallet(address.trim(), chain);
      setAddress('');
      showAlert('Success', 'Wallet added to tracking list');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to add wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Wallet to Track</Text>
      <Text style={styles.subtitle}>
        Track any wallet address across different blockchains
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Wallet Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter wallet address (0x... or base58)"
          placeholderTextColor="#999"
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Blockchain</Text>
        <View style={styles.chainSelector}>
          {chains.map((chainOption) => (
            <TouchableOpacity
              key={chainOption.value}
              style={[
                styles.chainOption,
                chain === chainOption.value && styles.chainOptionSelected,
              ]}
              onPress={() => setChain(chainOption.value)}
            >
              <Text
                style={[
                  styles.chainOptionText,
                  chain === chainOption.value && styles.chainOptionTextSelected,
                ]}
              >
                {chainOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.addButton, loading && styles.disabledButton]}
            onPress={handleAddWallet}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add Wallet'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  chainSelector: {
    gap: 8,
  },
  chainOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  chainOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f3ff',
  },
  chainOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  chainOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default AddTrackedWalletForm;