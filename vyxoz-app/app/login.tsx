import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { router } from 'expo-router';
import { AppTheme } from '@/constants/theme';
// debug/test UI removed for production

// Web-safe alert function
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.warn(`${title}: ${message}`);
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const { 
    isAvailable, 
    isEnabled, 
    biometricType, 
    authenticate, 
    getStoredCredentials,
    checkBiometricAvailability 
  } = useBiometricAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/portfolio');
    }
  }, [isAuthenticated]);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'facial':
        return 'scan-outline';
      case 'fingerprint':
        return 'finger-print-outline';
      case 'iris':
        return 'eye-outline';
      default:
        return 'finger-print-outline';
    }
  };

  const getBiometricLabel = () => {
    return t('login_with_biometric') || 'Login with Biometry';
  };

  const handleBiometricLogin = async () => {
    try {
      // First authenticate with biometric
      const authResult = await authenticate(t('authenticate_to_login') || 'Authenticate to login');
      
      if (!authResult.success) {
        if (authResult.error !== 'Authentication cancelled') {
          showAlert(t('error') || 'Error', authResult.error || t('biometric_failed') || 'Biometric authentication failed');
        }
        return;
      }

      // Get stored credentials
      const credentials = await getStoredCredentials();
      if (!credentials) {
        showAlert(
          t('error') || 'Error', 
          t('no_stored_credentials') || 'No stored credentials found. Please login with email and password first.'
        );
        return;
      }

      // Login with stored credentials
      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        router.replace('/portfolio');
      } else {
        showAlert(t('login_failed') || 'Login Failed', result.message);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      showAlert(t('error') || 'Error', t('something_went_wrong') || 'Something went wrong');
    }
  };

  const handleSubmit = async () => {
    if (isLoginMode) {
      // Login
      if (!email || !password) {
        showAlert('Error', 'Please fill in all fields');
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        router.replace('/portfolio');
      } else {
        showAlert('Login Failed', result.message);
      }
    } else {
      // Register
      if (!username || !email || !password || !confirmPassword) {
        showAlert('Error', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 8) {
        showAlert('Error', 'Password must be at least 8 characters long');
        return;
      }

      const result = await register(username, email, password);
      if (result.success) {
        showAlert('Success', result.message);
        setIsLoginMode(true);
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        showAlert('Registration Failed', result.message);
        
    }
    }
  };

  

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLoginMode ? t('login_title') : t('register_title')}
          </Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? t('login_subtitle') : t('register_subtitle')}
          </Text>

          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('username')}</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder={t('username')}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('password')}
              placeholderTextColor="#999"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('confirm_password')}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('confirm_password')}
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLoginMode ? t('sign_in') : t('sign_up')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {isLoginMode
                ? t('dont_have_account')
                : t('already_have_account')}
            </Text>
          </TouchableOpacity>

          {/* Biometric Login Button - show in login mode when biometric is available */}
          {isLoginMode && isAvailable && (
            <View style={styles.biometricSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>{t('or') || 'or'}</Text>
                <View style={styles.divider} />
              </View>
              
              <TouchableOpacity
                style={[styles.biometricButton, isLoading && styles.disabledButton]}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Ionicons name={getBiometricIcon()} size={24} color="#007AFF" />
                <Text style={styles.biometricButtonText}>{getBiometricLabel()}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Debug and test buttons removed */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: AppTheme.borderRadius.xl,
    paddingVertical: AppTheme.spacing.xs,
    paddingHorizontal: 10,
    ...AppTheme.shadows.card,
  },
  langButton: {
    marginHorizontal: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.cardInner,
  },
  langButtonActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  langText: {
    fontWeight: 'bold',
    color: AppTheme.colors.textDark,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppTheme.spacing.lg,
  },
  formContainer: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: 30,
    ...AppTheme.shadows.card,
  },
  title: {
    ...AppTheme.typography.title,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textDark,
  },
  subtitle: {
    ...AppTheme.typography.body,
    textAlign: 'center',
    marginBottom: 30,
    color: AppTheme.colors.textMuted,
  },
  inputContainer: {
    marginBottom: AppTheme.spacing.lg,
  },
  label: {
    ...AppTheme.typography.label,
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    ...AppTheme.typography.body,
    backgroundColor: AppTheme.colors.cardInner,
  },
  submitButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
  submitButtonText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.sectionTitle,
  },
  toggleButton: {
    marginTop: AppTheme.spacing.lg,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: AppTheme.colors.primary,
    ...AppTheme.typography.body,
  },
  testButtonsContainer: {
    marginTop: 30,
    paddingTop: AppTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  testSectionTitle: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: AppTheme.colors.textMuted,
  },
  testButton: {
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  testRegisterButton: {
    backgroundColor: '#E8F5E8',
    borderColor: AppTheme.colors.success,
  },
  testLoginButton: {
    backgroundColor: '#E3F2FD',
    borderColor: AppTheme.colors.primary,
  },
  testButtonText: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  biometricSection: {
    marginTop: AppTheme.spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: AppTheme.colors.border,
  },
  dividerText: {
    paddingHorizontal: AppTheme.spacing.md,
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.body,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
  },
  biometricButtonText: {
    color: AppTheme.colors.primary,
    ...AppTheme.typography.body,
    fontWeight: '600',
    marginLeft: 10,
  },
});