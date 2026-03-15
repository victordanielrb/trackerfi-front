import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    ...AppTheme.shadows.card,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: AppTheme.spacing.sm,
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.body,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: AppTheme.spacing.sm,
  },
  emptyText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textLight,
    textAlign: 'center',
    marginTop: AppTheme.spacing.xs,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  timeRangeButton: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.cardInner,
  },
  timeRangeButtonActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  timeRangeText: {
    ...AppTheme.typography.small,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  },
  timeRangeTextActive: {
    color: AppTheme.colors.card,
  },
  changeContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
    gap: AppTheme.spacing.xs,
  },
  currentValue: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.textDark,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  changeValue: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  changePercent: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  selectedDate: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textLight,
    marginTop: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: AppTheme.spacing.sm,
    overflow: 'hidden',
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.xs,
  },
  dateLabel: {
    ...AppTheme.typography.small,
    fontSize: 10,
    color: AppTheme.colors.textLight,
  },
  pointerLabel: {
    backgroundColor: AppTheme.colors.textDark,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.xs,
  },
  pointerValue: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
});
