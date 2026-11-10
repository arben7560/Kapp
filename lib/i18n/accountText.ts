import type { i18n } from "i18next";
import frenchAccount from "../../locales/fr/account.json";
import { appI18n } from "./instance";
import type { AppLocale } from "./config";

/**
 * Account display-only compatibility bridge. French messages remain canonical
 * in authentication, validation, sync and OAuth; only their rendered copy is
 * localized. Copy is grouped in locales/{fr,ja}/account.json.
 */
function accountCopyId(source: string): string {
  return encodeURIComponent(source).replaceAll(".", "%2E");
}

const accountCopySectionBySource = new Map<string, string>();
for (const [section, messages] of Object.entries(frenchAccount.copy)) {
  for (const source of Object.values(messages)) {
    if (!accountCopySectionBySource.has(source)) {
      accountCopySectionBySource.set(source, section);
    }
  }
}

export function resolveAccountText(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;
  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  const text = source.slice(leading.length, source.length - trailing.length);
  if (!text) return source;
  const section = accountCopySectionBySource.get(text);
  const copy = instance.getResource(locale, "account", "copy") as
    | Record<string, Record<string, string>>
    | undefined;
  const localized = section ? copy?.[section]?.[accountCopyId(text)] : undefined;
  if (typeof localized === "string" && localized.trim()) {
    return leading + localized + trailing;
  }

  const confirmation = text.match(/^Un lien a été envoyé à (.+)\.$/u);
  if (confirmation) {
    const template = copy?.dialogs?.[accountCopyId("Un lien a été envoyé à {{email}}.")];
    const recipient = confirmation[1] === "votre adresse"
      ? resolveAccountText(confirmation[1], locale, instance)
      : confirmation[1];
    if (template) return leading + template.replace("{{email}}", recipient) + trailing;
  }

  // Multiple sign-in identities can appear together (e.g. Google + email).
  // Translate each provider description without changing the identity values.
  if (text.includes(" • ")) {
    const parts = text.split(" • ");
    const translated = parts.map((part) => resolveAccountText(part, locale, instance));
    if (translated.some((part, index) => part !== parts[index])) {
      return leading + translated.join(" • ") + trailing;
    }
  }
  return source;
}

/** Do not show unmapped French/service-provider errors in Japanese UI. */
export function resolveAccountError(
  source: string,
  locale: AppLocale,
  instance: i18n = appI18n,
): string {
  if (locale === "fr" || !source) return source;
  const translated = resolveAccountText(source, locale, instance);
  if (translated !== source || /[\u3040-\u30ff\u3400-\u9fff]/u.test(source)) return translated;
  return resolveAccountText(
    "L’opération n’a pas abouti. Réessayez dans quelques instants.",
    locale,
    instance,
  );
}
