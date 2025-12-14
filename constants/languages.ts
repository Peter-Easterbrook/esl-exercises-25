export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  es: { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeLabel: 'Español' },
  fr: { code: 'fr', name: 'French', flag: '🇫🇷', nativeLabel: 'Français' },
  de: { code: 'de', name: 'German', flag: '🇩🇪', nativeLabel: 'Deutsch' },
  it: { code: 'it', name: 'Italian', flag: '🇮🇹', nativeLabel: 'Italiano' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_ORDER: LanguageCode[] = ['en', 'es', 'fr', 'de', 'it'];
