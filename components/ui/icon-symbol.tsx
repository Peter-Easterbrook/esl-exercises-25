// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'list.bullet': 'list',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
  'person.fill': 'person',

  // Chevrons and arrows
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',

  // Action icons
  'plus': 'add',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  'pencil': 'edit',
  'pencil.circle': 'edit',
  'trash': 'delete',
  'gear': 'settings',
  'wrench': 'build',

  // Status icons
  'checkmark': 'check',
  'checkmark.circle': 'check-circle-outline',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'exclamationmark.circle': 'error-outline',

  // Content icons
  'clock': 'schedule',
  'book': 'menu-book',
  'text.bubble': 'chat-bubble-outline',
  'doc.text': 'description',
  'ear': 'hearing',
  'folder': 'folder',
  'magnifyingglass': 'search',
  'questionmark.circle': 'help-outline',
  'info.circle': 'info-outline',
  'bell': 'notifications',
  'person.circle': 'account-circle',
  'person.2': 'group',
  'person.2.circle': 'supervisor-account',
  'calendar': 'event',
  'circle.fill': 'circle',
  'flame.fill': 'local-fire-department',
  'square.and.arrow.down': 'file-download',
  'square.and.arrow.up': 'share',
  'arrow.right.square': 'exit-to-app',
  'arrow.clockwise': 'refresh',
  'chart.pie': 'pie-chart',
  'folder.circle': 'folder',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
