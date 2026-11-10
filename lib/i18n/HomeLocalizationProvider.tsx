import React from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "./config";
import { resolveHomeText } from "./homeText";
import { VocabularyTextContext } from "./VocabularyTextContext";

/** Translating the Home presentation must not mutate course or resume data. */
export function HomeLocalizationProvider({
  children,
}: React.PropsWithChildren) {
  const { i18n } = useTranslation("navigation");
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(activeLanguage) ? activeLanguage : DEFAULT_LOCALE;
  const translate = React.useCallback(
    (source: string) => resolveHomeText(source, locale, i18n),
    [locale, i18n],
  );
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
