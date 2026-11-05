type FlatCatalogue = Map<string, string>;
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/u;
const KOREAN_RUNS = /[\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff]+/gu;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function flatten(value: unknown, path: string, errors: string[], output: FlatCatalogue) {
  if (typeof value === 'string') {
    if (!value.trim()) errors.push(`${path}: empty text`);
    if (/\{\{|\}\}/u.test(value.replace(/\{\{[^{}]+\}\}/gu, ''))) {
      errors.push(`${path}: malformed interpolation`);
    }
    output.set(path, value);
    return;
  }
  if (!isObject(value)) {
    errors.push(`${path}: expected an object or string`);
    return;
  }
  if (path && !Object.keys(value).length) errors.push(`${path}: empty nested object`);
  for (const [key, child] of Object.entries(value)) {
    if (!key || /[.:]/u.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key)) {
      errors.push(`${path}.${key}: invalid key`);
    }
    flatten(child, path ? `${path}.${key}` : key, errors, output);
  }
}

function placeholders(value: string) {
  return [...new Set([...value.matchAll(/\{\{\s*(-?\s*[^{}]+?)\s*\}\}/gu)]
    .map((match) => match[1].replace(/\s+/gu, '')))].sort().join('|');
}

function koreanSegments(value: string) {
  return (value.match(KOREAN_RUNS) ?? []).sort().join('|');
}

/** Direct catalogue inspection: never follows i18next fallbacks. */
export function validateCataloguePair(french: unknown, japanese: unknown): string[] {
  const errors: string[] = [];
  const flat = { fr: new Map<string, string>(), ja: new Map<string, string>() };
  flatten(french, '', errors, flat.fr);
  flatten(japanese, '', errors, flat.ja);

  const families = new Set([...flat.fr.keys(), ...flat.ja.keys()].map(
    (key) => key.replace(PLURAL_SUFFIX, ''),
  ));
  for (const family of families) {
    const variants = {
      fr: [...flat.fr.keys()].filter((key) => key.replace(PLURAL_SUFFIX, '') === family),
      ja: [...flat.ja.keys()].filter((key) => key.replace(PLURAL_SUFFIX, '') === family),
    };
    const plural = [...variants.fr, ...variants.ja].some((key) => PLURAL_SUFFIX.test(key));
    for (const locale of ['fr', 'ja'] as const) {
      if (!variants[locale].length) errors.push(`${locale}/${family}: missing key`);
      if (plural) {
        const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
        for (const category of categories) {
          if (!flat[locale].has(`${family}_${category}`)) {
            errors.push(`${locale}/${family}_${category}: missing plural form`);
          }
        }
        for (const key of variants[locale]) {
          const suffix = key.match(PLURAL_SUFFIX)?.[1];
          if (!suffix || (suffix !== 'zero' && !categories.includes(suffix as Intl.LDMLPluralRule))) {
            errors.push(`${locale}/${key}: unexpected plural form`);
          }
        }
      }
    }
    const texts = [...variants.fr.map((key) => flat.fr.get(key)!), ...variants.ja.map((key) => flat.ja.get(key)!)];
    const expectedParams = placeholders(texts[0] ?? '');
    const expectedKorean = koreanSegments(texts[0] ?? '');
    for (const text of texts) {
      if (placeholders(text) !== expectedParams) errors.push(`${family}: inconsistent interpolation parameters`);
      if (koreanSegments(text) !== expectedKorean) errors.push(`${family}: Korean segments differ`);
    }
  }
  return errors;
}
