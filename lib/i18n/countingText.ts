import { localizedContent } from "../../data/localized/index.ts";
import { countingCopyId } from "../../data/localized/countingRegistry.ts";
import { resolveContentText } from "./displayText.ts";
import type { AppLocale } from "./config.ts";

export function resolveCountingText(module: string, sourceText: string, locale: AppLocale): string {
  if (locale === "fr") return sourceText;
  const catalogue = localizedContent[locale].counting;
  const specificId = countingCopyId(module, sourceText);
  const sharedId = countingCopyId("shared", sourceText);
  const id = catalogue[specificId] ? specificId : catalogue[sharedId] ? sharedId : null;
  if (!id) return sourceText;
  return resolveContentText({ module: "counting", entityId: id, field: "text" }, sourceText, locale);
}
