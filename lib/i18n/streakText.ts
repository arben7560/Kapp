import type { i18n } from "i18next";
import frenchStreak from "../../locales/fr/streak.json";
import { appI18n } from "./instance.ts";
import type { AppLocale } from "./config.ts";

/**
 * The streak calculator and saved activity dates remain canonical.
 * Only the labels rendered in the daily-streak screen are translated.
 */
function streakCopyId(source: string): string {
  return encodeURIComponent(source).replaceAll(".", "%2E");
}

const streakSectionBySource = new Map<string, string>();
for (const [section, messages] of Object.entries(frenchStreak.copy)) {
  for (const french of Object.values(messages)) {
    if (!streakSectionBySource.has(french)) streakSectionBySource.set(french, section);
  }
}

export function resolveStreakText(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;

  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  const normalized = source.slice(leading.length, source.length - trailing.length);
  if (!normalized) return source;

  const section = streakSectionBySource.get(normalized);
  const catalogue = instance.getResource(locale, "streak", "copy") as
    | Record<string, Record<string, string>>
    | undefined;
  const japanese = section ? catalogue?.[section]?.[streakCopyId(normalized)] : undefined;
  return typeof japanese === "string" && japanese.trim()
    ? leading + japanese + trailing
    : source;
}

/** Format values after translation: Japanese counters don't follow French word order. */
export function formatStreakText(
  frenchTemplate: string,
  values: Readonly<Record<string, string | number>>,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  let result = resolveStreakText(frenchTemplate, locale, instance);
  for (const [name, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${name}}}`, String(value));
  }
  return result;
}

/** Format only for screen readers; never change YYYY-MM-DD stored streak keys. */
export function formatStreakCalendarDate(dateKey: string, locale: AppLocale): string {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) return dateKey;
  const [, year, month, day] = match;
  return locale === "ja"
    ? `${Number(year)}年${Number(month)}月${Number(day)}日`
    : `${day}/${month}/${year}`;
}
