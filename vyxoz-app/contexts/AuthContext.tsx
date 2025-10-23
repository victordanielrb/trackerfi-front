import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { API_CONFIG, getApiUrl } from '../constants/api';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  user_type: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web-safe alert function
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    // For web, use console.error and window.alert as fallback
    console.error(`${title}: ${message}`);
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}: ${message}`);
    }
  } else {
    // For native platforms, use React Native Alert
    Alert.alert(title, message);
  }
};



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        try {
          const response = await axios.get(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY), {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          if (!response.data.success) {
            // Token is invalid, clear storage
            await clearAuth();
          }
        } catch (error) {
          // Token verification failed, clear storage
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('Login URL:', url);
      console.log('Login data:', { email, password: '***' });
      
      const response = await axios.post(url, {
        email,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('authToken', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
        username,
        email,
        password
      });

      if (response.data.success) {
        return { success: true, message: 'Registration successful. Please login.' };
      } else {
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call backend logout (optional since JWT is stateless)
      if (token) {
        await axios.post(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Clear local storage and state
      await clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if backend call fails
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;