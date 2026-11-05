import './i18n-node-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jsx, jsxs } from 'react/jsx-runtime';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
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
    assert.equal(shouldOfferLanguageSelection({ preference: restarted.getSnapshot().preference }), false);
  });
}

test('existing completed onboarding still requires explicit language confirmation after update', async () => {
  const subject = fixture(['ja-JP'], null, 'true');
  await subject.controller.initialize();
  assert.equal(subject.shouldOffer(), true);
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

// Execute the real component bodies with hook/native adapters. Animation completion
// is controlled explicitly, so routing cannot accidentally pass before the logo ends.
function mountComponent(path, name, dependencies) {
  const slots = [];
  const cleanups = [];
  let cursor = 0;
  let effects = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = value; }];
    },
    useMemo(factory, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        slots[index] = { value: factory(), deps };
      }
      return slots[index].value;
    },
    useRef(initial) { return hooks.useMemo(() => ({ current: initial }), []); },
    useEffect(effect, deps) {
      hooks.useMemo(() => { effects.push(effect); }, deps);
    },
  };
  const bindings = { ...hooks, styles: {}, ...dependencies };
  const code = ts.transpileModule(declaration(source(path), name).getText(), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  const declaredComponent = new Function('require', 'exports', ...Object.keys(bindings), `${code}\nreturn ${name};`)(
    (id) => { assert.equal(id, 'react/jsx-runtime'); return { jsx, jsxs }; },
    exports, ...Object.values(bindings),
  );
  const component = exports.default ?? exports[name] ?? declaredComponent;
  return {
    async render(props = {}) {
      cursor = 0;
      const tree = component(props);
      const pending = effects;
      effects = [];
      pending.forEach((effect) => {
        const cleanup = effect();
        if (cleanup) cleanups.push(cleanup);
      });
      await setImmediate();
      return tree;
    },
    unmount() { cleanups.splice(0).reverse().forEach((cleanup) => cleanup()); },
  };
}

function mountEntry(subject, reducedMotion = false) {
  let complete;
  const animation = () => ({ start(callback) { complete = callback; }, stop() {} });
  const entry = mountComponent('app/index.tsx', 'SplashScreenPage', {
    AsyncStorage: subject.storage,
    useAppLanguage: subject.controller.getSnapshot,
    useWindowDimensions: () => ({ width: 360, height: 800 }),
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    AccessibilityInfo: { isReduceMotionEnabled: async () => reducedMotion },
    Animated: {
      Value: class { setValue() {} },
      timing: animation, spring: animation, delay: animation, parallel: animation, sequence: animation,
    },
    Easing: { out: (value) => value, inOut: (value) => value },
    setTimeout(callback, delay) { assert.equal(delay, 900); complete = () => callback(); return 1; },
    clearTimeout() {},
    View: 'logo', StatusBar: 'StatusBar', AnimatedView: 'AnimatedView', KSymbol: 'KSymbol', Text: 'Text',
    LanguageSelectionScreen: 'selector', HeroEntryScreen: 'welcome', Redirect: 'redirect',
    shouldOfferLanguageSelection,
  });
  return { ...entry, finishLogo: (finished = true) => complete({ finished }) };
}

for (const [locale, onboarding] of ['fr', 'ja'].flatMap((locale) =>
  [null, 'false', 'true'].map((onboarding) => [locale, onboarding]))) {
  for (const reducedMotion of [false, true]) {
    test(`startup ${locale}, onboarding=${onboarding}, reducedMotion=${reducedMotion}: logo, selection, welcome, relaunch`, async () => {
      const subject = fixture(['ja-JP'], null, onboarding);
      const protectedEntries = [...subject.entries];
      await subject.controller.initialize();
      const entry = mountEntry(subject, reducedMotion);
      assert.equal((await entry.render()).type, 'logo');
      assert.equal((await entry.render()).type, 'logo');
      if (!reducedMotion) {
        entry.finishLogo(false);
        assert.equal((await entry.render()).type, 'logo');
      }
      entry.finishLogo();
      assert.equal((await entry.render()).type, 'selector');
      assert.equal((await entry.render()).type, 'selector');
      assert.deepEqual(subject.writes, []);

      await subject.controller.setPreference(locale);
      const destination = await entry.render();
      assert.equal(destination.type, 'welcome');
      assert.equal(destination.props.onboardingCompleted, onboarding === 'true');
      assert.deepEqual([...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY), protectedEntries);
      assert.deepEqual(subject.writes, [LOCALE_STORAGE_KEY]);
      entry.unmount();

      const restarted = createLanguageController({ storage: subject.storage, instance: createAppI18n(),
        getDeviceLanguageTags: () => ['fr-FR'] });
      await restarted.initialize();
      const reopened = mountEntry({ ...subject, controller: restarted }, reducedMotion);
      assert.equal((await reopened.render()).type, 'logo');
      reopened.finishLogo();
      assert.equal((await reopened.render()).type, destination.type);
      assert.equal(restarted.getSnapshot().locale, locale);
      reopened.unmount();
    });
  }
}

