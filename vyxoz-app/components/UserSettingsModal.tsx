import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/constants/theme';

interface UserSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Web-safe alert
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
    if (buttons && buttons[0]?.onPress) buttons[0].onPress();
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function UserSettingsModal({ visible, onClose }: UserSettingsModalProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const {
    isAvailable,
    isEnrolled,
    isEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
    isLoading: biometricLoading,
  } = useBiometricAuth();

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setShowPasswordFields(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }, [visible]);

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'facial':
        return 'scan-outline';
      case 'fingerprint':
        return 'finger-print-outline';
      case 'iris':
        return 'eye-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  const getBiometricLabel = () => {
    return t('biometric') || 'Biometry';
  };

  const handleBiometricToggle = async (value: boolean) => {
    setIsProcessing(true);
    try {
      if (value) {
        // Need to get current password to enable biometric
        showAlert(
          t('enable_biometric') || 'Enable Biometric Login',
          t('enter_password_to_enable') || 'Enter your password to enable biometric login',
          [
            { text: t('cancel') || 'Cancel', style: 'cancel' },
            {
              text: t('continue') || 'Continue',
              onPress: () => setShowPasswordFields(true),
            },
          ]
        );
      } else {
        const success = await disableBiometric();
        if (success) {
          showAlert(
            t('success') || 'Success',
            t('biometric_disabled') || 'Biometric login has been disabled'
          );
        }
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (!currentPassword) {
      showAlert(t('error') || 'Error', t('enter_password') || 'Please enter your password');
      return;
    }

    setIsProcessing(true);
    try {
      // Use the user's email and provided password
      const success = await enableBiometric(user?.email || '', currentPassword);
      if (success) {
        showAlert(
          t('success') || 'Success',
          t('biometric_enabled') || 'Biometric login has been enabled'
        );
        setShowPasswordFields(false);
        setCurrentPassword('');
      } else {
        showAlert(
          t('error') || 'Error',
          t('biometric_enable_failed') || 'Failed to enable biometric login. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      showAlert(t('error') || 'Error', t('something_went_wrong') || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    showAlert(
      t('logout') || 'Logout',
      t('logout_confirm') || 'Are you sure you want to logout?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings') || 'Settings'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('account') || 'Account'}</Text>
              <View style={styles.userInfoCard}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-circle-outline" size={60} color="#007AFF" />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.username || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                </View>
              </View>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('security') || 'Security'}</Text>

              {/* Biometric Auth Toggle */}
              {isAvailable && isEnrolled && (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name={getBiometricIcon()} size={24} color="#007AFF" />
                    <View style={styles.settingText}>
                      <Text style={styles.settingLabel}>{getBiometricLabel()}</Text>
                      <Text style={styles.settingDescription}>
                        {t('biometric_login_description') || 'Use biometric to login quickly'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={handleBiometricToggle}
                    disabled={isProcessing || biometricLoading}
                    trackColor={{ false: '#ccc', true: '#007AFF' }}
                    thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
                  />
                </View>
              )}

              {/* Biometric not available message */}
              {!isAvailable && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {t('biometric_not_available') || 'Biometric authentication is not available on this device'}
                  </Text>
                </View>
              )}

              {/* Biometric not enrolled message */}
              {isAvailable && !isEnrolled && (
                <View style={styles.infoBox}>
                  <Ionicons name="warning-outline" size={20} color="#f0ad4e" />
                  <Text style={styles.infoText}>
                    {t('biometric_not_enrolled') || 'No biometrics enrolled. Set up fingerprint or face unlock in device settings.'}
                  </Text>
                </View>
              )}

              {/* Password entry for enabling biometric */}
              {showPasswordFields && (
                <View style={styles.passwordSection}>
                  <Text style={styles.passwordLabel}>
                    {t('enter_current_password') || 'Enter your current password:'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={t('password') || 'Password'}
                    placeholderTextColor="#999"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  <View style={styles.passwordButtons}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setShowPasswordFields(false);
                        setCurrentPassword('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>{t('cancel') || 'Cancel'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.confirmButton, isProcessing && styles.disabledButton]}
                      onPress={handleEnableBiometric}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.confirmButtonText}>{t('enable') || 'Enable'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
              <Text style={styles.logoutButtonText}>{t('logout') || 'Logout'}</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.versionText}>TrackerFi v1.0.0</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.borderRadius.xl,
    borderTopRightRadius: AppTheme.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  title: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
  },
  closeButton: {
    padding: AppTheme.spacing.xs,
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
  },
  section: {
    marginTop: AppTheme.spacing.xl,
  },
  sectionTitle: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: AppTheme.spacing.md,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
  },
  avatarContainer: {
    marginRight: AppTheme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
  },
  userEmail: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: AppTheme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...AppTheme.typography.body,
    fontWeight: '500',
    color: AppTheme.colors.textDark,
  },
  settingDescription: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  infoText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginLeft: 10,
    flex: 1,
  },
  passwordSection: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  passwordLabel: {
    ...AppTheme.typography.body,
    fontWeight: '500',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    backgroundColor: AppTheme.colors.card,
    marginBottom: AppTheme.spacing.md,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: AppTheme.spacing.md,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.cardInner,
  },
  cancelButtonText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  confirmButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.md,
  },
  logoutButtonText: {
    color: AppTheme.colors.danger,
    ...AppTheme.typography.body,
    fontWeight: '600',
    marginLeft: AppTheme.spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    color: AppTheme.colors.textLight,
    ...AppTheme.typography.small,
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.lg,
  },
});
