export interface TrackedWallet {
  address: string;
  chain: string;
}

export interface TrackedWalletToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: string;
  position_type: string;
  quantity?: string;
  price?: number;
  value?: number;
  price_change_24h?: number;
  decimals?: number;
  icon_url?: string;
  updated_at?: string;
  wallet_address: string;
  wallet_chain: string;
}

export interface WalletSummary {
  wallet_address: string;
  wallet_chain?: string;
  totalValue: number; // USD
  totalChange: number; // USD absolute 24h change
  percentChange: number; // decimal, e.g. 0.05 == +5%
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: string;
  position_type: string;
  quantity?: string;
  price?: number;
  value?: number; // USD value
  price_change_24h?: number;
  decimals?: number;
  icon_url?: string;
  updated_at?: string;
}

export interface WalletTokens {
  wallet_address: string;
  blockchain: string;
  tokens: Token[];
}

export interface Wallet {
  id: string;
  user_id: string;
  blockchain: 'SUI' | 'EVM' | 'SOLANA';
  wallet_address: string;
  connected_at: string;
}
