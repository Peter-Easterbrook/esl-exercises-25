import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='auth/index' options={{ headerShown: false }} />
          <Stack.Screen
            name='exercise/[id]'
            options={{
              presentation: 'modal',
              title: 'Exercise',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#333',
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
        <StatusBar style='auto' />
      </ThemeProvider>
    </AuthProvider>
  );
}
