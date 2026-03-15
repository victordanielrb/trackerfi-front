export interface NewsSource {
  name: string;
  description: string;
  url: string;
  category: 'crypto' | 'general';
  language: 'pt' | 'en' | 'es';
  icon: string;
  color: string;
  logoIndex?: number;
}

export interface NewsCardProps {
  source: NewsSource;
  onPress: () => void;
  logoAsset?: any;
}
