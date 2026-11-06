import React from "react";
import { useAppLanguage } from "./LanguageProvider";
import { VocabularyTextContext } from "./VocabularyTextContext";
import { resolveCountingText } from "./countingText";

type Props = React.PropsWithChildren<{ module: string }>;

/** Scoped display-only translations; lesson IDs, Korean, audio and persistence remain canonical. */
export function CountingLocalizationProvider({ children, module }: Props) {
  const { locale } = useAppLanguage();
  const translate = React.useCallback((sourceText: string) => {
    const leading = sourceText.match(/^\s*/)?.[0] ?? "";
    const trailing = sourceText.match(/\s*$/)?.[0] ?? "";
    const core = sourceText.slice(leading.length, sourceText.length - trailing.length);
    return core ? `${leading}${resolveCountingText(module, core, locale)}${trailing}` : sourceText;
  }, [locale, module]);

  // Reuse the scoped resolver consumed by AppText and AppBackButton.
  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
