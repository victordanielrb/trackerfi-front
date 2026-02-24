import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { AppTheme } from '@/constants/theme';

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
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddWallet = async () => {
    if (!address.trim()) {
      showAlert(t('error'), t('please_enter_wallet_address'));
      return;
    }

    try {
      setLoading(true);
      await onAddWallet(address.trim(), 'EVM');
      setAddress('');
      showAlert(t('success'), t('wallet_added_to_tracking'));
    } catch (error: any) {
      showAlert(t('error'), error.message || t('failed_add_wallet'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('add_wallet_to_track')}</Text>
      <Text style={styles.subtitle}>
        {t('track_any_wallet_across_blockchains')}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t('wallet_address')}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={t('enter_wallet_address')}
          placeholderTextColor={AppTheme.colors.textMuted}
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.addButton, loading && styles.disabledButton]}
            onPress={handleAddWallet}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? t('adding') : t('add_wallet')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.xl,
    margin: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  title: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  subtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  form: {
    gap: AppTheme.spacing.md,
  },
  label: {
    ...AppTheme.typography.label,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    fontSize: 16,
    backgroundColor: AppTheme.colors.cardInner,
    color: AppTheme.colors.textDark,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.cardInner,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  cancelButtonText: {
    color: AppTheme.colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
});

export default AddTrackedWalletForm;