import './i18n-node-loader.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';

const { createAppI18n } = await import('../lib/i18n/instance.ts');
const { createLanguageController } = await import('../lib/i18n/languageController.ts');
const { detectDeviceLocale, LOCALE_STORAGE_KEY } = await import('../lib/i18n/config.ts');
const { resolveContentText, resolveDisplayMessage } = await import('../lib/i18n/displayText.ts');
const { validateCataloguePair } = await import('../lib/i18n/catalogValidation.ts');
const { formatDisplayDate, formatDisplayNumber } = await import('../lib/i18n/formats.ts');
const { localizedContent } = await import('../data/localized/index.ts');

function setup({ stored = null, tags = ['ja-JP'], enabledLocales = ['fr', 'ja'], storageOverrides = {} } = {}) {
  const entries = new Map([
    ['kapp_onboarding_completed', 'true'],
    ['progress-fixture', '{"score":11,"answer":"Moi","position":3}'],
  ]);
  if (stored !== null) entries.set(LOCALE_STORAGE_KEY, stored);
  const calls = [];
  const storage = {
    async getItem(key) { calls.push(['get', key]); return entries.get(key) ?? null; },
    async setItem(key, value) { calls.push(['set', key, value]); entries.set(key, value); },
    async removeItem(key) { calls.push(['remove', key]); entries.delete(key); },
    ...storageOverrides,
  };
  const instance = createAppI18n();
  const errors = [];
  const controller = createLanguageController({
    storage, instance, enabledLocales,
    getDeviceLanguageTags: () => tags,
    onError: (error) => errors.push(error),
  });
  return { controller, instance, entries, calls, errors, storage };
}

test('detects supported phone languages in order and falls back to French', () => {
  assert.equal(detectDeviceLocale(['en-US', 'ja-JP', 'fr-FR']), 'ja');
  assert.equal(detectDeviceLocale(['fr-CA', 'ja-JP']), 'fr');
  assert.equal(detectDeviceLocale(['JA_jp']), 'ja');
  assert.equal(detectDeviceLocale(['en-US']), 'fr');
  assert.equal(detectDeviceLocale([]), 'fr');
});

test('hydrates once and resolves the device language before declaring readiness', async () => {
  const { controller, instance, calls, entries } = setup();
  let updates = 0;
  const unsubscribe = controller.subscribe(() => { updates++; });
  assert.equal(controller.getSnapshot().ready, false);
  assert.equal(controller.initialize(), controller.initialize());
  await controller.initialize();
  assert.deepEqual(controller.getSnapshot(), { ready: true, preference: null, deviceLocale: 'ja', locale: 'ja' });
  assert.equal(instance.language, 'ja');
  assert.deepEqual(calls, [['get', LOCALE_STORAGE_KEY]]);
  assert.equal(entries.has(LOCALE_STORAGE_KEY), false, 'detection is not an explicit user choice');
  assert.equal(updates, 1);
  unsubscribe();
  await controller.setPreference('fr');
  assert.equal(updates, 1);
});

test('stored choice wins over the phone and persists through a new controller', async () => {
  const { controller, storage } = setup({ stored: 'fr' });
  await controller.initialize();
  assert.equal(controller.getSnapshot().locale, 'fr');
  await controller.setPreference('ja');
  const restarted = createLanguageController({ storage, instance: createAppI18n(),
    getDeviceLanguageTags: () => ['fr-FR'], enabledLocales: ['fr', 'ja'] });
  await restarted.initialize();
  assert.equal(restarted.getSnapshot().preference, 'ja');
  assert.equal(restarted.getSnapshot().locale, 'ja');
});

test('phase 2 keeps public UI French while retaining a Japanese preference', async () => {
  const { controller, entries } = setup({ enabledLocales: ['fr'] });
  await controller.initialize();
  await controller.setPreference('ja');
  assert.equal(controller.getSnapshot().locale, 'fr');
  assert.equal(controller.getSnapshot().preference, 'ja');
  assert.equal(controller.getSnapshot().deviceLocale, 'ja');
  assert.equal(entries.get(LOCALE_STORAGE_KEY), 'ja');
});

