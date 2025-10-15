import { useThemeColor } from '@/hooks/use-theme-color';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

export type ThemedLoaderProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  size?: 'small' | 'large';
};

export function ThemedLoader({
  style,
  lightColor,
  darkColor,
  size = 'large',
  ...otherProps
}: ThemedLoaderProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );
  const indicatorColor = useThemeColor(
    { light: '#0078ff', dark: '#64B5F6' },
    'tint'
  );

  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      {...otherProps}
    >
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Keep default export for backward compatibility
export default ThemedLoader;
