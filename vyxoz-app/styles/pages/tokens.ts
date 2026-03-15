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
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.background
  },
  title: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
  },
  alertsHeaderBtn: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: AppTheme.borderRadius.sm,
  },
  alertsHeaderBtnText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card
  },
  favoriteTokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.sm,
    marginBottom: AppTheme.spacing.xs,
    ...AppTheme.shadows.card,
  },
  tokenText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textDark,
  },
  tokenSub: {
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.small,
  },
  section: { marginTop: AppTheme.spacing.xl },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.cardInner,
    backgroundColor: AppTheme.colors.card
  },
  small: {
    color: AppTheme.colors.textLight,
    ...AppTheme.typography.small,
  },
  formRow: {
    flexDirection: 'row',
    marginTop: AppTheme.spacing.md,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
    marginRight: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.card
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm
  },
  btnPrimary: { backgroundColor: AppTheme.colors.success },
  btnOutline: { borderWidth: 1, borderColor: AppTheme.colors.border },
  btnText: { color: AppTheme.colors.card, fontWeight: '700' },
  btnCreate: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    marginLeft: AppTheme.spacing.sm
  },

  // Search styles
  searchContainer: { marginVertical: AppTheme.spacing.md, position: 'relative' },
  searchInput: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    ...AppTheme.typography.body,
  },
  searchLoader: { position: 'absolute', right: AppTheme.spacing.md, top: AppTheme.spacing.md },
  searchResultsContainer: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    marginTop: AppTheme.spacing.sm,
    ...AppTheme.shadows.card,
    maxHeight: 300
  },
  searchResultItem: {
    padding: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.cardInner,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchResultSymbol: {
    ...AppTheme.typography.body,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    marginRight: AppTheme.spacing.sm,
    minWidth: 60
  },
  searchResultName: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    flex: 1
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    ...AppTheme.shadows.card,
  },
  modalScrollView: {
    padding: AppTheme.spacing.lg,
    flexGrow: 1
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.sm
  },
  closeBtnText: { fontSize: 24, color: AppTheme.colors.textMuted },
  modalTitle: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
    marginTop: AppTheme.spacing.sm
  },
  modalSymbol: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginBottom: AppTheme.spacing.md
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.cardInner
  },
  detailLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted
  },
  detailValue: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.textDark,
  },

  chartBtn: {
    backgroundColor: AppTheme.colors.primary,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    marginTop: AppTheme.spacing.md,
    alignItems: 'center'
  },
  chartBtnText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.body,
    fontWeight: '700'
  },

  favoriteBtn: {
    backgroundColor: AppTheme.colors.success,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    marginTop: AppTheme.spacing.sm,
    alignItems: 'center'
  },
  favoriteBtnText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.body,
    fontWeight: '700'
  },

  removeBtn: {
    backgroundColor: AppTheme.colors.danger,
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
    minWidth: 80
  },
  removeBtnText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.body,
    fontWeight: '600'
  },

  tradingSection: {
    marginBottom: AppTheme.spacing.md,
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.sm
  },
  sectionTitle: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.sm
  },
  tradingText: {
    ...AppTheme.typography.body,
    marginVertical: 2
  },
  ohlcText: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    marginVertical: 2,
    fontFamily: 'monospace'
  },

  backBtn: {
    backgroundColor: AppTheme.colors.textMuted,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    marginTop: AppTheme.spacing.sm,
    alignItems: 'center'
  },
  backBtnText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.body,
    fontWeight: '600'
  },

  // Chart modal styles - fullscreen
  chartModalOverlay: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  chartModalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Alert styles
  alertToken: {
    ...AppTheme.typography.body,
    fontWeight: '700',
    color: AppTheme.colors.textDark
  },
  alertDetail: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginTop: 2
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.colors.textLight,
    marginTop: AppTheme.spacing.md,
    fontStyle: 'italic'
  },

  // Modal Alert Section
  modalAlertSection: {
    marginTop: AppTheme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    paddingTop: AppTheme.spacing.md,
  },
  createAlertBtn: {
    backgroundColor: AppTheme.colors.primaryLight,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
  },
  createAlertBtnText: {
    color: AppTheme.colors.primary,
    fontWeight: '600',
    ...AppTheme.typography.body,
  },
  alertForm: {
    marginTop: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.cardInner,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
  },
  alertFormLabel: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginBottom: AppTheme.spacing.md,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: AppTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card,
  },
  typeBtnActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  typeBtnText: {
    color: AppTheme.colors.textDark,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: AppTheme.colors.card,
  },
  alertInput: {
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    marginBottom: AppTheme.spacing.md,
  },
  saveAlertBtn: {
    backgroundColor: AppTheme.colors.primary,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: 'center',
  },
  saveAlertBtnText: {
    color: AppTheme.colors.card,
    fontWeight: '700',
    ...AppTheme.typography.body,
  },
});
