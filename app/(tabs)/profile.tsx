import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { loadProfilePhoto } from '@/services/profilePhotoService';
import { checkUserDocument, logCurrentUserInfo } from '@/utils/adminSetup';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, appUser, logout } = useAuth();
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
    }, [user])
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
      ]
    );
  };

  type MenuItemIcon =
    | 'person.circle'
    | 'wrench'
    | 'questionmark.circle'
    | 'info.circle'
    | 'doc.text'
    | 'gear';

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
      }
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
              resizeMode='contain'
            />
            <ThemedText type='title'>Profile</ThemedText>
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
            <ThemedText type='defaultSemiBold' style={styles.userName}>
              {appUser?.displayName || 'Student'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            {appUser?.isAdmin && (
              <View style={styles.adminBadge}>
                <ThemedText style={styles.adminText}>Administrator</ThemedText>
              </View>
            )}
          </View>
        </View>

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
                  <IconSymbol name={item.icon} size={20} color='#6996b3' />
                </View>
                <View style={styles.menuTextContainer}>
                  <ThemedText type='defaultSemiBold' style={styles.menuTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.menuSubtitle}>
                    {item.subtitle}
                  </ThemedText>
                </View>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#464655' />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol name='arrow.right.square' size={20} color='#f54707' />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    // paddingBottom: 20,
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    marginRight: 16,
    gap: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
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
    color: '#444',
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: 12,
    color: '#07b524',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#444',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#feded2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#fea382',
    marginBottom: 30,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  signOutText: {
    color: '#f54707',
    fontSize: 16,
    fontFamily: 'berlin-sans-fb-bold',
    fontWeight: '500',
    letterSpacing: 1,
    marginLeft: 8,
  },
});
