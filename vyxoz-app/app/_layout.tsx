import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../localization/i18n';
import { View, StyleSheet } from 'react-native';
import { SettingsProvider } from '../contexts/SettingsContext';
import LanguageCurrencySelector from '../components/LanguageCurrencySelector';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const unstable_settings = {
  // The initial route name can be used to control the root index route
  initialRouteName: '(tabs)/portfolio',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // settings handled by SettingsProvider (which uses i18n)

  return (
    <AuthProvider>
      {/* Simple websocket client that logs incoming alert messages */}
      <WebsocketLogger />
      <ThemeProvider value={colorScheme == 'dark' ? DefaultTheme : DarkTheme}>
        <SettingsProvider>
          {/* Global Settings (language + currency) Selector */}
          <Stack>
    
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
          <LanguageCurrencySelector />

          <StatusBar style="auto" />
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function WebsocketLogger() {
  useEffect(() => {
    try {
      const ws = new WebSocket('ws://localhost:3000/ws');
      ws.onopen = () => console.log('WS connected to backend');
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string);
          console.log('WS message:', data);
        } catch (e) {
          console.log('WS raw message:', ev.data);
        }
      };
      ws.onerror = (e) => console.warn('WS error', e);
      ws.onclose = () => console.log('WS closed');
      // identify as anonymous client for now (no user id). If you have auth, send {type:'hello', userId}
      ws.addEventListener('open', () => ws.send(JSON.stringify({ type: 'hello', userId: 'anonymous' })));
      return () => { ws.close(); };
    } catch (e) {
      console.warn('WS init failed', e);
    }
  }, []);
  return null;
}

const styles = StyleSheet.create({
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 100,
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
});
