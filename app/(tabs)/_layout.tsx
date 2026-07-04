import { HapticTab } from '@/components/haptic-tab';
import { ThemedLoader } from '@/components/themed-loader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
// import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  // const colorScheme = useColorScheme();
  const { user, loading, appUser } = useAuth();
  const { theme } = useAppTheme();

  console.log('TabLayout render - user:', !!user, 'appUser:', !!appUser, 'loading:', loading);

  if (loading) {
    return <ThemedLoader />;
  }

  if (!user) {
    console.log('No user found, redirecting to auth...');
    return <Redirect href="/auth" />;
  }

  console.log('User authenticated, showing tabs');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBar.activeTint,
        tabBarInactiveTintColor: theme.tabBar.inactiveTint,
        tabBarStyle: {
          backgroundColor: theme.tabBar.background,
          borderTopColor: theme.tabBar.border,
          borderTopWidth: 1,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
