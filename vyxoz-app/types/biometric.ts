export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricAuthState {
  isAvailable: boolean;
  isEnrolled: boolean;
  isEnabled: boolean;
  biometricType: BiometricType;
  isLoading: boolean;
}

export interface UseBiometricAuthReturn extends BiometricAuthState {
  authenticate: (promptMessage?: string) => Promise<{ success: boolean; error?: string }>;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  getStoredCredentials: () => Promise<{ email: string; password: string } | null>;
  checkBiometricAvailability: () => Promise<void>;
}
