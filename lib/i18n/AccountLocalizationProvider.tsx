import React from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "./config";
import { resolveAccountText } from "./accountText";
import { VocabularyTextContext } from "./VocabularyTextContext";

/** Localizes account copy on display without replacing canonical auth values. */
export function AccountLocalizationProvider({
  children,
}: React.PropsWithChildren) {
  const { i18n } = useTranslation("account");
  const active = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(active) ? active : DEFAULT_LOCALE;
  const translate = React.useCallback(
    (source: string) => resolveAccountText(source, locale, i18n),
    [locale, i18n],
  );
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
