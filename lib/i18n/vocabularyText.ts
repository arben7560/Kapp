import { localizedContent } from "../../data/localized/index.ts";
import { vocabularyCopyId } from "../../data/localized/vocabularyRegistry.ts";
import { resolveContentText } from "./displayText.ts";
import type { AppLocale } from "./config.ts";

/** Resolve a module-specific copy first, then a shared vocabulary label. */
export function resolveVocabularyText(
  module: string,
  sourceText: string,
  locale: AppLocale,
): string {
  if (locale === "fr") return sourceText;

  const moduleEntityId = vocabularyCopyId(module, sourceText);
  const sharedEntityId = vocabularyCopyId("shared", sourceText);
  const catalogue = localizedContent[locale].vocabulary;
  const entityId = catalogue[moduleEntityId]
    ? moduleEntityId
    : catalogue[sharedEntityId]
      ? sharedEntityId
      : null;

  if (!entityId) return sourceText;

  return resolveContentText(
    { module: "vocabulary", entityId, field: "text" },
    sourceText,
    locale,
  );
}
