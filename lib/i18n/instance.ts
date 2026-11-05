import { createInstance } from 'i18next';

import { resources } from '../../locales/index.ts';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from './config.ts';

/** Embedded resources only; no network, browser detector or React global singleton. */
export function createAppI18n(locale: AppLocale = DEFAULT_LOCALE) {
  const instance = createInstance();
  void instance.init({
    resources,
    lng: locale,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'languageOnly',
    defaultNS: 'common',
    ns: Object.keys(resources.fr),
    fallbackLng: false,
    returnNull: false,
    returnEmptyString: false,
    initAsync: false,
    interpolation: { escapeValue: false },
    missingInterpolationHandler(_text, value) {
      throw new Error(`Missing localization interpolation: ${value}`);
    },
    react: { useSuspense: false },
    parseMissingKeyHandler(key) {
      throw new Error(`Missing localization key: ${key}`);
    },
  });
  return instance;
}

export const appI18n = createAppI18n();
