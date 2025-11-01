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
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
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

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/portfolio');
    }
  }, [isAuthenticated]);

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

          {/* Debug and test buttons removed */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  langButton: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  langButtonActive: {
    backgroundColor: '#007AFF',
  },
  langText: {
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  testButtonsContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  testSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  testButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  testRegisterButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  testLoginButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});