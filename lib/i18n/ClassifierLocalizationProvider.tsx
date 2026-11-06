import React from "react";
import { useAppLanguage } from "./LanguageProvider";
import { VocabularyTextContext } from "./VocabularyTextContext";
import { resolveClassifierText } from "./classifierText";

type Props = React.PropsWithChildren<{ module: string }>;

/** Scoped display-only localization; scene IDs, spoken Korean and app state are untouched. */
export function ClassifierLocalizationProvider({ children, module }: Props) {
  const { locale } = useAppLanguage();
  const translate = React.useCallback((sourceText: string) => {
    const leading = sourceText.match(/^\s*/)?.[0] ?? "";
    const trailing = sourceText.match(/\s*$/)?.[0] ?? "";
    const core = sourceText.slice(leading.length, sourceText.length - trailing.length);
    return core ? `${leading}${resolveClassifierText(module, core, locale)}${trailing}` : sourceText;
  }, [locale, module]);
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
