import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/UserAvatar';
import { LEVEL_COLOURS } from '@/constants/levelTest';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { loadProfilePhoto } from '@/services/profilePhotoService';
import { checkUserDocument, logCurrentUserInfo } from '@/utils/adminSetup';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, appUser, logout } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  // Load profile photo when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadUserPhoto = async () => {
        if (user) {
          const photoUri = await loadProfilePhoto(user.uid);
          setProfilePhotoUri(photoUri);
        }
      };
      loadUserPhoto();
    }, [user]),
  );

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Navigation to /auth is handled automatically by TabLayout
            // when auth state changes - no need to manually navigate
          } catch {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleAdminPanel = () => {
    if (appUser?.isAdmin) {
      router.push('/admin');
    } else {
      Alert.alert('Access Denied', 'You do not have administrator privileges.');
    }
  };

  const handleAdminSetup = async () => {
    logCurrentUserInfo(user);

    if (user) {
      console.log('🔧 Checking if admin document exists...');
      await checkUserDocument(user.uid);
    }

    Alert.alert(
      'Admin Setup Info',
      `Check the console for detailed info about your user document.

Steps to make admin:
1. Go to Firebase Console → Firestore Database
2. Go to "users" collection
3. Create/Edit document with ID: ${user?.uid}
4. Set field "isAdmin" to true (boolean)
5. Restart the app

Your email: ${user?.email}
Your UID: ${user?.uid}`,
      [
        {
          text: 'Check Again',
          onPress: () => user && checkUserDocument(user.uid),
        },
        { text: 'OK' },
      ],
    );
  };

  type MenuItemIcon =
    | 'person.circle'
    | 'wrench'
    | 'questionmark.circle'
    | 'info.circle'
    | 'doc.text'
    | 'gear'
    | 'star';

  const menuItems: {
    icon: MenuItemIcon;
    title: string;
    subtitle: string;
    onPress: () => void;
  }[] = [
    {
      icon: 'person.circle',
      title: 'Account Settings',
      subtitle: 'Update your profile information',
      onPress: () => router.push('/account-settings'),
    },
    {
      icon: 'questionmark.circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => router.push('/help-support'),
    },
    {
      icon: 'star',
      title: 'Rate this App',
      subtitle: 'Enjoying the app? Leave us a review!',
      onPress: () =>
        Linking.openURL(
          'https://play.google.com/store/apps/details?id=com.petereasterbro1.eslexercises25',
        ),
    },
    {
      icon: 'info.circle',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => router.push('/about'),
    },
    {
      icon: 'doc.text',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      onPress: () => router.push('/privacy-policy' as any),
    },
  ];

  // Add admin-only items if user is admin
  if (appUser?.isAdmin) {
    menuItems.unshift(
      {
        icon: 'gear' as MenuItemIcon,
        title: 'Admin Panel',
        subtitle: 'Manage exercises and content',
        onPress: handleAdminPanel,
      },
      {
        icon: 'wrench' as MenuItemIcon,
        title: 'Admin Setup Helper',
        subtitle: 'Get info to set up admin access',
        onPress: handleAdminSetup,
      },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Image
              source={require('@/assets/images/LL2020.png')}
              style={{ width: 45, height: 45 }}
              resizeMode="contain"
            />
            <ThemedText type="title">Profile</ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card */}
          <View style={styles.userCard}>
            <UserAvatar
              displayName={appUser?.displayName}
              email={user?.email || ''}
              size={64}
              photoUri={profilePhotoUri}
            />

            <View style={styles.userInfo}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>
                {appUser?.displayName || 'Student'}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              {appUser?.isAdmin && (
                <View style={styles.adminBadge}>
                  <ThemedText style={styles.adminText}>
                    Administrator
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Level Badge Card */}
          {appUser?.englishLevel && (
            <View style={styles.levelBadgeCard}>
              <View style={styles.levelBadgeLeft}>
                <View
                  style={[
                    styles.levelPill,
                    {
                      backgroundColor:
                        LEVEL_COLOURS[appUser.englishLevel] ?? theme.accent.mid,
                    },
                  ]}
                >
                  <ThemedText style={styles.levelPillText}>
                    {appUser.englishLevel}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.levelTitle}>
                    Your English Level
                  </ThemedText>
                  <ThemedText style={styles.levelSubtitle}>
                    Based on your last Level Test
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => router.push('/(tabs)/')}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.retakeText}>Retake</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {!appUser?.englishLevel && (
            <TouchableOpacity
              style={styles.takeLevelTestCard}
              onPress={() => router.push('/(tabs)/')}
              activeOpacity={0.7}
            >
              <IconSymbol
                name="graduationcap"
                size={22}
                color={theme.accent.mid}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.levelTitle}>
                  Discover Your Level
                </ThemedText>
                <ThemedText style={styles.levelSubtitle}>
                  Take the free Level Test to find your CEFR level
                </ThemedText>
              </View>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.icons.tertiary}
              />
            </TouchableOpacity>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <IconSymbol
                      name={item.icon}
                      size={20}
                      color={theme.accent.mid}
                    />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.menuSubtitle}>
                      {item.subtitle}
                    </ThemedText>
                  </View>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={theme.icons.tertiary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="arrow.right.square"
              size={20}
              color={theme.destructive.text}
            />
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      backgroundColor: theme.backgrounds.app,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    content: {
      flex: 1,
      marginTop: 10,
      paddingTop: 10,
    },
    contentContainer: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgrounds.card,
      padding: 24,
      borderRadius: 16,
      marginBottom: 24,
      marginHorizontal: 2,
      gap: 16,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },
    adminBadge: {
      backgroundColor: theme.difficulty.beginner.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    adminText: {
      fontSize: 12,
      color: theme.status.success,
    },
    menuSection: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.dividerLight,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.backgrounds.tintedStrong,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuTextContainer: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      color: theme.text.title,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.destructive.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.destructive.border,
      marginBottom: 30,
    },
    signOutText: {
      color: theme.destructive.text,
      fontSize: 16,
      fontFamily: 'berlin-sans-fb-bold',
      fontWeight: '500',
      letterSpacing: 1,
      marginLeft: 8,
    },
    levelBadgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.backgrounds.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      marginHorizontal: 2,
      gap: 12,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    levelBadgeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    levelPill: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    levelPillText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    levelTitle: {
      fontSize: 15,
      marginBottom: 2,
    },
    levelSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
    },
    retakeButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.backgrounds.tintedStrong,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.borders.medium,
    },
    retakeText: {
      fontSize: 13,
      color: theme.accent.mid,
      fontWeight: '600',
    },
    takeLevelTestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgrounds.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      marginHorizontal: 2,
      gap: 14,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
  });
}
