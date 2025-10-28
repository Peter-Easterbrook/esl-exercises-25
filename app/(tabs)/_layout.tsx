import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedLoader } from '@/components/themed-loader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  console.log('TabLayout - user:', !!user, 'loading:', loading);

  if (loading) {
    return <ThemedLoader />;
  }

  if (!user) {
    console.log('No user found, redirecting to auth...');
    return <Redirect href='/auth' />;
  }

  console.log('User authenticated, showing tabs');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0033ff',
        tabBarInactiveTintColor: '#adc6db',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='list.bullet' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='progress'
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='chart.bar.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='person.fill' color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
