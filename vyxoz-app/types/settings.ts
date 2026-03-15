export type Currency = 'USD' | 'BRL' | 'EUR';

export interface SettingsContextType {
  language: string;
  setLanguage: (lng: string) => Promise<void>;
  currency: Currency;
  setCurrency: (c: Currency) => Promise<void>;
  isReady: boolean;
  prices: { brl?: number; eur?: number } | null;
  fetchPrices: () => Promise<{ brl?: number; eur?: number } | null>;
}
