export interface GlobalTotalData {
  // shape is unknown; keep flexible
  [key: string]: any;
}

export interface GlobalPrices {
  [symbol: string]: number | any;
}

export interface MarketData {
  total_market_cap: number;
  total_volume_24h: number;
  market_cap_change_24h: number;
  btc_dominance?: number;
  eth_dominance?: number;
  market_cap_percentage?: {
    btc?: number;
    eth?: number;
  };
  btc_price?: number;
  eth_price?: number;
}

export interface PriceData {
  usd: number;
  brl?: number;
  eur?: number;
}
