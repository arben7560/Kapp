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
  match = source.match(/^NIVEAU (A\d) · ÉTAPE (\d+)$/u);
  if (match) return `${match[1]}レベル・ステップ ${match[2]}`;
  match = source.match(/^(\d+) \/ (\d+) étapes$/u);
  if (match) return `${match[1]}／${match[2]}ステップ`;
  match = source.match(/^(\d+) étapes · progression A0 → A1$/u);
  if (match) return `${match[1]}ステップ・A0からA1へ`;
  // The A1 result message contains the number of questions in the session.
  // Resolve the translated template from the shared catalogue, not from
  // the saved French string, so legacy/revised sessions keep their own count.
  if (module === "a1-validation") {
    match = source.match(/^Tu as validé un échantillon de (\d+) questions de grammaire A1\. Une nouvelle tentative proposera d’autres notions : ce bilan ne remplace pas un test de compréhension orale\.$/u);
    if (match) {
      const template = exact("shared",
        "Tu as validé un échantillon de {{count}} questions de grammaire A1. Une nouvelle tentative proposera d’autres notions : ce bilan ne remplace pas un test de compréhension orale.");
      if (template) return template.replace("{{count}}", match[1]);
    }
  }
  match = source.match(/^CHAPITRE (\d+) · (.+)$/u);
  if (match) {
    const chapter = exact("shared", match[2]) ?? match[2];
    return `第${Number(match[1])}章・${chapter}`;
  }
  match = source.match(/^(\d+) réponses? correctes? sur (\d+)\.$/u);
  if (match) return `${match[2]}問中${match[1]}問正解`;
  match = source.match(/^(\d+) réponses? correctes?$/u);
  if (match) return `${match[1]}問正解`;
  match = source.match(/^Explication de la leçon (.+)$/u);
  if (match) {
    const title = exact(module, match[1]) ?? exact("hub", match[1]) ?? match[1];
    return `「${title}」の解説`;
  }
  match = source.match(/^Termine d’abord les étapes requises pour ouvrir « (.+) »\.$/u);
  if (match) {
    const title = exact(module, match[1]) ?? exact("hub", match[1]) ?? match[1];
    return `「${title}」を始めるには、前提のステップを完了してください。`;
  }
  match = source.match(/^Cette leçon (A1|avancée) et ses exercices approfondis sont inclus dans K-App Premium\.$/u);
  if (match) return match[1] === "A1"
    ? "このA1レッスンと練習問題は、K-App Premiumで学べます。"
    : "この応用レッスンと練習問題は、K-App Premiumで学べます。";

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
