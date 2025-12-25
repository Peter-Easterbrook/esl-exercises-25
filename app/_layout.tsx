import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'berlin-sans-fb': require('../assets/fonts/Berlinsans.otf'),
    'berlin-sans-fb-bold': require('../assets/fonts/Berlinsans_bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack
            screenOptions={{
              animation: 'default', // Global default
            }}
          >
            {/* Main tabs - no animation (instant) */}
            <Stack.Screen
              name='(tabs)'
              options={{
                headerShown: false,
                animation: 'none',
              }}
            />

            {/* Auth screen - fade in for welcoming feel */}
            <Stack.Screen
              name='auth/index'
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />

            {/* Exercise screen - slide from right (natural forward flow) */}
            <Stack.Screen
              name='exercise/[id]'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Admin panel - slide from right (consistent with admin sub-screens) */}
            <Stack.Screen
              name='admin/index'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Add exercise - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/add-exercise'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Manage exercises - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/manage-exercises'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            {/* Manage categories - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/manage-categories'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Manage users - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/manage-users'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Upload files - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/upload-files'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Analytics - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/analytics'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* App Settings - slide from right (sequential flow) */}
            <Stack.Screen
              name='admin/app-settings'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* About screen - slide from right (informational flow) */}
            <Stack.Screen
              name='about'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Privacy Policy - slide from right (informational flow) */}
            <Stack.Screen
              name='privacy-policy'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Account Settings - slide from right (settings flow) */}
            <Stack.Screen
              name='account-settings'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Help & Support - slide from right (informational flow) */}
            <Stack.Screen
              name='help-support'
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />

            {/* Modal - slide from bottom (traditional modal) */}
            <Stack.Screen
              name='modal'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
          <StatusBar style='dark' />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