test('switching FR/JA and resetting preference leaves progress and onboarding untouched', async () => {
  const { controller, entries, calls } = setup({ stored: 'fr' });
  const original = [...entries].filter(([key]) => key !== LOCALE_STORAGE_KEY);
  await controller.setPreference('ja');
  await controller.setPreference('fr');
  await controller.setPreference(null);
  assert.equal(controller.getSnapshot().locale, 'ja');
  assert.equal(entries.has(LOCALE_STORAGE_KEY), false);
  assert.deepEqual([...entries], original);
  assert.ok(calls.every(([, key]) => key === LOCALE_STORAGE_KEY));
});

test('invalid stored choices and read failures do not prevent startup', async () => {
  const invalid = setup({ stored: 'ko' });
  await invalid.controller.initialize();
  assert.equal(invalid.controller.getSnapshot().preference, null);
  const failed = setup({ storageOverrides: { async getItem() { throw new Error('offline storage'); } } });
  await failed.controller.initialize();
  assert.equal(failed.controller.getSnapshot().ready, true);
  assert.equal(failed.errors.length, 1);
  await assert.rejects(failed.controller.setPreference('ko'), /Unsupported/u);
});

test('failed persistence preserves the active choice and allows a later retry', async () => {
  let fail = true;
  const subject = setup({ stored: 'fr', storageOverrides: {
    async setItem() { if (fail) throw new Error('disk full'); },
  } });
  await subject.controller.initialize();
  await assert.rejects(subject.controller.setPreference('ja'), /disk full/u);
  assert.equal(subject.controller.getSnapshot().preference, 'fr');
  assert.equal(subject.instance.language, 'fr');
  fail = false;
  await subject.controller.setPreference('ja');
  assert.equal(subject.instance.language, 'ja');
});

test('concurrent initialization and choices are serialized in request order', async () => {
  const { controller, calls } = setup();
  await Promise.all([controller.initialize(), controller.setPreference('ja'), controller.setPreference('fr')]);
  assert.equal(controller.getSnapshot().locale, 'fr');
  assert.deepEqual(calls.filter(([operation]) => operation === 'set').map(([, , value]) => value), ['ja', 'fr']);
});

test('resolves messages offline in the current language and rejects missing/empty/raw keys', async () => {
  const instance = createAppI18n();
  const reference = { namespace: 'common', key: 'language.french' };
  assert.equal(resolveDisplayMessage(reference, instance), 'Français');
  await instance.changeLanguage('ja');
  assert.equal(resolveDisplayMessage({ namespace: 'common', key: 'language.japanese' }, instance), '日本語');
  instance.addResource('fr', 'common', 'onlyInFrench', 'French fixture');
  instance.options.fallbackLng = ['fr'];
  assert.throws(() => resolveDisplayMessage({ namespace: 'common', key: 'onlyInFrench' }, instance), /Missing display/u);
  instance.addResource('ja', 'common', 'emptyFixture', '');
  assert.throws(() => resolveDisplayMessage({ namespace: 'common', key: 'emptyFixture' }, instance));
  instance.addResource('ja', 'common', 'rawFixture', 'rawFixture');
  assert.throws(() => resolveDisplayMessage({ namespace: 'common', key: 'rawFixture' }, instance), /Invalid display/u);
  assert.throws(() => instance.t('absentFixture'));
});

test('complete messages retain interpolation and locale-specific plurals', async () => {
  const instance = createAppI18n();
  instance.addResourceBundle('fr', 'common', {
    fixture_one: '{{count}} item for {{name}}',
    fixture_many: '{{count}} items for {{name}}',
    fixture_other: '{{count}} items for {{name}}',
  }, true, true);
  instance.addResourceBundle('ja', 'common', { fixture_other: '{{name}}: {{count}} items' }, true, true);
  assert.equal(resolveDisplayMessage({ namespace: 'common', key: 'fixture', values: { count: 2, name: 'A' } }, instance), '2 items for A');
  await instance.changeLanguage('ja');
  assert.equal(resolveDisplayMessage({ namespace: 'common', key: 'fixture', values: { count: 2, name: 'A' } }, instance), 'A: 2 items');
  assert.throws(() => resolveDisplayMessage({ namespace: 'common', key: 'fixture', values: { count: 2 } }, instance), /interpolation/u);
});

