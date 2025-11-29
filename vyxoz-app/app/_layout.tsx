import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../localization/i18n';
import { SettingsProvider } from '../contexts/SettingsContext';
import { AlertNotificationProvider } from '../contexts/AlertNotificationContext';
import LanguageCurrencySelector from '../components/LanguageCurrencySelector';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';

export const unstable_settings = {
  // The initial route name can be used to control the root index route
  initialRouteName: '(tabs)/portfolio',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // settings handled by SettingsProvider (which uses i18n)

  return (
    <AuthProvider>
      <AlertNotificationProvider>
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
      </AlertNotificationProvider>
    </AuthProvider>
  );
}
