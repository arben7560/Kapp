import type { i18n } from "i18next";
import { isAppLocale } from "./config.ts";
import { resolveContentText, resolveDisplayMessage, type DisplayMessage } from "./displayText.ts";
import { hangulCopyId } from "../../data/localized/hangulRegistry.ts";

export type HangulUiKey = Extract<DisplayMessage, { namespace: "hangul" }>["key"];
export type HangulContentKind = "module" | "scene" | "card" | "question";

export function hangulUiText(
  instance: i18n,
  key: HangulUiKey,
  values?: Record<string, string | number>,
): string {
  return resolveDisplayMessage({ namespace: "hangul", key, values }, instance);
}

export function hangulContentText(
  instance: i18n,
  kind: HangulContentKind,
  ids: string[],
  field: string,
  canonicalFrench: string,
): string {
  const rawLocale = instance.resolvedLanguage ?? instance.language;
  const locale = isAppLocale(rawLocale) ? rawLocale : "fr";
  return resolveContentText(
    { module: "hangul", entityId: hangulCopyId(kind, ...ids), field },
    canonicalFrench,
    locale,
  );
}
