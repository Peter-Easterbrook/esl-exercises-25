import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CollapsibleProps = PropsWithChildren & (
  | { title: string; collapsed?: never }
  | { collapsed: boolean; title?: never }
);

export function Collapsible({ children, title, collapsed }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  // If collapsed prop is provided, use it (controlled mode)
  // Otherwise use internal state (uncontrolled mode)
  const isCollapsed = collapsed !== undefined ? collapsed : !isOpen;

  return (
    <ThemedView>
      {title && (
        <TouchableOpacity
          style={styles.heading}
          onPress={() => setIsOpen((value) => !value)}
          activeOpacity={0.8}>
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />

          <ThemedText type="defaultSemiBold">{title}</ThemedText>
        </TouchableOpacity>
      )}
      {!isCollapsed && (
        <ThemedView style={[styles.content, !title && styles.noTitleContent]}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
  noTitleContent: {
    marginLeft: 0,
  },
});
