import { StyleSheet, Platform } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.borderRadius.xl,
    borderTopRightRadius: AppTheme.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  title: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
  },
  closeButton: {
    padding: AppTheme.spacing.xs,
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
  },
  section: {
    marginTop: AppTheme.spacing.xl,
  },
  sectionTitle: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: AppTheme.spacing.md,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
  },
  avatarContainer: {
    marginRight: AppTheme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...AppTheme.typography.sectionTitle,
    color: AppTheme.colors.textDark,
  },
  userEmail: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: AppTheme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...AppTheme.typography.body,
    fontWeight: '500',
    color: AppTheme.colors.textDark,
  },
  settingDescription: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  infoText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    marginLeft: 10,
    flex: 1,
  },
  passwordSection: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
  },
  passwordLabel: {
    ...AppTheme.typography.body,
    fontWeight: '500',
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    ...AppTheme.typography.body,
    backgroundColor: AppTheme.colors.card,
    marginBottom: AppTheme.spacing.md,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: AppTheme.spacing.md,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.cardInner,
  },
  cancelButtonText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  confirmButtonText: {
    color: AppTheme.colors.card,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.dangerLight,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.xl,
    marginBottom: AppTheme.spacing.md,
  },
  logoutButtonText: {
    color: AppTheme.colors.danger,
    ...AppTheme.typography.body,
    fontWeight: '600',
    marginLeft: AppTheme.spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    color: AppTheme.colors.textLight,
    ...AppTheme.typography.small,
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.lg,
  },
});
