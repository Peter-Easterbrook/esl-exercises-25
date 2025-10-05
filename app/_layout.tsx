import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='auth/index' options={{ headerShown: false }} />
          <Stack.Screen
            name='exercise/[id]'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name='admin/index' options={{ headerShown: false }} />
          <Stack.Screen
            name='admin/add-exercise'
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='admin/manage-exercises'
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='admin/upload-files'
            options={{ headerShown: false }}
          />
        </Stack>
        <StatusBar style='dark' />
      </ThemeProvider>
    </AuthProvider>
  );
}
