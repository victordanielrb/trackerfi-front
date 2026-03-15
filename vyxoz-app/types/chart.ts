import { TokenTradingData } from './token';

export interface TradingChartProps {
  data: TokenTradingData | null;
  loading?: boolean;
  onClose?: () => void;
}