function elements(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => elements(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...elements(tree.props?.children, predicate)];
}

function translation(subject) {
  return (namespace, options) => ({
    t: subject.instance.getFixedT(options?.lng ?? subject.controller.getSnapshot().locale, namespace),
    i18n: subject.instance,
  });
}

function mountWelcome(subject) {
  const navigations = [];
  let complete;
  const animation = () => ({ start() {}, stop() {} });
  const welcome = mountComponent('app/index.tsx', 'HeroEntryScreen', {
    __DEV__: false,
    useTranslation: translation(subject),
    useWindowDimensions: () => ({ width: 360, height: 800, fontScale: 1 }),
    Animated: {
      Value: class { interpolate() { return 0; } },
      parallel: animation, loop: animation, timing: animation, delay: animation,
      sequence: () => ({ start(callback) { complete = callback; }, stop() {} }),
    },
    Easing: { out: (value) => value, inOut: (value) => value },
    router: { replace: (path) => navigations.push(path) },
    View: 'View', StatusBar: 'StatusBar', HeroBackground: 'HeroBackground', SafeAreaView: 'SafeAreaView',
    AnimatedView: 'AnimatedView', ScrollView: 'ScrollView', AppText: 'AppText', BlurView: 'BlurView',
    ExpoLinearGradient: 'ExpoLinearGradient', StyleSheet: {}, Pressable: 'Pressable',
  });
  return { ...welcome, navigations, finishTransition: (finished = true) => complete({ finished }) };
}

for (const locale of ['fr', 'ja']) {
  for (const onboarding of [null, 'false', 'true']) {
    test(`${locale}, onboarding=${onboarding}: real selector confirmation, translated welcome, explicit continuation`, async () => {
      const subject = fixture(['fr-FR'], null, onboarding);
      await subject.controller.initialize();
      const protectedEntries = [...subject.entries];
      const selector = mountComponent('components/language-selection-screen.tsx', 'LanguageSelectionScreen', {
        useAppLanguage: () => ({ ...subject.controller.getSnapshot(), setPreference: subject.controller.setPreference }),
        useTranslation: translation(subject),
        AccessibilityInfo: { isReduceMotionEnabled: async () => true },
        Animated: { Value: class { setValue() {} }, timing: () => ({ start() {}, stop() {} }), View: 'AnimatedView' },
        LinearGradient: 'LinearGradient', StatusBar: 'StatusBar', SafeAreaView: 'SafeAreaView', ScrollView: 'ScrollView',
        View: 'View', Globe2: 'Globe2', AppText: 'AppText', LanguageChoices: 'choices', Pressable: 'Pressable',
        MoveRight: 'MoveRight', StyleSheet: {},
      });
      let tree = await selector.render();
      elements(tree, (el) => el.type === 'choices')[0].props.onSelect(locale);
      tree = await selector.render();
      assert.equal(subject.shouldOffer(), true, 'preview is not confirmation');
      assert.deepEqual(subject.writes, []);
      elements(tree, (el) => el.type === 'Pressable')[0].props.onPress();
      await setImmediate();
      assert.equal(subject.shouldOffer(), false);
      assert.equal(subject.entries.get(LOCALE_STORAGE_KEY), locale);
      selector.unmount();

      const welcome = mountWelcome(subject);
      tree = await welcome.render({ onboardingCompleted: onboarding === 'true' });
      assert.ok(elements(tree, (el) => el.props?.children === resources[locale].onboarding.hero.welcome).length);
      assert.deepEqual(welcome.navigations, [], 'welcome must remain visible until the user continues');
      const button = elements(tree, (el) => el.type === 'Pressable')[0];
      assert.equal(button.props.accessibilityLabel, onboarding === 'true'
        ? resources[locale].onboarding.flow.hubLabel : resources[locale].onboarding.hero.choose);
      button.props.onPress();
      assert.deepEqual(welcome.navigations, [], 'wait for the existing transition');
      welcome.finishTransition();
      assert.deepEqual(welcome.navigations, [onboarding === 'true' ? '/(tabs)' : '/onboarding']);
      assert.deepEqual([...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY), protectedEntries);
      welcome.unmount();
    });
  }
}

