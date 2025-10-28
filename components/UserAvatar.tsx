import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface UserAvatarProps {
  displayName?: string;
  email: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  email,
  size = 64,
}) => {
  // Get initials from displayName or email
  const getInitials = (): string => {
    if (displayName && displayName.trim()) {
      const names = displayName.trim().split(' ');
      if (names.length >= 2) {
        // First letter of first and last name
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      // First letter of single name
      return names[0][0].toUpperCase();
    }
    // Fall back to first letter of email
    return email[0].toUpperCase();
  };

  const initials = getInitials();
  const fontSize = size * 0.5; // 40% of avatar size

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.initials,
          {
            fontSize: fontSize,
            lineHeight: size,
          },
        ]}
      >
        {initials}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#0078ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
