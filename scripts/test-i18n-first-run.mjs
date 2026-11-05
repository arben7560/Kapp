import './i18n-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const { createAppI18n } = await import('../lib/i18n/instance.ts');
const { createLanguageController } = await import('../lib/i18n/languageController.ts');
const { shouldOfferLanguageSelection } = await import('../lib/i18n/firstRun.ts');
const { LOCALE_STORAGE_KEY, ENABLED_UI_LOCALES } = await import('../lib/i18n/config.ts');
const { resources } = await import('../locales/index.ts');

function fixture(tags, stored = null, onboarding = null, account = 'guest') {
  const entries = new Map([
    ['session-fixture', JSON.stringify({ account, token: 'unchanged-fixture' })],
    ['progress-fixture', JSON.stringify({ score: 11, answer: 'Moi', position: 3 })],
  ]);
  if (onboarding !== null) entries.set('kapp_onboarding_completed', onboarding);
  if (stored !== null) entries.set(LOCALE_STORAGE_KEY, stored);
  const writes = [];
  let failWrites = false;
  const storage = {
    async getItem(key) { return entries.get(key) ?? null; },
    async setItem(key, value) {
      if (failWrites) throw new Error('storage unavailable');
      writes.push(key);
      entries.set(key, value);
    },
    async removeItem(key) { writes.push(key); entries.delete(key); },
  };
  const instance = createAppI18n();
  const controller = createLanguageController({ storage, instance, getDeviceLanguageTags: () => tags });
  const shouldOffer = () => shouldOfferLanguageSelection({
    preference: controller.getSnapshot().preference,
    onboardingCompleted: entries.get('kapp_onboarding_completed') === 'true',
  });
  return { entries, writes, storage, instance, controller, shouldOffer, failWrites: (value) => { failWrites = value; } };
}

for (const [tags, expected] of [[['fr-FR'], 'fr'], [['ja-JP'], 'ja'], [['en-US'], 'fr']]) {
  test(`first install ${tags[0]}: detection previews ${expected} without completing onboarding`, async () => {
    const subject = fixture(tags);
    await subject.controller.initialize();
    assert.deepEqual(ENABLED_UI_LOCALES, ['fr', 'ja']);
    assert.equal(subject.controller.getSnapshot().locale, expected);
    assert.equal(subject.controller.getSnapshot().preference, null);
    assert.equal(subject.shouldOffer(), true);
    assert.deepEqual(subject.writes, []);
    await subject.controller.setPreference(expected);
    assert.equal(subject.shouldOffer(), false);
    assert.equal(subject.entries.has('kapp_onboarding_completed'), false);
    assert.deepEqual(subject.writes, [LOCALE_STORAGE_KEY]);
    const restarted = createLanguageController({ storage: subject.storage, instance: createAppI18n(),
      getDeviceLanguageTags: () => ['en-US'] });
    await restarted.initialize();
    assert.equal(restarted.getSnapshot().locale, expected);
    assert.equal(shouldOfferLanguageSelection({ preference: restarted.getSnapshot().preference, onboardingCompleted: false }), false);
  });
}

test('existing completed onboarding skips the selector after update without creating a preference', async () => {
  const subject = fixture(['ja-JP'], null, 'true');
  await subject.controller.initialize();
  assert.equal(subject.shouldOffer(), false);
  assert.equal(subject.entries.has(LOCALE_STORAGE_KEY), false);
  assert.deepEqual(subject.writes, []);
});

test('explicit preference skips the selector even if onboarding is still unfinished', async () => {
  const subject = fixture(['ja-JP'], 'fr', 'false');
  await subject.controller.initialize();
  assert.equal(subject.shouldOffer(), false);
  assert.equal(subject.controller.getSnapshot().locale, 'fr');
});

for (const account of ['guest', 'connected']) {
  test(`account ${account}: FR → JA → FR preserves session, progress and onboarding`, async () => {
    const subject = fixture(['ja-JP'], 'fr', 'true', account);
    const protectedEntries = [...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY);
    await subject.controller.initialize();
    for (const locale of ['ja', 'fr']) {
      await subject.controller.setPreference(locale);
      assert.equal(subject.instance.language, locale);
      assert.equal(subject.controller.getSnapshot().locale, locale);
      assert.equal(subject.shouldOffer(), false);
      assert.deepEqual([...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY), protectedEntries);
    }
    assert.deepEqual(subject.writes, [LOCALE_STORAGE_KEY, LOCALE_STORAGE_KEY]);
  });
}

test('failed confirmation keeps first-run selection pending and can be retried', async () => {
  const subject = fixture(['fr-FR']);
  await subject.controller.initialize();
  subject.failWrites(true);
  await assert.rejects(subject.controller.setPreference('ja'), /storage unavailable/u);
  assert.equal(subject.shouldOffer(), true);
  assert.equal(subject.instance.language, 'fr');
  assert.equal(subject.entries.has('kapp_onboarding_completed'), false);
  subject.failWrites(false);
  await subject.controller.setPreference('ja');
  assert.equal(subject.shouldOffer(), false);
  assert.equal(subject.instance.language, 'ja');
});

