export interface TransactionTransfer {
  fungible_info?: {
    name: string;
    symbol: string;
    icon?: {
      url: string;
    };
  };
  direction: 'in' | 'out';
  quantity: {
    float: number;
    numeric: string;
  };
  value?: number;
  price?: number;
  nft_info?: {
    name?: string;
    collection?: string;
    image_url?: string;
  };
}

export interface TransactionFee {
  value: number;
  price: number;
  fungible_info: {
    name: string;
    symbol: string;
    icon?: {
      url: string;
    };
  };
}

export interface Transaction {
  id: string;
  type: string;
  protocol?: string;
  mined_at: string;
  hash: string;
  status: 'confirmed' | 'pending' | 'failed';
  direction?: 'in' | 'out' | 'self';
  address_from?: string;
  address_to?: string;
  chain?: string;
  fee?: TransactionFee;
  transfers?: TransactionTransfer[];
  applications?: Array<{
    name: string;
    icon?: { url: string };
  }>;
}

export interface TransactionWithMeta {
  wallet_address: string;
  chain: string;
  transaction: Transaction;
  fetched_at: string;
}

export interface TransactionFilter {
  wallet_address?: string;
  chain?: string;
  type?: string;
  direction?: 'in' | 'out' | 'self';
  from_date?: string;
  to_date?: string;
  limit?: number;
}
