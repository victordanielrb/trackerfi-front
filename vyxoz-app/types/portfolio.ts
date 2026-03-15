import { TrackedWalletToken } from './wallet';

export interface Snapshot {
  _id: string;
  timestamp: string;
  total_value_usd: number;
}

export interface PortfolioChartProps {
  onPress?: () => void;
}

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface PortfolioTokenDisplayProps {
  tokens: TrackedWalletToken[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  showWalletAddress?: boolean;
  onTokenPress?: (token: TrackedWalletToken) => void;
}

export type SortOption = 'value' | 'balance' | 'performance' | 'alphabetical' | 'chain';
