import type { AppLocale } from './config.ts';

export const FORMAT_LOCALES = { fr: 'fr-FR', ja: 'ja-JP' } as const;

/** Display only. Callers retain their existing timestamp/time-zone calculations. */
export function formatDisplayDate(
  value: Date | number,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(FORMAT_LOCALES[locale], options).format(value);
}

export function formatDisplayNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(FORMAT_LOCALES[locale], options).format(value);
}
