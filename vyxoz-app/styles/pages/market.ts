import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.lg,
    paddingTop: 60,
  },
  title: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  subtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  section: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    padding: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.card,
  },
  sectionTitle: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    marginHorizontal: AppTheme.spacing.xs,
  },
  statValue: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  dominanceCard: {
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
  },
  dominanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
  },
  dominanceLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textDark,
    fontWeight: '500',
  },
  dominanceValue: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  ratesCard: {
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
  },
  rateLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textDark,
    fontWeight: '500',
  },
  rateValue: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  errorText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.danger,
    textAlign: 'center',
    margin: AppTheme.spacing.lg,
  },
});
