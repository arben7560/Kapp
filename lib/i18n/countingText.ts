import type { i18n } from "i18next";
import { countingCopyId } from "../../data/localized/countingRegistry.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";

/** Source strings remain canonical; translated display copy lives in i18next. */
export function resolveCountingText(
  module: string,
  sourceText: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr") return sourceText;

  const specific = instance.getResource(
    locale, "counting", `content.${countingCopyId(module, sourceText)}.text`,
  );
  if (typeof specific === "string" && specific.trim()) return specific;

  const shared = instance.getResource(
    locale, "counting", `content.${countingCopyId("shared", sourceText)}.text`,
  );
  return typeof shared === "string" && shared.trim() ? shared : sourceText;
}
