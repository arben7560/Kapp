import { localizedContent } from "../../data/localized/index.ts";
import { classifierCopyId } from "../../data/localized/classifiersRegistry.ts";
import { resolveContentText } from "./displayText.ts";
import type { AppLocale } from "./config.ts";

/** The original Korean examples and pronunciation strings are not in the dictionary. */
export function resolveClassifierText(module: string, sourceText: string, locale: AppLocale): string {
  if (locale === "fr") return sourceText;
  const catalogue = localizedContent[locale].classifiers;
  const localId = classifierCopyId(module, sourceText);
  const sharedId = classifierCopyId("shared", sourceText);
  const id = catalogue[localId] ? localId : catalogue[sharedId] ? sharedId : null;
  if (!id) return sourceText;
  return resolveContentText({ module: "classifiers", entityId: id, field: "text" }, sourceText, locale);
}
