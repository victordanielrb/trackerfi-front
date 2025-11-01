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

export const unstable_settings = {
  // The initial route name can be used to control the root index route
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // settings handled by SettingsProvider (which uses i18n)

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SettingsProvider>
          {/* Global Settings (language + currency) Selector */}
          <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
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
