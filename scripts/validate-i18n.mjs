import './i18n-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const { validateCataloguePair } = await import('../lib/i18n/catalogValidation.ts');
const { resources } = await import('../locales/index.ts');
const { localizedContent } = await import('../data/localized/index.ts');
const { CONTENT_MODULES } = await import('../data/localized/types.ts');
const { ENABLED_UI_LOCALES } = await import('../lib/i18n/config.ts');
const manifest = JSON.parse(readFileSync(new URL('../locales/manifest.json', import.meta.url), 'utf8'));
const errors = [];

for (const locale of ['fr', 'ja']) {
  const directory = new URL(`../locales/${locale}/`, import.meta.url);
  const files = readdirSync(directory).filter((name) => name.endsWith('.json')).sort();
  assert.deepEqual(files, manifest.namespaces.map((ns) => `${ns}.json`).sort(), `${locale}: namespace files`);
  assert.deepEqual(Object.keys(resources[locale]).sort(), [...manifest.namespaces].sort(), `${locale}: bundled namespaces`);
  for (const namespace of manifest.namespaces) {
    const file = JSON.parse(readFileSync(new URL(`${namespace}.json`, directory), 'utf8'));
    // Migrated learning modules append a display-only content registry at bundling.
    // The namespace JSON itself must still match the on-disk source catalogue.
    const bundled = resources[locale][namespace];
    if (["vocabulary", "counting", "classifiers", "grammar", "immersion"].includes(namespace)) {
      const { content, ...staticMessages } = bundled;
      assert.deepEqual(staticMessages, file, `${locale}/${namespace}: source catalogue differs from disk`);
      assert.deepEqual(content, localizedContent[locale][namespace], `${locale}/${namespace}: content catalogue differs`);
    } else {
      assert.deepEqual(bundled, file, `${locale}/${namespace}: bundle differs from disk`);
    }
    if (!Object.keys(file).length && !manifest.deferredNamespaces.includes(namespace)) {
      errors.push(`${locale}/${namespace}: required namespace is empty`);
    }
  }
  assert.deepEqual(Object.keys(localizedContent[locale]).sort(), [...CONTENT_MODULES].sort());
}
for (const namespace of manifest.namespaces) {
  errors.push(...validateCataloguePair(resources.fr[namespace], resources.ja[namespace],
    ["vocabulary", "counting", "classifiers", "grammar", "immersion"].includes(namespace)
      ? { koreanSegments: "display-adaptation" }
      : {},
  )
    .map((error) => `${namespace}/${error}`));
}
for (const module of CONTENT_MODULES) {
  errors.push(...validateCataloguePair(
    localizedContent.fr[module], localizedContent.ja[module],
    module === 'hangul' || module === 'vocabulary' || module === 'counting' || module === 'classifiers' || module === 'grammar' || module === 'immersion' ? { koreanSegments: 'display-adaptation' } : {},
  )
    .map((error) => `content/${module}/${error}`));
}
if (ENABLED_UI_LOCALES.includes('ja')) {
  // Partial UI rollout is deliberate. Full Japanese publication stays separately gated.
  for (const namespace of ['common', 'onboarding', 'account', 'vocabulary']) {
    if (!manifest.japaneseUiNamespaces?.includes(namespace) || manifest.deferredNamespaces.includes(namespace)) {
      errors.push(`Japanese first-run UI blocked: ${namespace} is not declared migrated.`);
    }
  }
}
if (process.argv.includes('--release-ja')) {
  if (!manifest.japaneseReleaseReady || manifest.deferredNamespaces.length) {
    errors.push('Japanese release blocked: full UI/pedagogical coverage is deferred.');
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`FR/JA: ${manifest.namespaces.length} namespaces verified; ${manifest.deferredNamespaces.length} explicitly deferred. Full Japanese release: ${manifest.japaneseReleaseReady ? 'ready' : 'blocked'}.`);
}
