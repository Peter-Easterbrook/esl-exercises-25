import { AppTheme } from '@/constants/themes';
import { useAppTheme } from '@/contexts/ThemeContext';
import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface UserAvatarProps {
  displayName?: string;
  email: string;
  size?: number;
  photoUri?: string | null;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  email,
  size = 64,
  photoUri,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Get initials from displayName or email
  const getInitials = (): string => {
    if (displayName && displayName.trim()) {
      const names = displayName.trim().split(/\s+/);
      if (names.length >= 2) {
        // First letter of first and last name
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      // First letter of single name
      return names[0][0].toUpperCase();
    }
    // Fall back to first letter of email
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    // Nothing available yet (e.g. profile still loading)
    return '?';
  };

  const initials = getInitials();
  const fontSize = size * 0.5; // 40% of avatar size

  // If photo URI is provided, show the photo
  if (photoUri) {
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
        <Image
          source={{ uri: photoUri }}
          style={[
            styles.photo,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </View>
    );
  }

  // Otherwise, show initials
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    avatar: {
      backgroundColor: theme.accent.mid,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initials: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    photo: {
      resizeMode: 'cover',
    },
  });
