import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 200,
    alignItems: 'flex-end',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  mainButton: {
    backgroundColor: AppTheme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.full,
    ...AppTheme.shadows.card,
    elevation: 4,
  },
  mainText: {
    fontWeight: '700',
    color: AppTheme.colors.textDark,
  },
  mainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.sm,
  },
  arrow: {
    fontSize: 14,
    color: AppTheme.colors.textDark,
    transform: [{ rotate: '0deg' }],
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    marginTop: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.sm,
    flexDirection: 'column',
    ...AppTheme.shadows.card,
    elevation: 6,
  },
  langColumn: {
    flexDirection: 'column',
    marginBottom: AppTheme.spacing.sm,
  },
  langItem: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
  },
  langActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  langText: {
    fontWeight: '600',
    color: AppTheme.colors.textDark,
  },
  langTextActive: {
    color: AppTheme.colors.card,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  currencyItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: AppTheme.colors.cardInner,
  },
  currencyActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  currencyText: {
    fontWeight: '700',
    color: AppTheme.colors.textDark,
  },
  currencyTextActive: {
    color: AppTheme.colors.card,
  },
  settingsButton: {
    marginRight: AppTheme.spacing.sm,
    paddingHorizontal: 10,
  },
});
