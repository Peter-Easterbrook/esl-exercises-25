import { DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages';
import type { MultiLanguageInstructions } from '@/types';

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
  };
}
