import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { appI18n } from './instance';
import { createLanguageController } from './languageController';

const controller = createLanguageController({
  storage: AsyncStorage,
  getDeviceLanguageTags: () => getLocales().map(({ languageTag }) => languageTag),
  instance: appI18n,
  onError: (error) => console.warn('Unable to read the local language preference.', error),
});

/** Hydrate alongside fonts, before mounting routes, without keying screens by locale. */
export function useLanguageBootstrap() {
  const snapshot = React.useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  React.useEffect(() => { void controller.initialize(); }, []);
  return snapshot;
}

export function LanguageProvider({ children }: React.PropsWithChildren) {
  return <I18nextProvider i18n={appI18n}>{children}</I18nextProvider>;
}

/** Future settings/selector API. null restores the phone language. */
export function useAppLanguage() {
  const snapshot = React.useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return { ...snapshot, setPreference: controller.setPreference };
}
