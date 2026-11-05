import type { i18n } from 'i18next';

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectDeviceLocale,
  getDisplayLocale,
  isAppLocale,
  type AppLocale,
} from './config.ts';

type LocaleStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
};

export type LanguageSnapshot = Readonly<{
  ready: boolean;
  preference: AppLocale | null;
  deviceLocale: AppLocale;
  locale: AppLocale;
}>;

/** Local preference only: never reads/writes auth, onboarding or progression. */
export function createLanguageController({
  storage,
  getDeviceLanguageTags,
  instance,
  enabledLocales,
  onError = () => {},
}: {
  storage: LocaleStorage;
  getDeviceLanguageTags: () => readonly string[];
  instance: i18n;
  enabledLocales?: readonly AppLocale[];
  onError?: (error: unknown) => void;
}) {
  let snapshot: LanguageSnapshot = {
    ready: false,
    preference: null,
    deviceLocale: DEFAULT_LOCALE,
    locale: DEFAULT_LOCALE,
  };
  const listeners = new Set<() => void>();
  let initialization: Promise<void> | undefined;
  let operations = Promise.resolve();

  function publish(next: LanguageSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function initialize(): Promise<void> {
    initialization ??= (async () => {
      let deviceLocale = DEFAULT_LOCALE;
      let preference: AppLocale | null = null;
      try {
        deviceLocale = detectDeviceLocale(getDeviceLanguageTags());
      } catch (error) {
        onError(error);
      }
      try {
        const stored = await storage.getItem(LOCALE_STORAGE_KEY);
        preference = isAppLocale(stored) ? stored : null;
      } catch (error) {
        onError(error);
      }
      const locale = getDisplayLocale(preference ?? deviceLocale, enabledLocales);
      await instance.changeLanguage(locale);
      publish({ ready: true, preference, deviceLocale, locale });
    })();
    return initialization;
  }

  function setPreference(preference: AppLocale | null): Promise<void> {
    if (preference !== null && !isAppLocale(preference)) {
      return Promise.reject(new Error('Unsupported language preference.'));
    }
    const operation = operations.then(async () => {
      await initialize();
      // Read the system again when returning to device language.
      const deviceLocale = preference === null
        ? detectDeviceLocale(getDeviceLanguageTags())
        : snapshot.deviceLocale;
      const locale = getDisplayLocale(preference ?? deviceLocale, enabledLocales);
      if (preference === null) {
        await storage.removeItem(LOCALE_STORAGE_KEY);
      } else {
        await storage.setItem(LOCALE_STORAGE_KEY, preference);
      }
      await instance.changeLanguage(locale);
      publish({ ready: true, preference, deviceLocale, locale });
    });
    // A failed write must not poison subsequent user choices.
    operations = operation.catch(() => {});
    return operation;
  }

  return {
    initialize,
    setPreference,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
