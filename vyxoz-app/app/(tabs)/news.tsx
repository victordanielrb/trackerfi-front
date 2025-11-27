import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface NewsSource {
  name: string;
  description: string;
  url: string;
  category: 'crypto' | 'general';
  language: 'pt' | 'en' | 'es';
  icon: string; // fallback icon if logo not available
  color: string;
  logo?: string; // remote logo/image URI
}

// Remote logos provided by user. If any fail or load slowly, component falls back to icon.
const BEINCRYPTO_LOGO = 'https://scontent-gru1-2.xx.fbcdn.net/v/t39.30808-6/567441633_1301124902026451_2035337638933684744_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEJtI6UXwH0odKysrRJ3TIkA_c9lvSAOuYD9z2W9IA65nTgXmdc_AYSeHcZJXuoXUxuc1zMNlXPNqU66dDXtsaF&_nc_ohc=bc6c0Zxs4YwQ7kNvwE3tCLj&_nc_oc=AdmIG_Qx_00Zx5OBdBNTa-4ctfvg6otkLY88FNP4-KfdcPc7qXizptGljXaDn-qli14phoNgxLTlPhSsWelqTftB&_nc_zt=23&_nc_ht=scontent-gru1-2.xx&_nc_gid=1j71fQ5A-Hc3umur2wgA9Q&oh=00_AfjVzb9Dxv9BanOjxLcXc4qyp_A8c1OMJj-XkoPcdaJYQA&oe=692B14C3';
const COINTELEGRAPH_LOGO = 'https://scontent-gru1-1.xx.fbcdn.net/v/t39.30808-6/339733955_236683938826968_6836318394336583613_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGR4ZYHUyylZZl-fghRAgH8cs6VTrNht55yzpVOs2G3nvg9sa-qSXRQyRqX8z2NC-Hs5dmHflKodnrKy7v4M-G2&_nc_ohc=4q6xNcYADscQ7kNvwH4L1WF&_nc_oc=AdkGUaK3ICnr9HXJ2tO7bFRLz7WUB2qQg2H6xtjDBLj1laxx5AUCaN0Z3D5rZGhkFUJ0t5CMPVq5yw5gYmg98ywo&_nc_zt=23&_nc_ht=scontent-gru1-1.xx&_nc_gid=t68Vd9NAX8flbn1RwfJ8ew&oh=00_AfjcC-T0sWIZOX3LGgK_1nUHil70bmJ7A-LSH3k-rf_x0w&oe=692B13E0';
// BBC: using a generic placeholder if no direct image provided; replace with official logo URL if available.
const BBC_LOGO = 'https://scontent-gru1-1.xx.fbcdn.net/v/t39.30808-6/245330608_5300122836669539_378388837082703204_n.png?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHpC0IKSJFwO8BFrE80sZoSE-7h2BzhLYUT7uHYHOEthWshjI-fNm2GeCA-V5gnFWTIA-B9WD1Qe4uAKTHLqatN&_nc_ohc=GN2mcP9WQ2MQ7kNvwFQaoVy&_nc_oc=AdmZ0Ez4FswTWeU_G7NtMiE9nLqmdOg2B4FP3YdFu_RhcDA4OhVSKqE5OnjXP9Xd2pozIr3wmLwS6VYra4YJlYvE&_nc_zt=23&_nc_ht=scontent-gru1-1.xx&_nc_gid=VSEe986IQF1ssImK23nWgQ&oh=00_AfhjuMqKv3Wv601TcXLSQTAamBrLb_CmtGf_QaiNmNmohw&oe=692AE18F';

