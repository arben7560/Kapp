import React from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LOCALE, isAppLocale } from "./config";
import { getContentLocalizationScope } from "./contentLocalizationScope";
import { resolveClassifierText } from "./classifierText";
import { resolveCountingText } from "./countingText";
import { resolveGrammarText } from "./grammarText";
import { resolveImmersionText } from "./immersionText";
import { resolveVocabularyText } from "./vocabularyText";
import { VocabularyTextContext } from "./VocabularyTextContext";

/**
 * Compatibility bridge for the source-string catalogues in Vocabulaire,
 * Comptage and Classificateurs. Like Hangul and Écoute, language changes
 * come exclusively from react-i18next. New lessons should use
 * useTranslation(namespace) and semantic keys directly.
 *
 * Mounted inside each localized module layout. Updating its value preserves
 * the child navigator's identity; the root Stack is outside this provider.
 */
export function ContentLocalizationProvider({
  pathname,
  children,
}: React.PropsWithChildren<{ pathname: string }>) {
  const { i18n } = useTranslation("common");
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const locale = isAppLocale(activeLanguage) ? activeLanguage : DEFAULT_LOCALE;
  const scope = React.useMemo(
    () => getContentLocalizationScope(pathname),
    [pathname],
  );

  React.useEffect(() => {
    if (!__DEV__ || process.env.EXPO_PUBLIC_DEBUG_OAUTH_NAV !== "1") return;
    console.info("[kapp:oauth-nav]", "content.scope", { pathname, scope, locale });
  }, [pathname, scope, locale]);

  const translate = React.useCallback(
    (sourceText: string) => {
      if (!scope || locale === "fr") return sourceText;

      const leading = sourceText.match(/^\s*/u)?.[0] ?? "";
      const trailing = sourceText.match(/\s*$/u)?.[0] ?? "";
      const core = sourceText.slice(leading.length, sourceText.length - trailing.length);
      if (!core) return sourceText;

      const localized =
        scope.namespace === "vocabulary"
          ? resolveVocabularyText(scope.module, core, locale, i18n)
          : scope.namespace === "counting"
            ? resolveCountingText(scope.module, core, locale, i18n)
            : scope.namespace === "classifiers"
              ? resolveClassifierText(scope.module, core, locale, i18n)
              : scope.namespace === "grammar"
                ? resolveGrammarText(scope.module, core, locale, i18n)
                : resolveImmersionText(scope.module, core, locale, i18n);

      return `${leading}${localized}${trailing}`;
    },
    [scope, locale, i18n],
  );

  return (
    <VocabularyTextContext.Provider value={translate}>
      {children}
    </VocabularyTextContext.Provider>
  );
}
