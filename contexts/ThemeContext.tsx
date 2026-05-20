import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AppTheme, ThemeId, themes } from '@/constants/themes';

const STORAGE_KEY = '@app_theme';

interface ThemeContextValue {
  theme: AppTheme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.default,
  themeId: 'default',
  setTheme: async () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('default');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in themes) {
        setThemeId(stored as ThemeId);
      }
    });
  }, []);

  const setTheme = useCallback(async (id: ThemeId) => {
    setThemeId(id);
    await AsyncStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme: themes[themeId], themeId, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
