import type { i18n } from "i18next";
import frenchPremium from "../../locales/fr/premium.json";
import { appI18n } from "./instance";
import type { AppLocale } from "./config";

/**
 * Paywall display-only source-string bridge. Product IDs, store prices,
 * entitlements, operations and RevenueCat errors stay canonical.
 */
function premiumCopyId(source: string): string {
  return encodeURIComponent(source).replaceAll(".", "%2E");
}

const premiumSectionBySource = new Map<string, string>();
for (const [section, messages] of Object.entries(frenchPremium.copy)) {
  for (const source of Object.values(messages)) {
    if (!premiumSectionBySource.has(source)) premiumSectionBySource.set(source, section);
  }
}

export function resolvePremiumText(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;
  const prefix = source.match(/^\s*/u)?.[0] ?? "";
  const suffix = source.match(/\s*$/u)?.[0] ?? "";
  const text = source.slice(prefix.length, source.length - suffix.length);
  if (!text) return source;
  const section = premiumSectionBySource.get(text);
  const copy = instance.getResource(locale, "premium", "copy") as
    | Record<string, Record<string, string>>
    | undefined;
  const localized = section ? copy?.[section]?.[premiumCopyId(text)] : undefined;
  if (typeof localized === "string" && localized.trim()) {
    return prefix + localized + suffix;
  }

  // Keep computed savings, Store currency and selected offer identifiers intact.
  const savings = text.match(/^Économisez ([\d.,]+) %$/u);
  if (savings) {
    const template = copy?.plans?.[premiumCopyId("Économisez {{percent}} %")];
    if (template) return prefix + template.replace("{{percent}}", savings[1]) + suffix;
  }
  const monthly = text.match(/^Soit (.+) \/ mois\. (.+)$/u);
  if (monthly) {
    const template = copy?.plans?.[premiumCopyId("Soit {{price}} / mois.")];
    if (template) {
      return prefix + template.replace("{{price}}", monthly[1]) + " " +
        resolvePremiumText(monthly[2], locale, instance) + suffix;
    }
  }
  const selected = text.match(/^Offre sélectionnée : (.+)$/u);
  if (selected) {
    const template = copy?.plans?.[premiumCopyId("Offre sélectionnée : {{plan}}")];
    if (template) return prefix + template.replace("{{plan}}", resolvePremiumText(selected[1], locale, instance)) + suffix;
  }
  return source;
}

/** Unknown store/provider errors must not leak French or English into Japanese UI. */
export function resolvePremiumError(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;
  const translated = resolvePremiumText(source, locale, instance);
  if (translated !== source || /[\u3040-\u30ff\u3400-\u9fff]/u.test(source)) return translated;
  return resolvePremiumText(
    "Une erreur est survenue pendant la gestion de l’abonnement. Réessaie dans quelques instants.",
    locale,
    instance,
  );
}
