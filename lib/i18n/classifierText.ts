import type { i18n } from "i18next";
import { classifierCopyId } from "../../data/localized/classifiersRegistry.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";

/** Keep Korean expressions and lesson IDs unchanged; localize display copy. */
export function resolveClassifierText(
  module: string,
  sourceText: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr") return sourceText;

  const specific = instance.getResource(
    locale, "classifiers", `content.${classifierCopyId(module, sourceText)}.text`,
  );
  if (typeof specific === "string" && specific.trim()) return specific;

  const shared = instance.getResource(
    locale, "classifiers", `content.${classifierCopyId("shared", sourceText)}.text`,
  );
  return typeof shared === "string" && shared.trim() ? shared : sourceText;
}
