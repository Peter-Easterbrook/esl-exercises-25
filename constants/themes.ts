export type ThemeId = 'default' | 'sky' | 'sunset' | 'winter';

export interface AppTheme {
  id: ThemeId;
  name: string;
  description: string;
  backgrounds: {
    app: string;
    card: string;
    subtle: string;
    tinted: string;
    tintedStrong: string;
    progressCircle: string;
  };
  text: {
    primary: string;
    title: string;
    secondary: string;
    accent: string;
  };
  accent: {
    darkest: string;
    dark: string;
    mid: string;
    light: string;
    lightest: string;
  };
  tabBar: {
    background: string;
    activeTint: string;
    inactiveTint: string;
    border: string;
  };
  icons: {
    primary: string;
    secondary: string;
    tertiary: string;
    placeholder: string;
  };
  borders: {
    subtle: string;
    light: string;
    medium: string;
    strong: string;
    divider: string;
    dividerLight: string;
  };
  status: {
    success: string;
    warning: string;
    danger: string;
    error: string;
  };
  difficulty: {
    beginner: { background: string; text: string };
    intermediate: { background: string; text: string };
    advanced: { background: string; text: string };
  };
  destructive: {
    background: string;
    border: string;
    text: string;
  };
  shadow: {
    color: string;
    level1: string;
    level2: string;
    level3: string;
  };
}