const newsSources: NewsSource[] = [
  // Crypto News Sources
  {
    name: 'Cointelegraph',
    description: 'Leading crypto news platform',
    url: 'https://cointelegraph.com/',
    category: 'crypto',
    language: 'en',
    icon: 'bitcoinsign.circle.fill',
    color: '#FF6B35',
    logo: COINTELEGRAPH_LOGO
  },
  {
    name: 'Cointelegraph Brasil',
    description: 'Notícias de crypto em português',
    url: 'https://br.cointelegraph.com/',
    category: 'crypto',
    language: 'pt',
    icon: 'bitcoinsign.circle.fill',
    color: '#FF6B35',
    logo: COINTELEGRAPH_LOGO
  },
  {
    name: 'Cointelegraph Español',
    description: 'Noticias crypto en español',
    url: 'https://es.cointelegraph.com/',
    category: 'crypto',
    language: 'es',
    icon: 'bitcoinsign.circle.fill',
    color: '#FF6B35',
    logo: COINTELEGRAPH_LOGO
  },
  {
    name: 'BeInCrypto',
    description: 'Global crypto news and analysis',
    url: 'https://beincrypto.com/',
    category: 'crypto',
    language: 'en',
    icon: 'diamond.fill',
    color: '#00D4FF',
    logo: BEINCRYPTO_LOGO
  },
  {
    name: 'BeInCrypto Brasil',
    description: 'Análises e notícias crypto',
    url: 'https://br.beincrypto.com/',
    category: 'crypto',
    language: 'pt',
    icon: 'diamond.fill',
    color: '#00D4FF',
    logo: BEINCRYPTO_LOGO
  },
  {
    name: 'BeInCrypto Español',
    description: 'Noticias y análisis crypto',
    url: 'https://es.beincrypto.com/',
    category: 'crypto',
    language: 'es',
    icon: 'diamond.fill',
    color: '#00D4FF',
    logo: BEINCRYPTO_LOGO
  },
  // BBC News Sources
  {
    name: 'BBC Business',
    description: 'Business and finance news',
    url: 'https://www.bbc.com/news/topics/cyd7z4rvdm3t',
    category: 'general',
    language: 'en',
    icon: 'building.2.fill',
    color: '#BB1919',
    logo: BBC_LOGO
  },
  {
    name: 'BBC Mundo Economía',
    description: 'Noticias económicas en español',
    url: 'https://www.bbc.com/mundo/topics/c1y3ykyvq31t',
    category: 'general',
    language: 'es',
    icon: 'building.2.fill',
    color: '#BB1919',
    logo: BBC_LOGO
  },
  {
    name: 'BBC Brasil Economia',
    description: 'Notícias econômicas em português',
    url: 'https://www.bbc.com/portuguese/topics/c6x7dxredp9t',
    category: 'general',
    language: 'pt',
    icon: 'building.2.fill',
    color: '#BB1919',
    logo: BBC_LOGO
  }
];

interface NewsCardProps {
  source: NewsSource;
  onPress: () => void;
}

function NewsCard({ source, onPress }: NewsCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        {source.logo ? (
          <Image
            accessibilityLabel={`${source.name} logo`}
            source={{ uri: source.logo }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: source.color }]}>
            <IconSymbol name={source.icon as any} size={24} color="white" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{source.name}</Text>
          <Text style={styles.cardDescription}>{source.description}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: source.category === 'crypto' ? '#FF6B3520' : '#BB191920' }]}>            
          <Text style={[styles.categoryText, { color: source.category === 'crypto' ? '#FF6B35' : '#BB1919' }]}>
            {source.category === 'crypto' ? 'CRYPTO' : 'ECONOMY'}
          </Text>
        </View>
        <View style={styles.languageContainer}>
          <Text style={styles.languageText}>{source.language.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <IconSymbol name="chevron.right" size={20} color={source.color} />
      </View>
    </TouchableOpacity>
  );
}

export default function NoticiasScreen() {
  const { t } = useTranslation();
  
  const openURL = async (url: string, sourceName: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t('news.error'),
          t('news.cannotOpen', { source: sourceName }),
          [{ text: t('news.ok'), style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('news.error'),
        t('news.failedToOpen', { source: sourceName }),
        [{ text: t('news.ok'), style: 'default' }]
      );
    }
  };
  
  const cryptoSources = newsSources.filter(source => source.category === 'crypto');
  const generalSources = newsSources.filter(source => source.category === 'general');
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('news.title')}</Text>
        <Text style={styles.subtitle}>
          {t('news.subtitle')}
        </Text>
      </View>
      
      {/* Crypto News Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('news.cryptoNews')}</Text>
        {cryptoSources.map((source, index) => (
          <NewsCard
            key={index}
            source={source}
            onPress={() => openURL(source.url, source.name)}
          />
        ))}
      </View>
      
      {/* General Economy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('news.generalEconomy')}</Text>
        {generalSources.map((source, index) => (
          <NewsCard
            key={index}
            source={source}
            onPress={() => openURL(source.url, source.name)}
          />
        ))}
      </View>
      
      {/* Info Footer */}
      <View style={styles.infoFooter}>
        <Text style={styles.infoText}>
          {t('news.tapToAccess')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#fff'
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  languageContainer: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  infoFooter: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});