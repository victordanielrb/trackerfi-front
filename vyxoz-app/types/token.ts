import { Token } from './wallet';

export interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface TokenDetail {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  mcap?: number;
  usd_24h_volume?: number;
  usd_24h_change?: number;
  image?: { large: string; small: string; thumb: string } | string;
  market_data?: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
  };
  description?: { en: string };
}

export interface TokenTradingData {
  id: string;
  symbol: string;
  name: string;
  current_price_usd: number | null;
  price_change_percentage_1h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_14d?: number | null;
  price_change_percentage_30d?: number | null;
  price_change_percentage_1y?: number | null;
  market_cap_usd: number | null;
  total_volume_24h_usd: number | null;
  high_24h_usd: number | null;
  low_24h_usd: number | null;
  ath_usd?: number | null;
  ath_date?: string | null;
  atl_usd?: number | null;
  atl_date?: string | null;
  last_updated: string;
  // OHLC data
  ohlc_1d?: Array<[number, number, number, number, number]>;
  ohlc_7d?: Array<[number, number, number, number, number]>;
  ohlc_14d?: Array<[number, number, number, number, number]>;
  ohlc_30d?: Array<[number, number, number, number, number]>;
  ohlc_90d?: Array<[number, number, number, number, number]>;
  ohlc_180d?: Array<[number, number, number, number, number]>;
  ohlc_365d?: Array<[number, number, number, number, number]>;
  // Price data
  prices_1d?: Array<[number, number]>;
  prices_7d?: Array<[number, number]>;
  prices_30d?: Array<[number, number]>;
  prices_90d?: Array<[number, number]>;
  prices_365d?: Array<[number, number]>;
}

export interface TokenDisplayProps {
  groupByBlockchain?: boolean;
  showWalletAddress?: boolean;
  onTokenPress?: (token: Token & { wallet_address: string; blockchain: string }) => void;
}
