import assert from "node:assert/strict";
import { after, before, test } from "node:test";

// Run against Expo's development web server and a dedicated Chromium instance.
// See docs/module-navigation-audit.md for setup. No production test hooks needed.
const appUrl = process.env.KAPP_NAV_TEST_URL ?? "http://127.0.0.1:8084";
const debugUrl = process.env.KAPP_BROWSER_DEBUG_URL ?? "http://127.0.0.1:9224";
let browser;
let page;
let contextId;
const exceptions = [];

class DebugConnection {
  constructor(url) {
    this.pending = new Map();
    this.id = 0;
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        exceptions.push(message.params.exceptionDetails.text);
      }
    });
  }
  async call(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(expression) {
  const result = await page.call("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  });
  assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function until(expression, message, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  assert.fail(`${message}: ${JSON.stringify(await evaluate("({ path: location.pathname, text: document.body.innerText.slice(0, 500) })"))}`);
}

async function expectScreen(path, text) {
  await until(`location.pathname === ${JSON.stringify(path)} && document.body.innerText.includes(${JSON.stringify(text)})`, `Expected ${path}: ${text}`);
  // Catch an immediate redirect after the first successful render.
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await evaluate("location.pathname"), path);
  assert.deepEqual(exceptions, [], "No uncaught render errors");
  assert.equal(await evaluate("window.__kappNavigationDocument"), true, "No document reload");
}

async function clickText(text) {
  const expression = `(() => {
    const node = Array.from(document.querySelectorAll('div')).find(e => e.textContent === ${JSON.stringify(text)} && e.getClientRects().length);
    const pressable = node?.closest('[tabindex]');
    pressable?.click();
    return !!pressable;
  })()`;
  assert.ok(await evaluate(expression), `Visible pressable: ${text}`);
}

async function back() {
  assert.ok(await evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('[role="button"]')).find(e => e.getClientRects().length && /Retour|戻る/u.test(e.getAttribute('aria-label') ?? ''));
    button?.click(); return !!button;
  })()`), "Press the actual AppBackButton");
}

async function changeLanguage(locale) {
  // Mount a small probe using the existing public hook. This runs the real
  // language controller (storage + i18next), without adding app-only test APIs.
  await evaluate(`window.__kappLanguage.setPreference(${JSON.stringify(locale)})`);
  await until(`window.__kappLanguage.locale === ${JSON.stringify(locale)}`, "Language controller updated");
}

before(async () => {
  const version = await (await fetch(`${debugUrl}/json/version`)).json();
  browser = new DebugConnection(version.webSocketDebuggerUrl);
  ({ browserContextId: contextId } = await browser.call("Target.createBrowserContext"));
  const { targetId } = await browser.call("Target.createTarget", { url: "about:blank", browserContextId: contextId });
  const targets = await (await fetch(`${debugUrl}/json/list`)).json();
  page = new DebugConnection(targets.find(({ id }) => id === targetId).webSocketDebuggerUrl);
  await page.call("Runtime.enable");
  await page.call("Page.enable");
  await page.call("Emulation.setDeviceMetricsOverride", { width: 412, height: 915, deviceScaleFactor: 1, mobile: true });
  const { identifier } = await page.call("Page.addScriptToEvaluateOnNewDocument", {
    source: "localStorage.setItem('kapp_onboarding_completed', 'true'); localStorage.setItem('kapp:locale:v1', 'fr');",
  });
  await page.call("Page.navigate", { url: `${appUrl}/(tabs)` });
  await until("typeof __r === 'function' && document.body.innerText.includes('Construis tes bases')", "Main hub mounted", 90000);
  await page.call("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  await evaluate(`(() => {
    window.__kappNavigationDocument = true;
    const load = pattern => __r(Array.from(__r.getModules()).find(([, module]) => pattern.test(module.verboseName))[0]);
    const React = load(/^node_modules\\/react\\/index.js$/);
    const { createRoot } = load(/^node_modules\\/react-dom\\/client.js$/);
    const { useAppLanguage } = load(/lib\\/i18n\\/LanguageProvider.tsx$/);
    const node = document.createElement('div'); document.body.appendChild(node);
    createRoot(node).render(React.createElement(function LanguageProbe() {
      window.__kappLanguage = useAppLanguage(); return null;
    }));
  })()`);
  await until("!!window.__kappLanguage", "Language probe mounted");
}, { timeout: 120000 });

after(async () => {
  if (contextId) await browser.call("Target.disposeBrowserContext", { browserContextId: contextId });
  page?.close();
  browser?.close();
});

test("hub → VocabHub → Premiers pas → back, FR ↔ JA without restarting", async () => {
  await clickText("Vocabulaire");
  await expectScreen("/voc", "COLLECTIONS · VOCABULAIRE");
  await changeLanguage("ja");
  await expectScreen("/voc", "語彙");
  await changeLanguage("fr");
  await clickText("Premiers pas");
  await expectScreen("/voc/basics", "La rencontre");
  await changeLanguage("ja");
  await expectScreen("/voc/basics", "初対面");
  assert.ok(await evaluate("document.body.innerText.includes('안녕하세요! 처음 뵙겠습니다.')"));
  await back();
  await expectScreen("/voc", "語彙");
  await back();
  await expectScreen("/", "Construis tes bases");
  await changeLanguage("fr");
  await clickText("Vocabulaire");
  await expectScreen("/voc", "COLLECTIONS · VOCABULAIRE");
  await back();
  await expectScreen("/", "Construis tes bases");
});

test("hub → ComptageHub → Base → back, FR ↔ JA without restarting", async () => {
  await clickText("Comptage");
  await expectScreen("/comptage", "PARCOURS · COMPTAGE");
  await clickText("Nombres de base");
  await expectScreen("/comptage/base", "Au café");
  await changeLanguage("ja");
  await expectScreen("/comptage/base", "カフェで注文");
  assert.ok(await evaluate("document.body.innerText.includes('아메리카노 세 잔 주세요.')"));
  await back();
  await expectScreen("/comptage", "数字");
  await changeLanguage("fr");
  await expectScreen("/comptage", "PARCOURS · COMPTAGE");
  await back();
  await expectScreen("/", "Construis tes bases");
  await clickText("Comptage");
  await expectScreen("/comptage", "PARCOURS · COMPTAGE");
  await back();
  await expectScreen("/", "Construis tes bases");
});

test("Hangul and Écoute remain accessible from the main hub", async () => {
  await clickText("Hangul");
  await expectScreen("/hangul", "Hangul");
  await back();
  await expectScreen("/", "Construis tes bases");
  await clickText("Écoute");
  await expectScreen("/listen", "Écoute");
  await back();
  await expectScreen("/", "Construis tes bases");
});
