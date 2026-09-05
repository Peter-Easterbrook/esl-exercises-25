// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SFSymbol, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<
  Record<SFSymbol, ComponentProps<typeof MaterialIcons>['name']>
>;

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
  'exclamationmark.triangle': 'warning-amber',
  'exclamationmark.triangle.fill': 'warning',

  // Content icons
  photo: 'photo',
  link: 'link',
  'link.circle': 'link',
  clock: 'schedule',
  book: 'menu-book',
  'book.circle.fill': 'menu-book',
  'books.vertical': 'menu-book',
  'text.bubble': 'chat-bubble-outline',
  'doc.text': 'description',
  'doc.text.fill': 'description',
  'doc.text.magnifyingglass': 'manage-search',
  'doc.badge.plus': 'note-add',
  ear: 'hearing',
  folder: 'folder',
  'folder.circle': 'folder',
  'folder.circle.fill': 'folder',
  magnifyingglass: 'search',
  'questionmark.circle': 'help-outline',
  'questionmark.circle.fill': 'help',
  'info.circle': 'info-outline',
  bell: 'notifications',
  'person.circle': 'account-circle',
  'person.circle.fill': 'account-circle',
  'person.2': 'group',
  'person.2.fill': 'group',
  'person.2.circle': 'supervisor-account',
  calendar: 'event',
  'circle.fill': 'circle',
  'flame.fill': 'local-fire-department',
  'square.and.arrow.down': 'file-download',
  'square.and.arrow.up': 'share',
  'arrow.right.square': 'exit-to-app',
  'arrow.clockwise': 'refresh',
  'arrow.counterclockwise': 'undo',
  'arrow.down.circle': 'arrow-circle-down',
  'chart.pie': 'pie-chart',
  eye: 'visibility',
  'eye.slash': 'visibility-off',
  'camera.fill': 'camera',
  globe: 'public',
  'lock.fill': 'lock',
  'lock.shield': 'security',
  'envelope.fill': 'email',
  'externaldrive.badge.xmark': 'sync-problem',

  // Language & Grammar icons
  translate: 'translate',
  'textformat.abc.dottedunderline': 'spellcheck',
  'quote.bubble': 'format-quote',
  textformat: 'text-fields',
  abc: 'abc',
  'quote.opening': 'format-quote',
  'quote.closing': 'format-quote',

  // Learning & Education icons
  graduationcap: 'school',
  'graduationcap.fill': 'school',
  'questionmark.square': 'quiz',
  'list.clipboard': 'assignment',
  lightbulb: 'lightbulb-outline',
  'lightbulb.fill': 'lightbulb',
  star: 'star-outline',
  'star.fill': 'star',
  'chart.line.uptrend.xyaxis': 'trending-up',

  // Communication icons
  message: 'message',
  'bubble.left.and.bubble.right': 'chat',
  'bubble.left.and.bubble.right.fill': 'forum',
  mic: 'record-voice-over',

  // Miscellaneous icons
  newspaper: 'article',
  'book.closed': 'subject',
  'clock.arrow.circlepath': 'history',
  'puzzlepiece.extension': 'extension',
  trophy: 'emoji-events',
  'trophy.fill': 'emoji-events',
} satisfies IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/** Fallback glyph rendered when a name has no mapping (e.g. a stored icon
 * whose key was renamed in code but never migrated in Firestore). */
const FALLBACK_ICON = 'help-outline' as const;

/** Every icon name IconSymbol can render. */
export const ICON_SYMBOL_NAMES = Object.keys(MAPPING) as IconSymbolName[];

/**
 * Whether `name` resolves to a real glyph. Use for values that come from the
 * database rather than from source, which the type system cannot check.
 */
export function isValidIconName(
  name: string | undefined | null,
): name is IconSymbolName {
  return !!name && name in MAPPING;
}

/** Icon shown in place of an unrecognised stored value. */
export const UNKNOWN_ICON: IconSymbolName = 'questionmark.circle';

/**
 * Coerce a database-sourced icon string to a renderable name. Keys renamed in
 * code are not migrated in Firestore, so a stored value may no longer map to
 * anything; this renders a visible marker instead of silently nothing.
 */
export function resolveIconName(name: string | undefined | null): IconSymbolName {
  return isValidIconName(name) ? name : UNKNOWN_ICON;
}

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
      name={MAPPING[name] ?? FALLBACK_ICON}
      style={style}
    />
  );
}
