import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppTheme, CommonStyles } from '@/constants/theme';

export default function LearnScreen() {
  const { t } = useTranslation();

  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('learn_title')}</Text>
        <Text style={styles.headerSubtitle}>{t('learn_subtitle')}</Text>
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >

      {/* Reordered sections: Blockchain -> Bitcoin -> Self-custody -> Wallets -> DeFi & Ethereum -> How to Invest */}
      <Section title={t('learn_section_blockchain_title')}>
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

      <Section title={t('learn_section_bitcoin_title')}>
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

      <Section title={t('learn_section_custody_title')}>
        <Text style={styles.paragraph}>{t('learn_section_custody_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_diff')}</Text>
        <Text style={styles.subheading}>{t('learn_section_custody_bluewallet_title')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_bluewallet_steps_p1')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_never_share_seed')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_use_passphrase')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_custody_p2')}</Text>
      </Section>

      <Section title={t('learn_section_wallets_title')}>
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

      <Section title={t('learn_section_defi_title')}>
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

      <Section title={t('learn_section_investing_title')}>
        <Text style={styles.paragraph}>{t('learn_section_investing_p1')}</Text>
        <Text style={styles.paragraph}>{t('learn_section_investing_p2')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_dyor')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_onchain_metrics')}</Text>
        <Text style={styles.bullet}>• {t('learn_bullet_hardware_wallets')}</Text>
      </Section>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
  safeContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    backgroundColor: AppTheme.colors.card,
    paddingHorizontal: AppTheme.spacing.xl,
    paddingTop: 60,
    paddingBottom: AppTheme.spacing.lg,
  },
  headerTitle: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  headerSubtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    padding: AppTheme.spacing.lg,
  },
  title: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  section: {
    marginBottom: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  sectionTitle: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  sectionBody: {},
  paragraph: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginBottom: AppTheme.spacing.sm,
  },
  bullet: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginLeft: 6,
    marginBottom: 6,
  },
  linkRow: {
    marginTop: 6,
  },
  linkText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.sm,
  },
  linkChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.borderRadius.sm,
  },
  linkChipText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  subheading: {
    marginTop: AppTheme.spacing.sm,
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.colors.textDark,
  },
});
