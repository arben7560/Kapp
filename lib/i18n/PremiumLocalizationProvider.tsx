import React from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isAppLocale } from "./config";
import { resolvePremiumText } from "./premiumText";
import { VocabularyTextContext } from "./VocabularyTextContext";

/** Matches the Account translation bridge without changing native purchasing. */
export function PremiumLocalizationProvider({
  children,
}: React.PropsWithChildren) {
  const { i18n } = useTranslation("premium");
  const active = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(active) ? active : DEFAULT_LOCALE;
  const translate = React.useCallback(
    (source: string) => resolvePremiumText(source, locale, i18n),
    [locale, i18n],
  );
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