export const themes: Record<ThemeId, AppTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Deep ocean blues on clean white',
    backgrounds: {
      app: '#fafbfc',
      card: '#ffffff',
      subtle: '#fafbfc',
      tinted: 'rgba(105, 150, 179, 0.03)',
      tintedStrong: 'rgba(105, 150, 179, 0.08)',
      progressCircle: '#f0f8ff',
    },
    text: {
      primary: '#11181C',
      title: '#000000',
      secondary: '#444444',
      accent: '#6996b3',
    },
    accent: {
      darkest: '#004c6d',
      dark: '#3d708f',
      mid: '#6996b3',
      light: '#abd2ec',
      lightest: '#c1e7ff',
    },
    tabBar: {
      background: '#ffffff',
      activeTint: '#004c6d',
      inactiveTint: '#abd2ec',
      border: '#e0e0e0',
    },
    icons: {
      primary: '#3d526e',
      secondary: '#687076',
      tertiary: '#464655',
      placeholder: '#cccccc',
    },
    borders: {
      subtle: 'rgba(105, 150, 179, 0.08)',
      light: 'rgba(105, 150, 179, 0.15)',
      medium: 'rgba(105, 150, 179, 0.20)',
      strong: '#6996b3',
      divider: '#eeeeee',
      dividerLight: '#f0f0f0',
    },
    status: {
      success: '#07b524',
      warning: '#ff9500',
      danger: '#ff3b30',
      error: '#6f0202',
    },
    difficulty: {
      beginner: { background: '#e8f5e8', text: '#07b524' },
      intermediate: { background: '#fff8dc', text: '#FF9800' },
      advanced: { background: '#f9dfd8', text: '#6f0202' },
    },
    destructive: {
      background: '#feded2',
      border: '#fea382',
      text: '#f54707',
    },
    shadow: {
      color: '#004c6d',
      level1:
        '0px 1px 3px rgba(0, 76, 109, 0.08), 0px 4px 12px rgba(0, 76, 109, 0.06)',
      level2:
        '0px 4px 8px rgba(0, 76, 109, 0.12), 0px 8px 24px rgba(0, 76, 109, 0.08)',
      level3:
        '0px 12px 28px rgba(0, 76, 109, 0.15), 0px 24px 48px rgba(0, 76, 109, 0.10)',
    },
  },

  sky: {
    id: 'sky',
    name: 'Sky',
    description: 'Pale misty-blue with teal-slate accents',
    backgrounds: {
      app: '#EDF6F8',
      card: '#F5FAFB',
      subtle: '#EDF6F8',
      tinted: 'rgba(165, 192, 192, 0.05)',
      tintedStrong: 'rgba(165, 192, 192, 0.12)',
      progressCircle: '#E6F4F6',
    },
    text: {
      primary: '#1A2B2B',
      title: '#0D1E1E',
      secondary: '#4A6060',
      accent: '#6E9FAF',
    },
    accent: {
      darkest: '#3A6B7B',
      dark: '#5A8A9A',
      mid: '#7AABB8',
      light: '#A5C0C0',
      lightest: '#D4E2EC',
    },
    tabBar: {
      background: '#F5FAFB',
      activeTint: '#3A6B7B',
      inactiveTint: '#B0CECE',
      border: '#D4E5E5',
    },
    icons: {
      primary: '#4A7A8A',
      secondary: '#6A9090',
      tertiary: '#547070',
      placeholder: '#B8CCCC',
    },
    borders: {
      subtle: 'rgba(165, 192, 192, 0.10)',
      light: 'rgba(165, 192, 192, 0.18)',
      medium: 'rgba(165, 192, 192, 0.28)',
      strong: '#A5C0C0',
      divider: '#D8EEEE',
      dividerLight: '#E8F4F4',
    },
    status: {
      success: '#2A9D5C',
      warning: '#C47D0E',
      danger: '#CC3333',
      error: '#7B1818',
    },
    difficulty: {
      beginner: { background: '#D9F5E5', text: '#2A9D5C' },
      intermediate: { background: '#FEF5D8', text: '#C47D0E' },
      advanced: { background: '#F5DFDF', text: '#7B1818' },
    },
    destructive: {
      background: '#FAEAEA',
      border: '#E8ABAB',
      text: '#CC3333',
    },
    shadow: {
      color: '#3A6B7B',
      level1:
        '0px 1px 3px rgba(58, 107, 123, 0.08), 0px 4px 12px rgba(58, 107, 123, 0.06)',
      level2:
        '0px 4px 8px rgba(58, 107, 123, 0.12), 0px 8px 24px rgba(58, 107, 123, 0.08)',
      level3:
        '0px 12px 28px rgba(58, 107, 123, 0.15), 0px 24px 48px rgba(58, 107, 123, 0.10)',
    },
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm terracotta and salmon tones',
    backgrounds: {
      app: '#FDF1EB',
      card: '#FFF8F4',
      subtle: '#FDF1EB',
      tinted: 'rgba(210, 130, 100, 0.04)',
      tintedStrong: 'rgba(210, 130, 100, 0.10)',
      progressCircle: '#FEF4EE',
    },
    text: {
      primary: '#2B1C14',
      title: '#1A0E08',
      secondary: '#5E3E2E',
      accent: '#C97A5A',
    },
    accent: {
      darkest: '#8A4030',
      dark: '#B05A42',
      mid: '#C97A5A',
      light: '#E8A07E',
      lightest: '#FADBC8',
    },
    tabBar: {
      background: '#FFF8F4',
      activeTint: '#8A4030',
      inactiveTint: '#E8BEA8',
      border: '#EDD8CC',
    },
    icons: {
      primary: '#9A5040',
      secondary: '#B87060',
      tertiary: '#7A5045',
      placeholder: '#D8B8AC',
    },
    borders: {
      subtle: 'rgba(210, 130, 100, 0.08)',
      light: 'rgba(210, 130, 100, 0.16)',
      medium: 'rgba(210, 130, 100, 0.24)',
      strong: '#D4957A',
      divider: '#EDD8CC',
      dividerLight: '#F5EAE4',
    },
    status: {
      success: '#2A9654',
      warning: '#D4860A',
      danger: '#CC2828',
      error: '#7A1414',
    },
    difficulty: {
      beginner: { background: '#D8F5E4', text: '#2A9654' },
      intermediate: { background: '#FFF3D0', text: '#D4860A' },
      advanced: { background: '#F8E0DC', text: '#7A1414' },
    },
    destructive: {
      background: '#FAEAE8',
      border: '#E8ABAA',
      text: '#CC2828',
    },
    shadow: {
      color: '#8A4030',
      level1:
        '0px 1px 3px rgba(138, 64, 48, 0.08), 0px 4px 12px rgba(138, 64, 48, 0.06)',
      level2:
        '0px 4px 8px rgba(138, 64, 48, 0.12), 0px 8px 24px rgba(138, 64, 48, 0.08)',
      level3:
        '0px 12px 28px rgba(138, 64, 48, 0.15), 0px 24px 48px rgba(138, 64, 48, 0.10)',
    },
  },

  winter: {
    id: 'winter',
    name: 'Winter',
    description: "Icy robin's egg and duck egg tones",
    backgrounds: {
      app: '#EAF3F3',
      card: '#F4FAFA',
      subtle: '#EAF3F3',
      tinted: 'rgba(106, 158, 158, 0.04)',
      tintedStrong: 'rgba(106, 158, 158, 0.10)',
      progressCircle: '#E2F2F2',
    },
    text: {
      primary: '#142020',
      title: '#0A1414',
      secondary: '#3A5858',
      accent: '#5A8E8E',
    },
    accent: {
      darkest: '#2E5C5C',
      dark: '#4A7878',
      mid: '#6A9E9E',
      light: '#A8C8C8',
      lightest: '#D5E4E4',
    },
    tabBar: {
      background: '#F4FAFA',
      activeTint: '#2E5C5C',
      inactiveTint: '#A8CCCC',
      border: '#C8E2E2',
    },
    icons: {
      primary: '#3A6868',
      secondary: '#5A8888',
      tertiary: '#487070',
      placeholder: '#AACCCC',
    },
    borders: {
      subtle: 'rgba(106, 158, 158, 0.08)',
      light: 'rgba(106, 158, 158, 0.16)',
      medium: 'rgba(106, 158, 158, 0.24)',
      strong: '#8ABABA',
      divider: '#D0E8E8',
      dividerLight: '#E4F2F2',
    },
    status: {
      success: '#1A9650',
      warning: '#B87A10',
      danger: '#C42828',
      error: '#6E1414',
    },
    difficulty: {
      beginner: { background: '#CCF2E4', text: '#1A9650' },
      intermediate: { background: '#FEF0CC', text: '#B87A10' },
      advanced: { background: '#F4DCDC', text: '#6E1414' },
    },
    destructive: {
      background: '#FAE8E8',
      border: '#E4A8A8',
      text: '#C42828',
    },
    shadow: {
      color: '#2E5C5C',
      level1:
        '0px 1px 3px rgba(46, 92, 92, 0.08), 0px 4px 12px rgba(46, 92, 92, 0.06)',
      level2:
        '0px 4px 8px rgba(46, 92, 92, 0.12), 0px 8px 24px rgba(46, 92, 92, 0.08)',
      level3:
        '0px 12px 28px rgba(46, 92, 92, 0.15), 0px 24px 48px rgba(46, 92, 92, 0.10)',
    },
  },
};

export const themeList: AppTheme[] = Object.values(themes);

/** Emoji swatch used in the theme picker UI */
export const themeSwatches: Record<ThemeId, string> = {
  default: '🌊',
  sky: '☁️',
  sunset: '🌅',
  winter: '❄️',
};
