import React, { useState, useEffect } from 'react';
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
import DebugInfo from '../components/DebugInfo';

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
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastTestUser, setLastTestUser] = useState<{email: string, password: string} | null>(null);
  const { login, register, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
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
        router.replace('/(tabs)');
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

  const handleTestRegister = async () => {
    const testUsername = `testuser_${Date.now()}`;
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'test123456';

    // Store the test user credentials for login later
    setLastTestUser({ email: testEmail, password: testPassword });

    // Fill form fields 
    setUsername(testUsername);
    setEmail(testEmail);
    setPassword(testPassword);
    setConfirmPassword(testPassword);
    setIsLoginMode(false);

    // Auto-submit after a brief delay
    setTimeout(async () => {
      const result = await register(testUsername, testEmail, testPassword);
      if (result.success) {
        showAlert('Test Registration Success', `Created user: ${testUsername}\nEmail: ${testEmail}\nYou can now use Test Login!`);
        setIsLoginMode(true);
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        showAlert('Test Registration Failed', result.message);
      }
    }, 500);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const handleTestLogin = async () => {
    // Use the last registered test user if available, otherwise use the fallback
    const testEmail = lastTestUser?.email || 'test@example.com';
    const testPassword = lastTestUser?.password || 'test123456';

    // Fill form fields
    setEmail(testEmail);
    setPassword(testPassword);
    setIsLoginMode(true);

    // Auto-submit after a brief delay
    setTimeout(async () => {
      const result = await login(testEmail, testPassword);
      if (result.success) {
        showAlert('Test Login Success', 'Logged in with test account');
      } else {
        showAlert('Test Login Failed', `${result.message}\n\nTip: Try creating a test user first!`);
      }
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? 'Sign in to continue' : 'Sign up to get started'}
          </Text>

          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
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
                {isLoginMode ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {isLoginMode
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Debug Info - Only show in development */}
          {__DEV__ && <DebugInfo />}

          {/* Test Buttons - Only show in development */}
          {__DEV__ && (
            <View style={styles.testButtonsContainer}>
              <Text style={styles.testSectionTitle}>🚀 Quick Test Actions</Text>
              
              <TouchableOpacity
                style={[styles.testButton, styles.testRegisterButton]}
                onPress={handleTestRegister}
                disabled={isLoading}
              >
                <Text style={styles.testButtonText}>
                  ⚡ Create Test User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, styles.testLoginButton]}
                onPress={handleTestLogin}
                disabled={isLoading}
              >
                <Text style={styles.testButtonText}>
                  🔑 Login {lastTestUser ? 'with Test User' : 'with Default User'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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