test('content resolution uses IDs, keeps exact French and never mutates canonical values', () => {
  const canonical = Object.freeze({ id: 'existing-id', answer: 'Moi', korean: '가', audio: 'unchanged.mp3', nextId: 'next', score: 3 });
  const reference = { module: 'counting', entityId: canonical.id, field: 'speaker' };
  const catalogues = { ...localizedContent, ja: { ...localizedContent.ja, counting: { [canonical.id]: { speaker: 'synthetic localized label' } } } };
  assert.equal(resolveContentText(reference, ' Moi. ', 'fr', catalogues), ' Moi. ');
  assert.equal(resolveContentText(reference, canonical.answer, 'ja', catalogues), 'synthetic localized label');
  assert.equal(canonical.answer, 'Moi');
  assert.throws(() => resolveContentText({ ...reference, field: 'missing' }, canonical.answer, 'ja', catalogues), /Missing content/u);
  assert.throws(() => resolveContentText(reference, canonical.answer, 'ja'), /Missing content/u);
});

test('interpolation parameters cannot override language or translation options', () => {
  const instance = createAppI18n('ja');
  instance.addResource('fr', 'common', 'reservedFixture', 'French fixture');
  instance.addResource('ja', 'common', 'reservedFixture', '{{lng}} / {{ns}}');
  assert.equal(resolveDisplayMessage({ namespace: 'common', key: 'reservedFixture',
    values: { lng: 'fr', ns: 'grammar' } }, instance), 'fr / grammar');
});

test('parity inspects both catalogues and rejects missing keys, empties and invalid structures', () => {
  assert.deepEqual(validateCataloguePair({ a: 'A' }, { a: 'B' }), []);
  assert.match(validateCataloguePair({ a: 'A' }, {}).join('|'), /missing key/u);
  assert.match(validateCataloguePair({}, { extra: 'B' }).join('|'), /missing key/u);
  assert.match(validateCataloguePair({ a: 'A' }, { a: '  ' }).join('|'), /empty text/u);
  assert.match(validateCataloguePair({ a: 'A' }, { a: ['B'] }).join('|'), /expected an object or string/u);
  assert.match(validateCataloguePair({ a: 'A' }, { a: {} }).join('|'), /empty nested object/u);
});

test('parity validates parameters and protected Korean independently of word order', () => {
  assert.deepEqual(validateCataloguePair({ a: '{{name}}: 가 나' }, { a: '나 가 {{ name }}' }), []);
  assert.match(validateCataloguePair({ a: '{{name}}' }, { a: '{{other}}' }).join('|'), /parameters/u);
  assert.match(validateCataloguePair({ a: '{{name}}' }, { a: '{{name}' }).join('|'), /malformed/u);
  assert.match(validateCataloguePair({ a: '가' }, { a: '나' }).join('|'), /Korean/u);
});

test('plural parity uses each language rules rather than requiring identical suffixes', () => {
  const french = { items_one: '{{count}} item', items_many: '{{count}} items', items_other: '{{count}} items' };
  assert.deepEqual(validateCataloguePair(french, { items_other: '{{count}} item' }), []);
  assert.match(validateCataloguePair(french, { items_one: '{{count}} item' }).join('|'), /missing plural form/u);
});

test('date/number helpers format display values without changing timestamps or currency', () => {
  const timestamp = Date.UTC(2026, 10, 5, 16, 30);
  const options = { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' };
  assert.equal(formatDisplayDate(timestamp, 'fr', options), new Intl.DateTimeFormat('fr-FR', options).format(timestamp));
  assert.equal(formatDisplayDate(timestamp, 'ja', options), new Intl.DateTimeFormat('ja-JP', options).format(timestamp));
  assert.equal(formatDisplayNumber(1200, 'ja', { style: 'currency', currency: 'KRW' }), new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'KRW' }).format(1200));
  assert.equal(timestamp, Date.UTC(2026, 10, 5, 16, 30));
});
