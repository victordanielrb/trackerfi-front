export interface Exchange {
  name: string;
  api_key: string;
  api_secret: string;
  connected_at: Date;
  updated_at: Date;
}

export interface ExchangeResponse {
  id: string;
  name: string;
  api_key: string; // masked for security
  api_secret: string; // masked for security
  connected_at: Date;
  updated_at: Date;
}

export interface AddExchangeFormProps {
  onAddExchange: (name: string, apiKey: string, apiSecret: string) => Promise<void>;
  onCancel: () => void;
}

export interface EditExchangeFormProps {
  exchange: ExchangeResponse;
  onUpdateExchange: (exchangeId: string, apiKey?: string, apiSecret?: string) => Promise<void>;
  onCancel: () => void;
}
