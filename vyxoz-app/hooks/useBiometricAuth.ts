import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometricAuthEnabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometricCredentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

interface BiometricAuthState {
  isAvailable: boolean;
  isEnrolled: boolean;
  isEnabled: boolean;
  biometricType: BiometricType;
  isLoading: boolean;
}

interface UseBiometricAuthReturn extends BiometricAuthState {
  authenticate: (promptMessage?: string) => Promise<{ success: boolean; error?: string }>;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  getStoredCredentials: () => Promise<{ email: string; password: string } | null>;
  checkBiometricAvailability: () => Promise<void>;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    isEnrolled: false,
    isEnabled: false,
    biometricType: 'none',
    isLoading: true,
  });

  const getBiometricType = (types: LocalAuthentication.AuthenticationType[]): BiometricType => {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'facial';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'iris';
    }
    return 'none';
  };

  const checkBiometricAvailability = useCallback(async () => {
    try {
      // Check if running on web (biometrics not supported)
      if (Platform.OS === 'web') {
        setState(prev => ({
          ...prev,
          isAvailable: false,
          isEnrolled: false,
          isEnabled: false,
          biometricType: 'none',
          isLoading: false,
        }));
        return;
      }

      const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);

      const biometricType = getBiometricType(supportedTypes);
      
      // Check if user has enabled biometric auth
      const enabledStr = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const isEnabled = enabledStr === 'true';

      setState({
        isAvailable: hasHardware,
        isEnrolled,
        isEnabled: isEnabled && hasHardware && isEnrolled,
        biometricType,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setState(prev => ({
        ...prev,
        isAvailable: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  const authenticate = useCallback(async (promptMessage?: string): Promise<{ success: boolean; error?: string }> => {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Biometric authentication not available on web' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to login',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // Allow passcode fallback
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'Authentication failed';
        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication cancelled';
        } else if (result.error === 'user_fallback') {
          errorMessage = 'User chose fallback';
        } else if (result.error === 'lockout') {
          errorMessage = 'Too many attempts. Try again later.';
        }
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }, []);

  const enableBiometric = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // First authenticate to confirm user identity
      const authResult = await authenticate('Confirm your identity to enable biometric login');
      
      if (!authResult.success) {
        return false;
      }

      // Store credentials securely (in production, use expo-secure-store)
      const credentials = JSON.stringify({ email, password });
      await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, credentials);
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

      setState(prev => ({ ...prev, isEnabled: true }));
      return true;
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
      return false;
    }
  }, [authenticate]);

  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.multiRemove([BIOMETRIC_ENABLED_KEY, BIOMETRIC_CREDENTIALS_KEY]);
      setState(prev => ({ ...prev, isEnabled: false }));
      return true;
    } catch (error) {
      console.error('Error disabling biometric auth:', error);
      return false;
    }
  }, []);

  const getStoredCredentials = useCallback(async (): Promise<{ email: string; password: string } | null> => {
    try {
      const credentialsStr = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      if (credentialsStr) {
        return JSON.parse(credentialsStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    authenticate,
    enableBiometric,
    disableBiometric,
    getStoredCredentials,
    checkBiometricAvailability,
  };
}

export default useBiometricAuth;
