import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    backgroundColor: AppTheme.colors.cardInner,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppTheme.spacing.md,
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: AppTheme.borderRadius.md,
    marginRight: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...AppTheme.typography.label,
    color: AppTheme.colors.textDark,
    marginBottom: AppTheme.spacing.xs,
  },
  cardDescription: {
    ...AppTheme.typography.small,
    color: AppTheme.colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.borderRadius.md,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  languageContainer: {
    backgroundColor: AppTheme.colors.border,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.borderRadius.sm,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.colors.textMuted,
  },
  arrowContainer: {
    position: 'absolute',
    right: AppTheme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  infoFooter: {
    backgroundColor: AppTheme.colors.card,
    margin: AppTheme.spacing.md,
    marginTop: 0,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
  },
  infoText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
});
