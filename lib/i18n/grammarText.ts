import type { i18n } from "i18next";
import { grammarCopyId } from "../../data/localized/grammarRegistry.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";

/**
 * Same route-scoped, source-string, display-only resolution as Counting and
 * Classifiers. Template formatting is limited to visible labels, never IDs
 * or exercise values.
 */
export function resolveGrammarText(
  module: string,
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr") return source;
  const exact = (scope: string, text: string): string | undefined => {
    const resolved = instance.getResource(locale, "grammar", `content.${grammarCopyId(scope, text)}.text`);
    return typeof resolved === "string" && resolved.trim() ? resolved : undefined;
  };
  const direct = exact(module, source) ?? exact("shared", source);
  if (direct) return direct;

  const quoted = source.match(/^«\s*(.*?)\s*»$/u);
  if (quoted) {
    const localized = exact(module, quoted[1]) ?? exact("shared", quoted[1]);
    if (localized) return `「${localized}」`;
  }

  let match = source.match(/^EXEMPLE (\d+)$/u);
  if (match) return `例文 ${match[1]}`;
  match = source.match(/^(\d+) EXEMPLES$/u);
  if (match) return `例文 ${match[1]}つ`;
  match = source.match(/^EXERCICE (\d+) \/ (\d+)$/u);
  if (match) return `問題 ${match[1]}／${match[2]}`;
  match = source.match(/^ÉTAPE (\d+) · NIVEAU (A\d)$/u);
  if (match) return `ステップ ${match[1]}・${match[2]}レベル`;
  match = source.match(/^ÉTAPE (\d+) · (A\d)$/u);
  if (match) return `ステップ ${match[1]}・${match[2]}`;
  match = source.match(/^ÉTAPE (\d+)$/u);
  if (match) return `ステップ ${match[1]}`;
  match = source.match(/^(\d+) \/ (\d+) étapes$/u);
  if (match) return `${match[1]}／${match[2]}ステップ`;
  match = source.match(/^(\d+) étapes · progression A0 → A1$/u);
  if (match) return `${match[1]}ステップ・A0からA1へ`;
  match = source.match(/^CHAPITRE (\d+) · (.+)$/u);
  if (match) {
    const chapter = exact("shared", match[2]) ?? match[2];
    return `第${Number(match[1])}章・${chapter}`;
  }
  match = source.match(/^(\d+) réponses? correctes? sur (\d+)\.$/u);
  if (match) return `${match[2]}問中${match[1]}問正解`;
  match = source.match(/^(\d+) réponses? correctes?$/u);
  if (match) return `${match[1]}問正解`;

  if (source.startsWith("Requis : ")) {
    const stage = source.slice("Requis : ".length);
    return `前提条件：${exact("hub", stage) ?? stage}`;
  }
  if (source.startsWith("Ordre conseillé : après ")) {
    const stage = source.slice("Ordre conseillé : après ".length);
    return `おすすめの順番：${exact("hub", stage) ?? stage} の後`;
  }
  return source;
}
