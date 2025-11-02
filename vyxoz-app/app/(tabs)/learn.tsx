import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // ignore
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
  <Text style={[styles.title, { color: theme.text }]}>{t('learn_title')}</Text>

      {/* Reordered sections: Blockchain -> Bitcoin -> Self-custody -> Wallets -> DeFi & Ethereum -> How to Invest */}
      <Section title={t('learn_section_blockchain_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_blockchain_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_blockchain_p2')}</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => open('https://wikipedia.org/wiki/Blockchain')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_en')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://pt.wikipedia.org/wiki/Blockchain')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_pt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://es.wikipedia.org/wiki/Cadena_de_bloques')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_es')}</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title={t('learn_section_bitcoin_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_bitcoin_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_bitcoin_p2')}</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => open('https://bitcoin.org/en/getting-started')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_en')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://bitcoin.org/pt_BR/comecando')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_pt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://bitcoin.org/pt_BR/comecando')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_es')}</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title={t('learn_section_custody_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_custody_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_diff')}</Text>
        <Text style={styles.subheading}>{t('learn_section_custody_bluewallet_title')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_bluewallet_steps_p1')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_never_share_seed')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_use_passphrase')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_p2')}</Text>
      </Section>

      <Section title={t('learn_section_wallets_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_wallets_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_wallets_p2')}</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => open('https://learn.metamask.io/lessons/what-is-a-self-custody-wallet')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_en')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://learn.metamask.io/pt-BR/lessons/what-is-a-self-custody-wallet')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_pt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://learn.metamask.io/es-ES/es/lessons/what-is-a-self-custody-wallet')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_es')}</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title={t('learn_section_defi_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_defi_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_defi_p2')}</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => open('https://ethereum.org/defi/')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_en')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://ethereum.org/pt-br/defi/')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_pt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('https://ethereum.org/es/defi/')} style={styles.linkChip}>
            <Text style={styles.linkChipText}>{t('learn_link_es')}</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title={t('learn_section_investing_title')} theme={theme}>
        <Text style={styles.paragraph}>{t('learn_section_investing_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_investing_p2')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_dyor')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_onchain_metrics')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_hardware_wallets')}</Text>
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function LearnMore({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkText}>{t('learn_learn_more')} →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {},
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#444',
    marginLeft: 6,
    marginBottom: 6,
  },
  linkRow: {
    marginTop: 6,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  linkChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f0f6ff',
    borderRadius: 8,
  },
  linkChipText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  subheading: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
  },
});
