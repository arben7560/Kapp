import type { i18n } from "i18next";
import { immersionCopyId } from "../../data/localized/immersionRegistryCafe.ts";
import type { AppLocale } from "./config.ts";
import { appI18n } from "./instance.ts";
/** Café presentation copy, resolved only at render time. No dialogue or speech-engine mutation. */
export function resolveImmersionText(module: string, source: string, locale: AppLocale, instance: i18n = appI18n): string {
  if (locale === "fr") return source;
  const exact = (text: string): string | undefined => {
    const resolved = instance.getResource(locale, "immersion", "content." + immersionCopyId(module, text) + ".text");
    return typeof resolved === "string" && resolved.trim() ? resolved : undefined;
  };
  const direct = exact(source);
  if (direct) return direct;
  let m = source.match(/^(\d+) situations à pratiquer$/u);
  if (m) return m[1] + "つの場面を練習";
  m = source.match(/^(\d+) tentatives avec le même diagnostic$/u);
  if (m) return "同じ指摘が" + m[1] + "回ありました";
  m = source.match(/^(\d+) réponses? validées? sans correction$/u);
  if (m) return "修正なしで" + m[1] + "件正しく回答";
  m = source.match(/^(\d+) difficultés? résolues? pendant la scène$/u);
  if (m) return "このシーンで" + m[1] + "件の課題を解決";
  m = source.match(/^(\d+) missions maîtrisées sur (\d+)$/u);
  if (m) return m[2] + "件中" + m[1] + "件のミッションを習得";
  m = source.match(/^Retour depuis les missions (.+)$/u);
  if (m) return (exact(m[1]) ?? m[1]) + "のミッション一覧から戻る";
  m = source.match(/^Lancer la mission (.+)$/u);
  if (m) return "「" + (exact(m[1]) ?? m[1]) + "」を始める";
  m = source.match(/^Objectif maîtrisé : (.+)$/u);
  if (m) return "目標達成：" + (exact(m[1]) ?? m[1]);
  m = source.match(/^(\d+) \/ (\d+) maîtrisées$/u);
  if (m) return m[2] + "件中" + m[1] + "件習得";
  m = source.match(/^Confirmer (.+)$/u);
  if (m) return "「" + (exact(m[1]) ?? m[1]) + "」と確認する";
  m = source.match(/^(Réécouter|Écouter) (.+)$/u);
  if (m && /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(m[2])) return (exact(m[1]) ?? m[1]) + "：" + m[2];
  return source;
}
