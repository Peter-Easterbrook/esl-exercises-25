/**
 * Returns theme colors - always uses the light appearance theme (Colors.dark).
 * The naming is inverted: Colors.dark contains light appearance colors.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const colorFromProps = props['dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.dark[colorName];
  }
}