function source(path) {
  return ts.createSourceFile(path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
function walk(node, inspect) {
  inspect(node);
  ts.forEachChild(node, (child) => walk(child, inspect));
}
function declaration(file, name) {
  let result;
  walk(file, (node) => { if (ts.isFunctionDeclaration(node) && node.name?.text === name) result = node; });
  assert.ok(result, name);
  return result;
}

test('migrated entry screens contain no uncatalogued UI text except brand and protected Korean', () => {
  const hero = declaration(source('app/index.tsx'), 'HeroEntryScreen');
  for (const root of [hero, source('app/onboarding.tsx')]) {
    walk(root, (node) => {
      if (ts.isJsxText(node) && node.text.trim()) {
        const text = node.text.trim();
        assert.ok(text === '어서 오세요', `Uncatalogued JSX: ${text}`);
      }
      if (ts.isJsxAttribute(node) && ['accessibilityLabel', 'accessibilityHint'].includes(node.name.getText())) {
        assert.ok(!node.initializer || !ts.isStringLiteral(node.initializer), `Uncatalogued accessibility: ${node.getText()}`);
      }
    });
  }
});

test('all literal onboarding translation keys resolve in both languages', () => {
  let count = 0;
  for (const path of ['app/index.tsx', 'app/onboarding.tsx']) {
    walk(source(path), (node) => {
      if (!ts.isCallExpression(node) || node.expression.getText() !== 't' || !ts.isStringLiteral(node.arguments[0])) return;
      const key = node.arguments[0].text;
      for (const locale of ['fr', 'ja']) {
        const text = key.split('.').reduce((object, part) => object?.[part], resources[locale].onboarding);
        assert.equal(typeof text, 'string', `${locale}: ${key}`);
        assert.ok(text.trim().length);
      }
      count++;
    });
  }
  assert.ok(count >= 25);
});

test('canonical scenes preserve all four Korean phrases and both navigation modes', () => {
  const file = source('app/onboarding.tsx');
  const values = {};
  walk(file, (node) => {
    if (ts.isVariableDeclaration(node) && ['SCENES', 'ROUTES'].includes(node.name.getText())) {
      values[node.name.getText()] = node.initializer;
    }
  });
  const scenes = values.SCENES.elements;
  assert.deepEqual(scenes.map((scene) => Object.fromEntries(scene.properties.filter(ts.isPropertyAssignment)
    .filter((property) => ['key', 'phrase'].includes(property.name.getText()))
    .map((property) => [property.name.getText(), property.initializer.text]))), [
    { key: 'cafe', phrase: '아메리카노 한 잔 주세요' },
    { key: 'metro', phrase: '2호선은 어디예요?' },
    { key: 'restaurant', phrase: '이거 주세요' },
    { key: 'airport', phrase: '지하철은 어디예요?' },
  ]);
  const routes = Object.fromEntries(values.ROUTES.properties.map((scene) => [scene.name.getText(),
    Object.fromEntries(scene.initializer.properties.map((mode) => [mode.name.getText(), mode.initializer.text]))]));
  assert.deepEqual(routes, {
    cafe: { text: '/lesson/cafe', guided: '/lesson/cafeMissions' },
    metro: { text: '/lesson/metro', guided: '/lesson/metroMissions' },
    restaurant: { text: '/lesson/restaurant', guided: '/lesson/restaurantMissions' },
    airport: { text: '/lesson/airport', guided: '/lesson/aeroportMissions' },
  });
});

test('selector is mounted only by the logo entry; auth and return navigation keep their guards', () => {
  const root = source('app/_layout.tsx').getText();
  assert.ok(!root.includes('LanguageSelectionScreen'));
  assert.ok(root.includes('AUTH_ONBOARDING_BYPASS_ACTIONS'));
  const entry = source('app/index.tsx').getText();
  assert.match(entry, /if \(showHero\)[\s\S]*shouldOfferLanguageSelection/u);
  for (const path of ['components/language-selection-screen.tsx', 'components/application-language-settings.tsx']) {
    const text = source(path).getText();
    assert.ok(!/router\.|ONBOARDING_KEY|useAuth|resetProgress|signOut|key=\{locale\}/u.test(text), path);
    assert.match(text, /await setPreference\(/u);
  }
});

test('account language settings are outside guest/connected conditions', () => {
  const file = source('app/account/index.tsx');
  let found = false;
  walk(file, (node) => {
    if (!ts.isJsxSelfClosingElement(node) || node.tagName.getText() !== 'ApplicationLanguageSettings') return;
    found = true;
    let parent = node.parent;
    while (parent) {
      assert.ok(!ts.isConditionalExpression(parent) && !ts.isBinaryExpression(parent), 'settings hidden by a condition');
      parent = parent.parent;
    }
  });
  assert.equal(found, true);
});
