import type { i18n, ParseKeys } from 'i18next';

import { localizedContent } from '../../data/localized/index.ts';
import type { ContentModule, LocalizedContent } from '../../data/localized/types.ts';
import type { AppNamespace } from '../../locales/index.ts';
import { isAppLocale, type AppLocale } from './config.ts';
import { appI18n } from './instance.ts';

export type DisplayMessage = {
  [N in AppNamespace]: Readonly<{
    namespace: N;
    key: ParseKeys<N>;
    values?: Readonly<Record<string, string | number>>;
  }>
}[AppNamespace];

/** Store references/parameters in presentation state, never translated engine values. */
export function resolveDisplayMessage(message: DisplayMessage, instance: i18n = appI18n): string {
  const { namespace, key, values } = message;
  const locale = instance.resolvedLanguage ?? instance.language;
  if (!isAppLocale(locale)) throw new Error(`Unsupported display locale: ${locale}`);
  // Inspect the actual language, rather than allowing a fallback to mask a gap.
  const details = instance.t(key, {
    replace: values,
    count: typeof values?.count === 'number' ? values.count : undefined,
    lng: locale,
    ns: namespace,
    returnDetails: true,
  });
  const raw: unknown = instance.getResource(locale, namespace, details.exactUsedKey);
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`Missing display message: ${locale}/${namespace}/${key}`);
  }
  const result = details.res;
  if (typeof result !== 'string' || !result.trim() || result === key) {
    throw new Error(`Invalid display message: ${locale}/${namespace}/${key}`);
  }
  return result;
}

export type ContentTextReference = Readonly<{
  module: ContentModule;
  entityId: string;
  field: string;
}>;

/** Call only at render time. Returns a label; never clones or mutates an engine object. */
export function resolveContentText(
  reference: ContentTextReference,
  canonicalFrench: string,
  locale: AppLocale,
  catalogues: LocalizedContent = localizedContent,
): string {
  // Exact original French while modules await migration, including punctuation/spacing.
  if (locale === 'fr') return canonicalFrench;
  const text = catalogues[locale][reference.module][reference.entityId]?.[reference.field];
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`Missing content text: ${locale}/${reference.module}/${reference.entityId}/${reference.field}`);
  }
  return text;
}
