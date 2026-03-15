import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.xl,
    margin: AppTheme.spacing.md,
    ...AppTheme.shadows.card,
  },
  title: {
    ...AppTheme.typography.subtitle,
    color: AppTheme.colors.textDark,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  subtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.xl,
  },
  form: {
    gap: AppTheme.spacing.md,
  },
  label: {
    ...AppTheme.typography.label,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    fontSize: 16,
    backgroundColor: AppTheme.colors.cardInner,
    color: AppTheme.colors.textDark,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: AppTheme.colors.cardInner,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  cancelButtonText: {
    color: AppTheme.colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: AppTheme.colors.border,
  },
});
