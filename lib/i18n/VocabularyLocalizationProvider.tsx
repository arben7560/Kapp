import React from "react";

import { useAppLanguage } from "./LanguageProvider";
import { VocabularyTextContext } from "./VocabularyTextContext";
import { resolveVocabularyText } from "./vocabularyText";

type VocabularyLocalizationProviderProps = React.PropsWithChildren<{
  module: string;
}>;

/** Localizes display strings only; canonical Korean data and engine IDs stay untouched. */
export function VocabularyLocalizationProvider({
  children,
  module,
}: VocabularyLocalizationProviderProps) {
  const { locale } = useAppLanguage();

  const translate = React.useCallback(
    (sourceText: string) => {
      const leading = sourceText.match(/^\s*/)?.[0] ?? "";
      const trailing = sourceText.match(/\s*$/)?.[0] ?? "";
      const end = sourceText.length - trailing.length;
      const core = sourceText.slice(leading.length, end);

      if (!core) return sourceText;

      return `${leading}${resolveVocabularyText(module, core, locale)}${trailing}`;
    },
    [locale, module],
  );

  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
