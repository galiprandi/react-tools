/**
 * Helper function to get the user's browser language and normalize it to BCP 47 format.
 *
 * @returns The user's language code (e.g., 'en', 'es', 'ja')
 *
 * @example
 * ```ts
 * const lang = getUserLanguage();
 * console.log(lang); // "en"
 * ```
 */
export function getUserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  // Normalize BCP 47 language code (e.g., 'en-US' -> 'en')
  return lang.split('-')[0];
}
