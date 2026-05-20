/**
 * Returns theme colors driven by the active AppTheme from ThemeContext.
 * Falls back to the static Colors.dark values when called outside a ThemeProvider
 * (e.g. during SSR / admin screens that haven't migrated yet).
 */

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

const themeColorMap = {
  background: (t: ReturnType<typeof useAppTheme>['theme']) =>
    t.backgrounds.card,
  text: (t: ReturnType<typeof useAppTheme>['theme']) => t.text.primary,
  title: (t: ReturnType<typeof useAppTheme>['theme']) => t.text.title,
  tint: (t: ReturnType<typeof useAppTheme>['theme']) => t.accent.mid,
  icon: (t: ReturnType<typeof useAppTheme>['theme']) => t.icons.primary,
  tabIconDefault: (t: ReturnType<typeof useAppTheme>['theme']) =>
    t.icons.secondary,
  tabIconSelected: (t: ReturnType<typeof useAppTheme>['theme']) =>
    t.tabBar.activeTint,
} as const;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const colorFromProps = props['dark'];
  if (colorFromProps) return colorFromProps;

  const { theme } = useAppTheme();
  const resolver = themeColorMap[colorName as keyof typeof themeColorMap];
  if (resolver) return resolver(theme);

  // Fallback for any unmapped keys
  return Colors.dark[colorName];
}
