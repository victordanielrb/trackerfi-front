import { type TextProps, type ViewProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export interface AddTrackedWalletFormProps {
  onAddWallet: (address: string, chain: string) => Promise<void>;
  onCancel: () => void;
}

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface UserSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface TransactionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface TestResult {
  success: boolean;
  timestamp: string;
  testResults: {
    summary: {
      totalDuplicates: number;
      inconsistentChanges: number;
      inconsistentPrices: number;
      maxChangeVariance: number;
      maxPriceVariance: number;
    };
    issues: {
      inconsistentPriceChanges: number;
      inconsistentPrices: number;
      details: {
        priceChangeIssues: Array<{
          symbol: string;
          chain: string;
          contractAddress: string;
          variance: number;
          instances: number;
        }>;
        priceIssues: Array<{
          symbol: string;
          chain: string;
          contractAddress: string;
          priceRange: {
            min: number;
            max: number;
          };
          instances: number;
        }>;
      };
    };
    recommendations: string[];
  };
}
