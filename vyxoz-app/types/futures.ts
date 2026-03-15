export interface FuturesPosition {
  exchange: string;
  positionId: number;
  symbol: string;
  positionType: number; // 1: long, 2: short
  holdVol: number;
  holdAvgPrice: number;
  liquidatePrice: number;
  realised: number;
  leverage: number;
  createTime: number;
  updateTime: number;
  pnl?: number;
}

export interface FuturesPositionsDisplayProps {
  positions: FuturesPosition[];
  loading: boolean;
  error: string | null;
  errors: string[];
  onRefresh: () => void;
}