for (const locale of ['fr', 'ja']) {
  for (const onboarding of [null, 'true']) {
    test(`previously confirmed ${locale}, onboarding=${onboarding}: logo then welcome without selector`, async () => {
      const subject = fixture(['ja-JP'], locale, onboarding);
      await subject.controller.initialize();
      const entry = mountEntry(subject);
      assert.equal((await entry.render()).type, 'logo');
      entry.finishLogo();
      const tree = await entry.render();
      assert.equal(tree.type, 'welcome');
      assert.equal(tree.props.onboardingCompleted, onboarding === 'true');
      assert.deepEqual(subject.writes, []);
      entry.unmount();
    });
  }
}

test('a slow onboarding read cannot delay the selector after the logo', async () => {
  const subject = fixture(['fr-FR']);
  await subject.controller.initialize();
  let resolveRead;
  subject.storage.getItem = () => new Promise((resolve) => { resolveRead = resolve; });
  const entry = mountEntry(subject);
  await entry.render();
  entry.finishLogo();
  assert.equal((await entry.render()).type, 'selector');
  await subject.controller.setPreference('fr');
  assert.equal((await entry.render()).type, 'logo', 'wait for continuation state before enabling welcome');
  resolveRead('true');
  await setImmediate();
  assert.equal((await entry.render()).type, 'welcome');
  entry.unmount();
});

test('an unreadable onboarding flag preserves selector and welcome without forcing onboarding again', async () => {
  const subject = fixture(['fr-FR']);
  await subject.controller.initialize();
  subject.storage.getItem = async () => { throw new Error('storage unavailable'); };
  const entry = mountEntry(subject);
  await entry.render();
  entry.finishLogo();
  assert.equal((await entry.render()).type, 'selector');
  await subject.controller.setPreference('ja');
  const tree = await entry.render();
  assert.equal(tree.type, 'welcome');
  assert.equal(tree.props.onboardingCompleted, true);
  entry.unmount();
});

test('closing before confirmation keeps the selector pending on the next launch', async () => {
  const subject = fixture(['fr-FR'], null, 'true');
  for (let launch = 0; launch < 2; launch++) {
    const controller = createLanguageController({ storage: subject.storage, instance: createAppI18n(),
      getDeviceLanguageTags: () => ['fr-FR'] });
    await controller.initialize();
    const entry = mountEntry({ ...subject, controller });
    await entry.render();
    entry.finishLogo();
    assert.equal((await entry.render()).type, 'selector');
    entry.unmount();
  }
  assert.deepEqual(subject.writes, []);
});

test('account component changes and persists language without changing user data', async () => {
  const subject = fixture(['fr-FR'], 'fr', 'true', 'connected');
  await subject.controller.initialize();
  const protectedEntries = [...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY);
  const settings = mountComponent('components/application-language-settings.tsx', 'ApplicationLanguageSettings', {
    useAppLanguage: () => ({ ...subject.controller.getSnapshot(), setPreference: subject.controller.setPreference }),
    useTranslation: () => ({ t: (key) => key }), View: 'View', AppText: 'AppText', LanguageChoices: 'choices',
  });
  for (const locale of ['ja', 'fr']) {
    const tree = await settings.render();
    await tree.props.children.find((child) => child?.type === 'choices').props.onSelect(locale);
    await setImmediate();
    const updated = await settings.render();
    assert.equal(updated.props.children.find((child) => child?.type === 'choices').props.value, locale);
    assert.equal(subject.entries.get(LOCALE_STORAGE_KEY), locale);
    assert.deepEqual([...subject.entries].filter(([key]) => key !== LOCALE_STORAGE_KEY), protectedEntries);
  }
});

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
