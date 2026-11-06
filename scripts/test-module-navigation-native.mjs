import assert from "node:assert/strict";
import { after, before, test } from "node:test";
// ws is supplied by the installed Expo/Metro tooling; no app test API is added.
import WebSocket from "ws";

const metroUrl = process.env.KAPP_NATIVE_TEST_URL ?? "http://127.0.0.1:8085";
let socket;
let sequence = 0;
const pending = new Map();
let navigatorKeys;
let helperMounted = false;

function call(method, params = {}, timeout = 20000) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, timeout);
    pending.set(id, {
      resolve: (result) => { clearTimeout(timer); resolve(result); },
      reject: (error) => { clearTimeout(timer); reject(error); },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true }).catch((error) => {
    throw new Error(`${error.message}: ${expression.slice(0, 180)}`, { cause: error });
  });
  assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function until(expression, message) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.fail(`${message}: ${JSON.stringify(await evaluate("__kappNativeNavigation.chain()"))}`);
}

async function expectScreen(routes, component) {
  const expected = JSON.stringify(routes);
  await until(`JSON.stringify(__kappNativeNavigation.chain().map(r => r.route)) === JSON.stringify(${expected}) && __kappNativeNavigation.find(${JSON.stringify(component)}) !== null`, `Mounted ${component} on ${routes.join("/")}`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const chain = await evaluate("__kappNativeNavigation.chain()");
  assert.deepEqual(chain.map(({ route }) => route), routes, "No spontaneous replacement after render");
  assert.deepEqual(chain.slice(0, 3).map(({ key }) => key), navigatorKeys, "Parent navigators remain mounted");
}

async function press(scope, label) {
  assert.ok(await evaluate(`__kappNativeNavigation.press(${JSON.stringify(scope)}, ${JSON.stringify(label)})`), `${scope}: ${label}`);
}

async function language(locale) {
  await evaluate(`__kappNativeNavigation.changeLanguage(${JSON.stringify(locale)})`);
  await until(`__kappNativeNavigation.locale === ${JSON.stringify(locale)}`, "i18next languageChanged completed");
}

before(async () => {
  let targets = [];
  const deadline = Date.now() + 15000;
  while (!targets.length && Date.now() < deadline) {
    targets = await (await fetch(`${metroUrl}/json/list`)).json();
    if (!targets.length) await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const appId = process.env.KAPP_NATIVE_TEST_APP_ID;
  assert.ok(appId || targets.length <= 1, "Set KAPP_NATIVE_TEST_APP_ID when several native runtimes are connected");
  const target = appId ? targets.find((entry) => entry.appId === appId) : targets[0];
  assert.ok(target, "Open the test development build in Metro first");
  socket = new WebSocket(target.webSocketDebuggerUrl, { origin: metroUrl });
  await new Promise((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); });
  socket.on("message", (data) => {
    const message = JSON.parse(String(data));
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  await call("Runtime.enable", {}, 60000);
  await evaluate(`(() => {
    const load = pattern => __r(Array.from(__r.getModules()).find(([, module]) => pattern.test(module.verboseName))[0]);
    const navigationRef = load(/global-state\\/navigationRef.js$/).navigationRef;
    const i18n = load(/lib\\/i18n\\/instance.ts$/).appI18n;
    const name = f => f.type?.name ?? f.type?.render?.name;
    function walk(fiber, predicate) {
      if (!fiber) return null;
      if (predicate(fiber)) return fiber;
      return walk(fiber.child, predicate) ?? walk(fiber.sibling, predicate);
    }
    function find(component) {
      for (const renderer of __REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.keys()) {
        for (const root of __REACT_DEVTOOLS_GLOBAL_HOOK__.getFiberRoots(renderer)) {
          const match = walk(root.current, f => name(f) === component);
          if (match) return match;
        }
      }
      return null;
    }
    globalThis.__kappNativeNavigation = {
      find,
      locale: null,
      ready() {
        return find('OAuthNavigationDiagnostics') !== null && load(/expo-router\\/build\\/exports.js$/).router.push.name !== 'throwBeforeFirstRender';
      },
      initialize() {
        const storage = load(/async-storage.*\\/src\\/index.ts$/).default;
        storage.setItem('kapp_onboarding_completed', 'true').then(() => load(/expo-router\\/build\\/exports.js$/).router.dismissTo('/(tabs)'));
      },
      text(component) {
        const screen = find(component); const values = [];
        if (screen) walk(screen.child, f => { if (f.tag === 6) values.push(f.memoizedProps); return false; });
        return values.join(' ');
      },
      chain() {
        let state = navigationRef.getRootState(); const result = [];
        while (state) { const route = state.routes[state.index]; result.push({ route: route.name, key: state.key }); state = route.state; }
        return result;
      },
      press(scope, label) {
        const screen = find(scope); if (!screen) return false;
        const button = walk(screen.child, f => name(f) === 'Pressable' && f.memoizedProps.accessibilityLabel?.includes(label) && typeof f.memoizedProps.onPress === 'function');
        if (!button) return false;
        button.memoizedProps.onPress(); return true;
      },
      changeLanguage(locale) {
        this.locale = null;
        i18n.changeLanguage(locale).then(() => { this.locale = locale; });
      },
    };
  })()`);
  helperMounted = true;
  await until("__kappNativeNavigation.ready()", "Fonts and root navigator ready; close the native developer menu first");
  await evaluate("__kappNativeNavigation.initialize()");
  await until("__kappNativeNavigation.chain().at(-1).route === 'index' && __kappNativeNavigation.chain().length === 3", "Return to the main hub");
  navigatorKeys = (await evaluate("__kappNativeNavigation.chain()")).map(({ key }) => key);
  await language("fr");
}, { timeout: 120000 });

after(async () => {
  if (socket?.readyState === WebSocket.OPEN) {
    try { if (helperMounted) await evaluate("delete globalThis.__kappNativeNavigation"); }
    finally { socket.terminate(); }
  }
});

const main = ["__root", "(tabs)", "index"];
const moduleRoutes = (module, screen = "index") => ["__root", "(tabs)", module, screen];

test("native mounted hub handlers open VocabHub, Premiers pas, and return in FR/JA", async () => {
  await press("Home", "Vocabulaire.");
  await expectScreen(moduleRoutes("voc"), "VocabHub");
  await press("VocabHub", "Premiers pas.");
  await expectScreen(moduleRoutes("voc", "basics"), "FirstStepsImmersion");
  assert.ok((await evaluate("__kappNativeNavigation.text('FirstStepsImmersion')")).includes("La rencontre"));
  await language("ja");
  await expectScreen(moduleRoutes("voc", "basics"), "FirstStepsImmersion");
  assert.ok((await evaluate("__kappNativeNavigation.text('FirstStepsImmersion')")).includes("初対面"));
  await press("FirstStepsImmersion", "戻る");
  await expectScreen(moduleRoutes("voc"), "VocabHub");
  await press("VocabHub", "戻る");
  await expectScreen(main, "Home");
  await language("fr");
  await press("Home", "Vocabulaire.");
  await expectScreen(moduleRoutes("voc"), "VocabHub");
  await press("VocabHub", "Retour");
  await expectScreen(main, "Home");
});

test("native mounted hub handlers open ComptageHub, Base, and return in FR/JA", async () => {
  await press("Home", "Comptage.");
  await expectScreen(moduleRoutes("comptage"), "ComptageHub");
  await press("ComptageHub", "Nombres de base.");
  await expectScreen(moduleRoutes("comptage", "base"), "NativeNumbersImmersion");
  assert.ok((await evaluate("__kappNativeNavigation.text('NativeNumbersImmersion')")).includes("Au café"));
  await language("ja");
  await expectScreen(moduleRoutes("comptage", "base"), "NativeNumbersImmersion");
  assert.ok((await evaluate("__kappNativeNavigation.text('NativeNumbersImmersion')")).includes("カフェで注文"));
  await press("NativeNumbersImmersion", "戻る");
  await expectScreen(moduleRoutes("comptage"), "ComptageHub");
  await press("ComptageHub", "戻る");
  await expectScreen(main, "Home");
  await language("fr");
  await press("Home", "Comptage.");
  await expectScreen(moduleRoutes("comptage"), "ComptageHub");
  await press("ComptageHub", "Retour");
  await expectScreen(main, "Home");
});

test("native Hangul and Écoute still open and return", async () => {
  for (const [label, route, component] of [["Hangul.", "hangul/index", "HangulHub"], ["Écoute.", "listen", "ListenScreen"]]) {
    await press("Home", label);
    await expectScreen(["__root", "(tabs)", route], component);
    await press(component, "Retour");
    await expectScreen(main, "Home");
  }
});
