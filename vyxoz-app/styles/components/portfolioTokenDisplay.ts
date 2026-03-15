import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.xl,
    minHeight: 200,
  },
  loadingText: {
    marginTop: AppTheme.spacing.sm,
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  errorText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.danger,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  emptyText: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  emptySubtext: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  retryButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.xl,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortContainer: {
    backgroundColor: AppTheme.colors.cardInner,
    padding: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  sortButtonActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.colors.textDark,
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  tokenCard: {
    backgroundColor: AppTheme.colors.card,
    marginHorizontal: AppTheme.spacing.md,
    marginVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  tokenNameSection: {
    flex: 1,
  },
  tokenName: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    marginBottom: 2,
  },
  tokenSymbol: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  chainBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  chainText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  valuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  valueLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  performanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  performancePositive: {
    color: '#2ecc71',
    backgroundColor: '#e8f5e8',
  },
  performanceNegative: {
    color: '#e74c3c',
    backgroundColor: '#fdeaea',
  },
  addressText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  addressLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 6,
    fontWeight: '600'
  },
  addressValue: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    flex: 1
  },
  blockchainSection: {
    marginBottom: 24,
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  blockchainTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  blockchainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  blockchainStats: {
    alignItems: 'flex-end',
  },
  tokenCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  blockchainValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
});
