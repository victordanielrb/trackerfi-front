import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
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
