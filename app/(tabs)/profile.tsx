import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { checkUserDocument, logCurrentUserInfo } from '@/utils/adminSetup';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, appUser, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/auth');
          } catch (error) {
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

  const menuItems = [
    {
      icon: 'person.circle',
      title: 'Account Settings',
      subtitle: 'Update your profile information',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'Account settings will be available in a future update.'
        ),
    },
    {
      icon: 'wrench',
      title: 'Admin Setup Helper',
      subtitle: 'Get info to set up admin access',
      onPress: handleAdminSetup,
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'Notification settings will be available in a future update.'
        ),
    },
    {
      icon: 'chart.bar',
      title: 'Export Progress',
      subtitle: 'Download your learning progress',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'Progress export will be available in a future update.'
        ),
    },
    {
      icon: 'questionmark.circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () =>
        Alert.alert(
          'Help & Support',
          'For help, please contact support@eslexercises.com'
        ),
    },
    {
      icon: 'info.circle',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () =>
        Alert.alert(
          'ESL Exercises',
          'Version 1.0.0\n\nBuilt to help non-native English speakers improve their language skills.'
        ),
    },
  ];

  // Add admin panel item if user is admin
  if (appUser?.isAdmin) {
    menuItems.unshift({
      icon: 'gear',
      title: 'Admin Panel',
      subtitle: 'Manage exercises and content',
      onPress: handleAdminPanel,
    });
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type='title'>Profile</ThemedText>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userIcon}>
            <IconSymbol name='person.fill' size={32} color='#2196F3' />
          </View>

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
                  <IconSymbol name={item.icon} size={20} color='#2196F3' />
                </View>
                <View style={styles.menuTextContainer}>
                  <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.menuSubtitle}>
                    {item.subtitle}
                  </ThemedText>
                </View>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#666' />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol name='arrow.right.square' size={20} color='#F44336' />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    // paddingBottom: 20,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    color: '#666',
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
    color: '#2e7d2e',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  signOutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
