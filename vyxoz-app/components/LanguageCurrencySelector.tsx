import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import UserSettingsModal from './UserSettingsModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
];

const CURRENCIES: Array<{ code: 'USD'|'BRL'|'EUR'; label: string }> = [
  { code: 'USD', label: 'USD' },
  { code: 'BRL', label: 'BRL' },
  { code: 'EUR', label: 'EUR' },
];

export default function LanguageCurrencySelector() {
  const { language, setLanguage, currency, setCurrency } = useSettings();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.buttonRow}>
        {/* Settings button - only show when authenticated */}
        {isAuthenticated && (
          <TouchableOpacity 
            style={[styles.mainButton, styles.settingsButton]} 
            onPress={() => setSettingsModalVisible(true)}
            accessibilityLabel="User settings"
          >
            <Ionicons name="settings-outline" size={18} color="#222" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.mainButton} onPress={toggle} accessibilityLabel="Language and currency selector">
          <View style={styles.mainInner}>
            <Text style={[styles.arrow, open && styles.arrowOpen]} accessibilityRole="image">▾</Text>
          </View>
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.dropdown}>
          <View style={styles.langColumn}>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} onPress={() => setLanguage(l.code)} style={[styles.langItem, language === l.code && styles.langActive]}>
                <Text style={[styles.langText, language === l.code && styles.langTextActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.currencyRow}>
            {CURRENCIES.map(c => (
              <TouchableOpacity key={c.code} onPress={() => setCurrency(c.code)} style={[styles.currencyItem, currency === c.code && styles.currencyActive]}>
                <Text style={[styles.currencyText, currency === c.code && styles.currencyTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* User Settings Modal */}
      <UserSettingsModal 
        visible={settingsModalVisible} 
        onClose={() => setSettingsModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 200,
    alignItems: 'flex-end',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  mainButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  mainText: {
    fontWeight: '700',
    color: '#222',
  },
  mainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    fontSize: 14,
    color: '#222',
    transform: [{ rotate: '0deg' }],
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  langColumn: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  langItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  langActive: {
    backgroundColor: '#007AFF',
  },
  langText: {
    fontWeight: '600',
    color: '#222',
  },
  langTextActive: {
    color: '#fff',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  currencyItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  currencyActive: {
    backgroundColor: '#007AFF',
  },
  currencyText: {
    fontWeight: '700',
    color: '#222',
  },
  currencyTextActive: {
    color: '#fff',
  },
  settingsButton: {
    marginRight: 8,
    paddingHorizontal: 10,
  },
});
