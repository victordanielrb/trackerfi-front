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
    padding: AppTheme.spacing.lg,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.xl,
    paddingTop: 60,
    paddingBottom: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  headerTop: {
    width: '100%',
    marginBottom: AppTheme.spacing.md,
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
  title: {
    margin: 10,
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.xs,
    marginVertical: 10,
  },
  tabButton: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  headerButtons: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  portfolioButton: {
    backgroundColor: AppTheme.colors.success,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
  },
  portfolioButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
  },
  addButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
  },
  emptyText: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    textAlign: 'center',
  },
  emptySubtext: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: AppTheme.spacing.sm,
  },
  errorContainer: {
    backgroundColor: AppTheme.colors.dangerLight,
    padding: AppTheme.spacing.md,
    margin: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.danger,
  },
  errorText: {
    color: AppTheme.colors.danger,
    ...AppTheme.typography.body,
    marginBottom: AppTheme.spacing.sm,
  },
  retryButton: {
    backgroundColor: AppTheme.colors.danger,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.xs,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
  listContainer: {
    padding: AppTheme.spacing.lg,
  },
  walletCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  chainBadge: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.md,
  },
  chainText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: AppTheme.colors.danger,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
  addressText: {
    ...AppTheme.typography.body,
    fontFamily: 'monospace',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  walletNote: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  // Exchange card styles
  exchangeCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  exchangeBadge: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.md,
  },
  exchangeText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
  exchangeActions: {
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
  },
  editButton: {
    backgroundColor: AppTheme.colors.warning,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: 6,
  },
  editButtonText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.small,
    fontWeight: '600',
  },
  apiKeyText: {
    ...AppTheme.typography.body,
    fontFamily: 'monospace',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
  },
  exchangeNote: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
