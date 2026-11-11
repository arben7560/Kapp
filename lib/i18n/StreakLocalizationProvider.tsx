import React from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "./config";
import { formatStreakText, resolveStreakText } from "./streakText";
import { VocabularyTextContext } from "./VocabularyTextContext";
import type { AppLocale } from "./config";

/**
 * Same display-only translation context as Account, Premium and Home.
 * The same namespace powers captions, dynamic values and accessibility copy.
 */
export function StreakLocalizationProvider({
  children,
}: React.PropsWithChildren) {
  const { i18n } = useTranslation("streak");
  const active = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(active) ? active : DEFAULT_LOCALE;
  const translate = React.useCallback(
    (source: string) => resolveStreakText(source, locale, i18n),
    [locale, i18n],
  );
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}

export function useStreakCopy(): {
  locale: AppLocale;
  text: (source: string, values?: Readonly<Record<string, string | number>>) => string;
} {
  const { i18n } = useTranslation("streak");
  const active = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(active) ? active : DEFAULT_LOCALE;
  const text = React.useCallback(
    (source: string, values: Readonly<Record<string, string | number>> = {}) =>
      formatStreakText(source, values, locale, i18n),
    [locale, i18n],
  );
  return { locale, text };
}
