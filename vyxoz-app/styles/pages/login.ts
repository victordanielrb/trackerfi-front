import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: AppTheme.borderRadius.xl,
    paddingVertical: AppTheme.spacing.xs,
    paddingHorizontal: 10,
    ...AppTheme.shadows.card,
  },
  langButton: {
    marginHorizontal: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.cardInner,
  },
  langButtonActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  langText: {
    fontWeight: 'bold',
    color: AppTheme.colors.textDark,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppTheme.spacing.lg,
  },
  formContainer: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: 30,
    ...AppTheme.shadows.card,
  },
  title: {
    ...AppTheme.typography.title,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textDark,
  },
  subtitle: {
    ...AppTheme.typography.body,
    textAlign: 'center',
    marginBottom: 30,
    color: AppTheme.colors.textMuted,
  },
  inputContainer: {
    marginBottom: AppTheme.spacing.lg,
  },
  label: {
    ...AppTheme.typography.label,
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    ...AppTheme.typography.body,
    backgroundColor: AppTheme.colors.cardInner,
  },
  submitButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
  submitButtonText: {
    color: AppTheme.colors.card,
    ...AppTheme.typography.sectionTitle,
  },
  toggleButton: {
    marginTop: AppTheme.spacing.lg,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: AppTheme.colors.primary,
    ...AppTheme.typography.body,
  },
  testButtonsContainer: {
    marginTop: 30,
    paddingTop: AppTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  testSectionTitle: {
    ...AppTheme.typography.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: AppTheme.colors.textMuted,
  },
  testButton: {
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.md,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  testRegisterButton: {
    backgroundColor: '#E8F5E8',
    borderColor: AppTheme.colors.success,
  },
  testLoginButton: {
    backgroundColor: '#E3F2FD',
    borderColor: AppTheme.colors.primary,
  },
  testButtonText: {
    ...AppTheme.typography.body,
    fontWeight: '600',
  },
  biometricSection: {
    marginTop: AppTheme.spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: AppTheme.colors.border,
  },
  dividerText: {
    paddingHorizontal: AppTheme.spacing.md,
    color: AppTheme.colors.textMuted,
    ...AppTheme.typography.body,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.borderRadius.sm,
    padding: 15,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
  },
  biometricButtonText: {
    color: AppTheme.colors.primary,
    ...AppTheme.typography.body,
    fontWeight: '600',
    marginLeft: 10,
  },
});
