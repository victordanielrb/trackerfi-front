import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getApiUrl } from '../constants/api';
import { Currency, SettingsContextType } from '../types/settings';

export type { Currency, SettingsContextType } from '../types/settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LANG_KEY = 'appLanguage';
const CURRENCY_KEY = 'appCurrency';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(i18n.language || 'en');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isReady, setIsReady] = useState(false);
  const [prices, setPrices] = useState<{ brl?: number; eur?: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANG_KEY);
        const storedCurr = await AsyncStorage.getItem(CURRENCY_KEY);

        if (storedLang) {
          setLanguageState(storedLang);
          try { await i18n.changeLanguage(storedLang); } catch(e) { /* ignore */ }
        }

        if (storedCurr && (storedCurr === 'USD' || storedCurr === 'BRL' || storedCurr === 'EUR')) {
          setCurrencyState(storedCurr);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        // fetch global prices once ready
        try { await fetchPrices(); } catch (e) { /* ignore */ }
        setIsReady(true);
      }
    })();
  }, []);

  const setLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      setLanguageState(lng);
      await AsyncStorage.setItem(LANG_KEY, lng);
    } catch (err) {
      console.error('Failed to set language', err);
    }
  };

  const setCurrency = async (c: Currency) => {
    try {
      setCurrencyState(c);
      await AsyncStorage.setItem(CURRENCY_KEY, c);
      // refresh conversion rates when currency changes
      try {
        await fetchPrices();
      } catch (err) {
        console.error('Failed to refresh prices after currency change', err);
      }
    } catch (err) {
      console.error('Failed to set currency', err);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await axios.get(getApiUrl('/api/globalData/prices'));
      const data = res.data ?? res.data?.data ?? res;
      // data should be like { brl: 'x.xxxx', eur: 'x.xxxx' }
      const brl = data.brl ? parseFloat(data.brl) : undefined;
      const eur = data.eur ? parseFloat(data.eur) : undefined;
      const parsed = { ...(brl ? { brl } : {}), ...(eur ? { eur } : {}) };
      setPrices(parsed);
      return parsed;
    } catch (err) {
      console.error('Failed to fetch global prices', err);
      return null;
    }
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, currency, setCurrency, isReady, prices, fetchPrices }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export default SettingsContext;
