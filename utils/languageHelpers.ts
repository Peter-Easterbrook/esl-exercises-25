import { getLocales } from 'expo-localization';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode } from '@/constants/languages';
import type { MultiLanguageInstructions } from '@/types';

/**
 * Get the device's default language if supported, otherwise fallback to English
 */
export function getDeviceDefaultLanguage(): LanguageCode {
  try {
    // Get the device's primary language code (e.g., 'en', 'es', 'fr')
    const deviceLanguage = getLocales()[0].languageCode;

    // Check if the device language is in our supported languages
    if (deviceLanguage && deviceLanguage in SUPPORTED_LANGUAGES) {
      return deviceLanguage as LanguageCode;
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }

  // Fallback to English
  return 'en';
}

/**
 * Get instructions for a specific language, with fallback to English
 * Handles both legacy string format and new multi-language object format
 */
export function getInstructionsForLanguage(
  instructions: MultiLanguageInstructions | string,
  languageCode: LanguageCode
): string {
  // Handle legacy string format
  if (typeof instructions === 'string') {
    return instructions;
  }

  // Handle new multi-language format
  return instructions[languageCode] || instructions[DEFAULT_LANGUAGE] || '';
}

/**
 * Type guard to check if instructions are in multi-language format
 */
export function isMultiLanguageInstructions(
  instructions: MultiLanguageInstructions | string
): instructions is MultiLanguageInstructions {
  return typeof instructions === 'object' && instructions !== null;
}

/**
 * Create an empty multi-language instructions object
 */
export function createEmptyInstructions(): MultiLanguageInstructions {
  return {
    en: '',
    es: '',
    fr: '',
    de: '',
    it: '',
  };
}
