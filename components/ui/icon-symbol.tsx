// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
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
  plus: 'add',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  pencil: 'edit',
  'pencil.circle': 'edit',
  trash: 'delete',
  gear: 'settings',
  wrench: 'build',

  // Status icons
  checkmark: 'check',
  'checkmark.circle': 'check-circle-outline',
  'checkmark.circle.fill': 'check-circle',
  xmark: 'close',
  'xmark.circle.fill': 'cancel',
  'exclamationmark.circle': 'error-outline',

  // Content icons
  photo: 'photo',
  link: 'link',  
  clock: 'schedule',
  book: 'menu-book',
  'text.bubble': 'chat-bubble-outline',
  'doc.text': 'description',
  'doc.badge.plus': 'note-add',
  ear: 'hearing',
  folder: 'folder',
  magnifyingglass: 'search',
  'questionmark.circle': 'help-outline',
  'info.circle': 'info-outline',
  bell: 'notifications',
  'person.circle': 'account-circle',
  'person.2': 'group',
  'person.2.circle': 'supervisor-account',
  calendar: 'event',
  'circle.fill': 'circle',
  'flame.fill': 'local-fire-department',
  'square.and.arrow.down': 'file-download',
  'square.and.arrow.up': 'share',
  'arrow.right.square': 'exit-to-app',
  'arrow.clockwise': 'refresh',
  'chart.pie': 'pie-chart',
  'folder.circle': 'folder',
  eye: 'visibility',
  'eye.slash': 'visibility-off',
  'camera.fill': 'camera',

  // Language & Grammar icons
  translate: 'translate',
  spellcheck: 'spellcheck',
  'format.quote': 'format-quote',
  'text.format': 'text-fields',
  abc: 'abc',

  // Learning & Education icons
  school: 'school',
  quiz: 'quiz',
  assignment: 'assignment',
  lightbulb: 'lightbulb-outline',
  star: 'star-outline',
  'star.fill': 'star',

  // Communication icons
  message: 'message',
  chat: 'chat',
  forum: 'forum',
  voice: 'record-voice-over',

  // Content icons
  article: 'article',
  subject: 'subject',
  'menu.book': 'menu-book',
  history: 'history',
  extension: 'extension',
  'link.circle': 'link',
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
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
