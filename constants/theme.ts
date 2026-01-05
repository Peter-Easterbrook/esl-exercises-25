

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  dark: {
    text: '#11181C',
    title: '#000000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  light: {
    text: '#ECEDEE',
    title: '#FFFFFF',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const colors = {
  primary: '#004c6d',
  icon: '#3d526e',
  secondary: '#FF7F50',
  tertiary: '#9bc3e1',
  success: '#07b524',
  warning: '#ff9500',
  danger: '#ff3b30',
  signoutBackground: '#feded2',
  borderColor: '#fea382',
  signoutText: '#f54707',
  beginner: '#07b524',
  intermediate: '#FF9800',
  advanced: '#6f0202'
  };

export const blues = {
  blue1: '#004c6d',
  blue2: '#255e7e',
  blue3: '#3d708f',
  blue4: '#5383a1',
  blue5: '#6996b3',
  blue6: '#7faac6',
  blue7: '#94bed9',
  blue8: '#abd2ec',
  blue9: '#c1e7ff',
};

// Enhanced elevation system with blue-tinted shadows
export const elevation = {
  level1: {
    shadowColor: '#004c6d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    // Web fallback
    boxShadow: '0px 1px 3px rgba(0, 76, 109, 0.08), 0px 4px 12px rgba(0, 76, 109, 0.06)',
  },
  level2: {
    shadowColor: '#004c6d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    boxShadow: '0px 4px 8px rgba(0, 76, 109, 0.12), 0px 8px 24px rgba(0, 76, 109, 0.08)',
  },
  level3: {
    shadowColor: '#004c6d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    boxShadow: '0px 12px 28px rgba(0, 76, 109, 0.15), 0px 24px 48px rgba(0, 76, 109, 0.1)',
  },
};

// Refined border colors
export const borders = {
  subtle: 'rgba(105, 150, 179, 0.08)',
  light: 'rgba(105, 150, 179, 0.15)',
  medium: 'rgba(105, 150, 179, 0.2)',
  strong: '#6996b3',
};

// Background colors
export const backgrounds = {
  primary: '#ffffff',
  subtle: '#fafbfc',
  tinted: 'rgba(105, 150, 179, 0.03)',
  tintedStrong: 'rgba(105, 150, 179, 0.08)',
};
