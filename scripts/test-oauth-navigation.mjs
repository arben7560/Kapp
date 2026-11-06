import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

import * as authCallback from "../lib/authCallback.ts";
import { createNavigationHarness } from "./helpers/oauth-navigation-harness.mjs";
import { isPremiumRoutePath } from "../lib/paywall/config.ts";

function evaluate(code, mocks) {
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => {
    assert.ok(name in mocks, `Unexpected dependency: ${name}`);
    return mocks[name];
  }, module, module.exports);
  return module.exports;
}
const source = await readFile(new URL("../app/+native-intent.tsx", import.meta.url), "utf8");
const nativeIntent = evaluate(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { "../lib/authCallback": authCallback });
const linkingCode = await readFile(new URL("../node_modules/expo-router/build/link/linking.js", import.meta.url), "utf8");

// Exercise the installed Router's actual Linking.subscribe implementation. Only
// native URL delivery and imports unused by the warm-link path are adapted.
function subscribeToRouter(intent, listener) {
  let receive;
  const { subscribe } = evaluate(linkingCode, {
    "expo-linking": { addEventListener: (_event, fn) => { receive = fn; return { remove() {} }; } },
    "../environment": { isExpoGo: false },
    "../fork/extractPathFromURL": {},
    "../fork/getInitialURLWithTimeout": {},
    "../fork/getPathFromState": {},
    "../fork/getStateFromPath": {},
    "../getRoutesRedirects": { applyRedirects: (url) => url },
  });
  subscribe(intent, [])(listener);
  return (url) => receive({ url });
}

test("the installed Router forwards raw auth callbacks without a native-intent filter", async () => {
  const forwarded = [];
  await subscribeToRouter(undefined, (href) => forwarded.push(href))("kapp://account?code=SECRET_CODE&action=oauth-login-google");
  assert.equal(forwarded.length, 1);
  assert.match(forwarded[0], /SECRET_CODE/u);
});

test("warm OAuth, recovery and duplicate callbacks leave the navigator state untouched", async () => {
  const nav = createNavigationHarness();
  nav.assertModulesRemainAccessible();
  nav.push("/account");
  const before = nav.state;
  const forwarded = [];
  const emit = subscribeToRouter(nativeIntent, (href) => forwarded.push(href));
  for (const url of [
    "kapp://account?code=SECRET_CODE&action=oauth-login-google",
    "kapp://account?action=oauth-login-google&code=SECRET_CODE",
    "kapp://account?code=SECRET_RECOVERY&action=recovery",
    "kapp://account#access_token=SECRET_ACCESS&refresh_token=SECRET_REFRESH",
    "kapp://account#access_token=SECRET_PARTIAL",
    "kapp://account?error=access_denied&error_description=SECRET_ERROR",
  ]) await emit(url);
  assert.deepEqual(forwarded, []);
  assert.strictEqual(nav.state, before);
  assert.equal(nav.pathname(), "/account");
  nav.assertModulesRemainAccessible();
});

test("cold callbacks keep the auth action but remove all credentials from route state", () => {
  for (const action of ["oauth-login-google", "oauth-link-apple", "protect", "recovery"]) {
    assert.equal(nativeIntent.redirectSystemPath({ path: `kapp://account?code=SECRET_CODE&action=${action}#access_token=SECRET_TOKEN`, initial: true }), `/account?action=${action}`);
  }
  assert.equal(nativeIntent.redirectSystemPath({ path: "kapp://account?code=SECRET_CODE&action=unknown", initial: true }), "/account");
});

test("ordinary module, profile and external links retain their navigation behavior", async () => {
  const forwarded = [];
  const emit = subscribeToRouter(nativeIntent, (href) => forwarded.push(href));
  const urls = ["kapp://voc", "kapp://comptage/base", "kapp://account", "kapp://account?action=protect", "kapp://lesson/cafe?code=ordinary", "other://account?code=ordinary", "invalid"];
  for (const url of urls) await emit(url);
  assert.deepEqual(forwarded, urls);
});

test("entitlement checks never remove the root navigator during an identity transition", async () => {
  const effects = [];
  const replacements = [];
  let pathname = "/voc";
  let paywall = { isLoading: false, hasPremiumAccess: false };
  const react = { createElement: (type, props, ...children) => ({ type, props, children }), useEffect: (fn) => effects.push(fn) };
  const guardSource = await readFile(new URL("../lib/paywall/SubscriptionAccessGuard.tsx", import.meta.url), "utf8");
  const { SubscriptionAccessGuard } = evaluate(ts.transpileModule(guardSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText, {
    react,
    "expo-router": { usePathname: () => pathname, router: { replace: (href) => replacements.push(href) } },
    "react-native": { View: "View", ActivityIndicator: "ActivityIndicator", StyleSheet: { create: (value) => value, absoluteFillObject: {} } },
    "./config": { DEV_UNLOCK_ALL: false, isPremiumRoutePath },
    "./PaywallProvider": { usePaywall: () => paywall },
  });
  const navigator = { type: "ROOT_NAVIGATOR" };
  const contains = (node) => node === navigator || node?.children?.some(contains);
  for (pathname of ["/voc", "/comptage", "/voc/kdrama", "/comptage/heures"]) {
    for (paywall of [{ isLoading: true, hasPremiumAccess: false }, { isLoading: false, hasPremiumAccess: false }, { isLoading: false, hasPremiumAccess: true }]) {
      assert.ok(contains(SubscriptionAccessGuard({ children: navigator })), `${pathname}: navigator must remain mounted`);
      effects.splice(0).forEach((effect) => effect());
    }
  }
  assert.deepEqual(replacements, ["/premium", "/premium"]);
});
