import type { i18n } from "i18next";
import { vocabularyCopyId } from "../../data/localized/vocabularyRegistry.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";

/** Reuse the same i18next resources as Hangul and Écoute, preserving the
 * existing module-first and shared-copy fallback rules. */
export function resolveVocabularyText(
  module: string,
  sourceText: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr") return sourceText;

  const specific = instance.getResource(
    locale, "vocabulary", `content.${vocabularyCopyId(module, sourceText)}.text`,
  );
  if (typeof specific === "string" && specific.trim()) return specific;

  const shared = instance.getResource(
    locale, "vocabulary", `content.${vocabularyCopyId("shared", sourceText)}.text`,
  );
  return typeof shared === "string" && shared.trim() ? shared : sourceText;
}
