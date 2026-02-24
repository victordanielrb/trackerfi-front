import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../localization/i18n';
import { SettingsProvider } from '../contexts/SettingsContext';
import LanguageCurrencySelector from '../components/LanguageCurrencySelector';
import PushNotificationInitializer from '../components/PushNotificationInitializer';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import axios from 'axios';

// Set axios defaults once when the module loads so all axios requests add the required headers
if (!axios.defaults.headers.common['ngrok-skip-browser-warning']) {
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = '1';
}


// Optional: log outgoing requests in development so you can verify headers
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  axios.interceptors.request.use((config) => {
    // Avoid logging sensitive payloads; show only method, URL, and headers
    console.debug('[axios] Request:', config.method, config.url, {
      headers: config.headers
    });
    return config;
  });
}

export const unstable_settings = {
  // The initial route name can be used to control the root index route
  initialRouteName: '(tabs)/portfolio',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // The layout renders often — axios defaults are set outside the component body to run once
  // settings handled by SettingsProvider (which uses i18n)

  return (
    <AuthProvider>
      <PushNotificationInitializer>
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
      </PushNotificationInitializer>
    </AuthProvider>
  );
}
