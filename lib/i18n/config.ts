export const SUPPORTED_LOCALES = ['fr', 'ja'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'fr';
export const LOCALE_STORAGE_KEY = 'kapp:locale:v1';

// Phase 3 enables the first-run UI. Unmigrated learning modules keep their French UI.
export const ENABLED_UI_LOCALES: readonly AppLocale[] = ['fr', 'ja'];

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'fr' || value === 'ja';
}

export function detectDeviceLocale(languageTags: readonly string[]): AppLocale {
  for (const tag of languageTags) {
    const language = tag.toLowerCase().split(/[-_]/u)[0];
    if (isAppLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}

export function getDisplayLocale(
  requested: AppLocale,
  enabled: readonly AppLocale[] = ENABLED_UI_LOCALES,
): AppLocale {
  return enabled.includes(requested) ? requested : DEFAULT_LOCALE;
}
