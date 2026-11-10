import type { i18n } from "i18next";
import { localizedContent } from "../../data/localized/index.ts";
import frenchNavigation from "../../locales/fr/navigation.json";
import { appI18n } from "./instance";
import type { AppLocale } from "./config";

/**
 * Seoul Home display-only catalogue: no changes to route IDs, saved progress,
 * mission state, lesson audio, scoring or canonical French exercise data.
 */
function homeCopyId(source: string): string {
  return encodeURIComponent(source).replaceAll(".", "%2E");
}

const sectionBySource = new Map<string, string>();
for (const [section, messages] of Object.entries(frenchNavigation.copy)) {
  for (const source of Object.values(messages)) {
    if (!sectionBySource.has(source)) sectionBySource.set(source, section);
  }
}

// Existing learning catalogues are the source of truth for resumable lesson
// titles (including older locally persisted FR HomeResumeContext entries).
let contentByFrench: Map<string, string> | null = null;
function getResumableContentTranslations() {
  if (contentByFrench) return contentByFrench;
  const map = new Map<string, string>();
  const modules = ["hangul", "vocabulary", "counting", "classifiers", "grammar", "immersion"] as const;
  for (const module of modules) {
    for (const [id, fields] of Object.entries(localizedContent.fr[module])) {
      const japanese = localizedContent.ja[module][id];
      if (!japanese) continue;
      for (const [field, french] of Object.entries(fields)) {
        const translated = japanese[field];
        if (typeof french === "string" && french.trim() &&
            typeof translated === "string" && translated.trim() &&
            french !== translated && !map.has(french)) {
          map.set(french, translated);
        }
      }
    }
  }
  contentByFrench = map;
  return map;
}

export function resolveHomeText(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;
  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  const text = source.slice(leading.length, source.length - trailing.length);
  if (!text) return source;

  const catalogue = instance.getResource(locale, "navigation", "copy") as
    | Record<string, Record<string, string>>
    | undefined;
  const directSection = sectionBySource.get(text);
  const direct = directSection ? catalogue?.[directSection]?.[homeCopyId(text)] : undefined;
  if (typeof direct === "string" && direct.trim()) return leading + direct + trailing;

  // Localize generated progress positions without translating the numbers.
  const position = text.match(/^(Exercice|Étape|Quiz) (\d+) \/ (\d+)$/u);
  if (position) {
    const template = `${position[1]} {{current}} / {{total}}`;
    const section = sectionBySource.get(template);
    const translated = section ? catalogue?.[section]?.[homeCopyId(template)] : undefined;
    if (translated) {
      return leading + translated.replace("{{current}}", position[2])
        .replace("{{total}}", position[3]) + trailing;
    }
  }

  // Preserve individual names in composite resume metadata and translate their
  // French fragments; do not write localized strings back to persisted state.
  if (text.includes(" · ")) {
    const parts = text.split(" · ");
    const translated = parts.map((part) => resolveHomeText(part, locale, instance));
    if (translated.some((part, i) => part !== parts[i])) {
      return leading + translated.join("・") + trailing;
    }
  }

  const existing = getResumableContentTranslations().get(text);
  return typeof existing === "string" ? leading + existing + trailing : source;
}
